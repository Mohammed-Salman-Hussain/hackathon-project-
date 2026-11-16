import { LOOPS } from '@/lib/loops';
import {
  C,
  biogasKw,
  biogasM3,
  clamp,
  clogRisk,
  demandCurve,
  demandLpm,
  feederLoadPct,
  pitOpenFactor,
  rechargeL,
  rupeesSaved,
  solarKw,
  tankersAvoided,
  wetWasteKgPerDay,
} from './formulas';
import { SCENARIOS } from './scenarios';
import type {
  Drain,
  Effects,
  Hub,
  HubState,
  LocalityData,
  LoopId,
  LoopScore,
  Mode,
  PumpSource,
  Scenario,
  ScenarioId,
  SimSnapshot,
  Totals,
} from './types';
import { NO_EFFECTS } from './types';

/** Simulation step, minutes. A day is 288 steps. */
export const STEP = 5;
export const STEPS_PER_DAY = 1440 / STEP;

export interface DayInput {
  data: LocalityData;
  scenario: ScenarioId;
  mode: Mode;
  effects?: Effects;
}

export interface DayTimeline {
  scenario: ScenarioId;
  mode: Mode;
  /** One snapshot per step, index = minute ÷ 5; the last index is the end of the day. */
  steps: SimSnapshot[];
}

/** Section names that lose power, with their hours, for one scenario in one locality. */
export function resolveOutages(scenario: Scenario, data: LocalityData) {
  return scenario.outages.map((o) => ({
    ...o,
    section: data.feeders[o.feederIndex % data.feeders.length]!.section,
    endHour: o.startHour + o.hours,
  }));
}

/** Heaviest rain in the `hours` after `hour`, mm/h. */
export function rainAhead(scenario: Scenario, hour: number, hours = 6): number {
  let max = 0;
  for (let h = hour; h <= Math.min(24, hour + hours); h += STEP / 60) max = Math.max(max, scenario.rainMmPerHour(h));
  return max;
}

/** First hour of the day with rain of at least `mm` mm/h, or null. */
export function firstRainHour(scenario: Scenario, mm = 1): number | null {
  for (let i = 0; i < STEPS_PER_DAY; i++) {
    const h = (i * STEP) / 60;
    if (scenario.rainMmPerHour(h) >= mm) return h;
  }
  return null;
}

export function drainRiskAt(
  drain: Drain,
  scenario: Scenario,
  hour: number,
  opts: { cleared: boolean; wasteKeptOut: number },
): number {
  return clogRisk({
    rainAheadMmPerHour: rainAhead(scenario, hour),
    hotspotProximity: drain.hotspotProximity * (opts.cleared ? 0.3 : 1) * (1 - opts.wasteKeptOut),
    daysSinceClean: opts.cleared ? 0 : drain.daysSinceClean,
    complaints: opts.cleared ? 0 : drain.complaints,
    narrowing: opts.cleared ? 1 + (drain.designWidthM / drain.widthM - 1) * 0.5 : drain.designWidthM / drain.widthM,
  });
}

interface HubRun {
  hub: Hub;
  tankL: number;
  sumpL: number;
  biogasKwhLeft: number;
  biogasKwNow: number;
  latch: boolean;
  prevOutflowL: number;
  cleanKwh: number;
  s: HubState;
}

const blank = (hubId: string): HubState => ({
  hubId,
  solarKw: 0,
  biogasKw: 0,
  pumpOn: false,
  pumpSource: 'off',
  tankPct: 0,
  sumpPct: 0,
  gridUp: true,
  waterOn: true,
  stpRunning: true,
  cleanShare: 0,
  demandL: 0,
  stpInflowL: 0,
  stpOutflowL: 0,
  reuseL: 0,
  rechargeTopUpL: 0,
  stpSurplusL: 0,
  rechargeL: 0,
  wasteWetKg: 0,
  wasteDivertedKg: 0,
  kwhShifted: 0,
  gridKwh: 0,
  minutesWithoutWater: 0,
  tankerTrips: 0,
  tankersAvoided: 0,
  rupeesSaved: 0,
});

const round1 = (x: number) => Math.round(x * 10) / 10;

/**
 * Runs one full day for a locality and returns a snapshot for every 5 minutes.
 * Pure and deterministic: same input, same output.
 */
export function simulateDay({ data, scenario: scenarioId, mode, effects = NO_EFFECTS }: DayInput): DayTimeline {
  const scenario = SCENARIOS[scenarioId];
  const withLoop = mode === 'with';
  // Tankers avoided are counted against the same day run the usual way.
  const usual = withLoop ? usualDay(data, scenarioId) : null;
  const all = withLoop && !!effects.all;
  const done = (list: string[], id: string) => withLoop && (all || list.includes(id));
  const outages = resolveOutages(scenario, data);
  const dtH = STEP / 60;
  const stormHour = firstRainHour(scenario, 20);

  const avgSeg = data.hubs.reduce((a, h) => a + h.segregationScore, 0) / Math.max(1, data.hubs.length) / 100;
  const wasteKeptOut = withLoop ? 0.25 * avgSeg : 0;

  // Drains that would be cleared if every recommendation were carried out.
  const autoCleared = new Set<string>();
  if (all) {
    for (const d of data.drains) {
      for (let i = 0; i < STEPS_PER_DAY; i += 6) {
        if (drainRiskAt(d, scenario, (i * STEP) / 60, { cleared: false, wasteKeptOut }) >= 45) {
          autoCleared.add(d.id);
          break;
        }
      }
    }
  }
  const isCleared = (id: string) => withLoop && (autoCleared.has(id) || effects.clearedDrains.includes(id));

  const runs: HubRun[] = data.hubs.map((hub) => {
    const seg = hub.segregationScore + (done(effects.wasteCollected, hub.id) ? 15 : 0);
    const m3 = withLoop ? biogasM3(hub.biogasM3PerDay, scenario.wasteFactor, seg) : 0;
    return {
      hub,
      tankL: hub.tankKl * 1000 * 0.6,
      sumpL: hub.sumpKl * 1000 * 0.12,
      biogasKwhLeft: m3 * C.BIOGAS_KWH_PER_M3,
      biogasKwNow: biogasKw(m3),
      latch: false,
      prevOutflowL: 0,
      cleanKwh: 0,
      s: blank(hub.id),
    };
  });

  let floodedEver = new Set<string>();
  const steps: SimSnapshot[] = [];

  for (let i = 0; i <= STEPS_PER_DAY; i++) {
    const minute = i * STEP;
    const hour = minute / 60;
    const rain = scenario.rainMmPerHour(hour);
    const cloud = scenario.cloud(hour);
    const tempC = scenario.tempC(hour);
    const sectionsDown = outages.filter((o) => hour >= o.startHour && hour < o.endHour).map((o) => o.section);

    if (i > 0) {
      for (const r of runs) {
        const { hub, s } = r;
        const gridUp = !sectionsDown.includes(hub.section);
        const sun = solarKw(hub.solarKwp, hour, cloud);
        const tankCap = hub.tankKl * 1000;
        const tankPct = (r.tankL / tankCap) * 100;
        const biogasOk = r.biogasKwhLeft > 0.05 && r.biogasKwNow >= hub.pumpKw * 0.6;
        const solarOk = sun >= hub.pumpKw * 0.9;

        // --- Demand, partly met by treated water when LoopLocal is on
        const demand = demandLpm(hub.flats, hour, tempC) * STEP;
        const reuse = withLoop ? Math.min(r.prevOutflowL, demand * C.ONSITE_REUSE_SHARE) : 0;
        const fresh = demand - reuse;

        // --- Pump decision
        const cut = outages.find((o) => o.section === hub.section && o.planned && hour < o.startHour && o.startHour - hour <= 4);
        const stormSoon = stormHour !== null && hour < stormHour && stormHour - hour <= 5;
        const topUp = done(effects.toppedUpHubs, hub.id) && (!!cut || stormSoon);
        let source: PumpSource = 'off';
        if (withLoop) {
          if (tankPct < 28) r.latch = true;
          if (tankPct > 62) r.latch = false;
          const pick = (): PumpSource => (solarOk ? 'solar' : biogasOk ? 'biogas' : gridUp ? 'grid' : 'off');
          if (tankPct >= 97) source = 'off';
          else if (topUp) source = pick();
          else if (solarOk && hour >= 9 && hour <= 17) source = 'solar';
          else if (r.latch) source = gridUp ? 'grid' : biogasOk ? 'biogas' : 'off';
          else if (cloud > 0.6 && hour >= 10 && hour <= 16 && biogasOk && tankPct < 80) source = 'biogas';
          else if (hour >= 10 && hour < 18 && tankPct < 92 && gridUp) source = 'grid';
        } else {
          // The usual way: the operator runs the pump on a morning and an evening timer.
          const timer = (hour >= 5.5 && hour < 8) || (hour >= 19 && hour < 21);
          if (tankPct < 15) r.latch = true;
          if (tankPct > 45) r.latch = false;
          source = (timer || r.latch) && tankPct < 97 && gridUp ? 'grid' : 'off';
        }

        // --- Sump: municipal supply 5–8 am, tanker when nearly dry
        const sumpCap = hub.sumpKl * 1000;
        if (hour >= 5 && hour < 8) {
          r.sumpL += ((hub.flats * C.LITRES_PER_FLAT_DAY * C.MUNICIPAL_SHARE) / 180) * STEP;
        }
        if (r.sumpL < sumpCap * 0.1 && tankPct < 60) {
          r.sumpL += C.TANKER_L;
          s.tankerTrips += 1;
        }
        r.sumpL = Math.min(r.sumpL, sumpCap);

        let pumped = 0;
        if (source !== 'off') {
          pumped = Math.min(hub.pumpLpm * STEP, r.sumpL, tankCap - r.tankL + fresh);
          r.sumpL -= pumped;
          const kwh = hub.pumpKw * dtH * (pumped / (hub.pumpLpm * STEP));
          if (source === 'grid') s.gridKwh += kwh;
          else {
            r.cleanKwh += kwh;
            s.kwhShifted += kwh;
            if (source === 'biogas') r.biogasKwhLeft -= kwh;
          }
        }

        // --- Overhead tank
        r.tankL += pumped;
        const delivered = Math.min(fresh, Math.max(0, r.tankL));
        r.tankL -= delivered;
        const waterOn = delivered >= fresh - 0.001;
        if (!waterOn) s.minutesWithoutWater += STEP;

        // --- STP
        let outflow = 0;
        let stpRunning = false;
        if (hub.stpKld > 0) {
          const inflow = Math.min((delivered + reuse) * C.SEWAGE_RETURN, (hub.stpKld * 1000 * STEP * 1.6) / 1440);
          const kwh = (inflow / 1000) * C.STP_KWH_PER_KL;
          const spareSun = Math.max(0, sun - (source === 'solar' ? hub.pumpKw : 0)) * dtH;
          const clean = withLoop ? Math.min(kwh, spareSun) : 0;
          stpRunning = gridUp || clean >= kwh * 0.99 || (withLoop && biogasOk && source !== 'biogas');
          s.stpInflowL += inflow;
          if (stpRunning) {
            const healthy = hub.stpHealthy || done(effects.fixedStps, hub.id);
            outflow = inflow * (healthy ? C.STP_YIELD : C.STP_YIELD_FAILING);
            s.stpOutflowL += outflow;
            r.cleanKwh += clean;
            s.kwhShifted += clean;
            if (gridUp) s.gridKwh += kwh - clean;
            else if (clean < kwh) r.biogasKwhLeft -= kwh - clean;
            if (withLoop) {
              const rest = Math.max(0, outflow - reuse);
              const topUpPit = hub.hasRechargePit && healthy ? rest * 0.35 : 0;
              s.rechargeTopUpL += topUpPit;
              s.stpSurplusL += rest - topUpPit;
            }
          }
        }
        r.prevOutflowL = outflow;
        s.reuseL += reuse;

        // --- Rain
        const inspected = done(effects.openedPits, hub.id);
        const pit = pitOpenFactor(hub.hasRechargePit, hub.pitCleanDaysAgo, inspected) * (withLoop ? 1 : 0.6);
        s.rechargeL += rechargeL(hub.roofAreaM2, rain * dtH, pit);

        // --- Waste
        const wet = (wetWasteKgPerDay(hub.flats, scenario.wasteFactor) * demandCurve(hour) * STEP) / 1440;
        const seg = clamp((hub.segregationScore + (done(effects.wasteCollected, hub.id) ? 15 : 0)) / 100);
        s.wasteWetKg += wet;
        s.wasteDivertedKg += wet * seg * (withLoop ? (hub.biogasM3PerDay > 0 ? 1 : 0.6) : hub.biogasM3PerDay > 0 ? 0.5 : 0);

        // --- Live values
        s.demandL += demand;
        s.solarKw = round1(sun);
        s.biogasKw = source === 'biogas' ? round1(r.biogasKwNow) : 0;
        s.pumpOn = source !== 'off' && pumped > 0;
        s.pumpSource = s.pumpOn ? source : 'off';
        s.tankPct = round1(clamp(r.tankL / tankCap) * 100);
        s.sumpPct = round1(clamp(r.sumpL / sumpCap) * 100);
        s.gridUp = gridUp;
        s.waterOn = waterOn;
        s.stpRunning = stpRunning;
        const energy = r.cleanKwh + s.gridKwh;
        s.cleanShare = energy > 0 ? r.cleanKwh / energy : 0;
        s.tankersAvoided = usual ? tankersAvoided(usual.steps[i]!.hubs[hub.id]!.tankerTrips, s.tankerTrips, s.rechargeL) : 0;
        s.rupeesSaved = withLoop ? rupeesSaved(s.kwhShifted, s.tankersAvoided) : 0;
      }
    } else {
      for (const r of runs) {
        r.s.tankPct = round1((r.tankL / (r.hub.tankKl * 1000)) * 100);
        r.s.sumpPct = round1((r.sumpL / (r.hub.sumpKl * 1000)) * 100);
      }
    }

    // --- Drains
    const drainRisk: Record<string, number> = {};
    const drainFlooded: Record<string, boolean> = {};
    for (const d of data.drains) {
      const risk = drainRiskAt(d, scenario, hour, { cleared: isCleared(d.id), wasteKeptOut });
      drainRisk[d.id] = risk;
      const flooded = risk >= C.FLOOD_RISK && rain >= C.FLOOD_RAIN;
      drainFlooded[d.id] = flooded;
      if (flooded) floodedEver = new Set(floodedEver).add(d.id);
    }

    // --- Feeders
    const feederLoad: Record<string, number> = {};
    for (const f of data.feeders) {
      const shifted = withLoop && hour >= 18 && hour <= 22 ? 3 + (done(effects.shiftedSections, f.section) ? 6 : 0) : 0;
      feederLoad[f.id] = sectionsDown.includes(f.section)
        ? 0
        : feederLoadPct(f.baseLoadPct, scenario.loadFactor, hour, tempC, shifted);
    }

    const hubs: Record<string, HubState> = {};
    const totals: Totals = {
      tankersAvoided: 0,
      kwhShifted: 0,
      rechargeL: 0,
      wasteDivertedKg: 0,
      rupeesSaved: 0,
      reuseL: 0,
      surplusL: 0,
      minutesWithoutWater: 0,
      floodedDrains: floodedEver.size,
    };
    for (const r of runs) {
      hubs[r.hub.id] = { ...r.s };
      totals.tankersAvoided += r.s.tankersAvoided;
      totals.kwhShifted += r.s.kwhShifted;
      totals.rechargeL += r.s.rechargeL;
      totals.wasteDivertedKg += r.s.wasteDivertedKg;
      totals.rupeesSaved += r.s.rupeesSaved;
      totals.reuseL += r.s.reuseL + r.s.rechargeTopUpL;
      totals.surplusL += r.s.stpSurplusL;
      totals.minutesWithoutWater += r.s.minutesWithoutWater;
    }

    steps.push({
      minute,
      scenario: scenarioId,
      mode,
      weather: { rainMmPerHour: round1(rain), cloud, tempC: round1(tempC), windKmh: Math.round(scenario.windKmh(hour)) },
      hubs,
      drainRisk,
      drainFlooded,
      feederLoadPct: feederLoad,
      sectionsDown,
      totals,
      score: scoreOf({ runs, drainRisk, floodedCount: floodedEver.size, minute, withLoop, effects, all }),
    });
  }

  return { scenario: scenarioId, mode, steps };
}

const usualCache = new Map<string, DayTimeline>();

/** The same day without LoopLocal, computed once per locality and scenario. */
export function usualDay(data: LocalityData, scenario: ScenarioId): DayTimeline {
  const key = `${data.id}:${scenario}`;
  let day = usualCache.get(key);
  if (!day) {
    day = simulateDay({ data, scenario, mode: 'without' });
    usualCache.set(key, day);
  }
  return day;
}

/** Loop Score from the day so far. Early in the day it leans on readiness; by 10 am on results. */
function scoreOf(a: {
  runs: HubRun[];
  drainRisk: Record<string, number>;
  floodedCount: number;
  minute: number;
  withLoop: boolean;
  effects: Effects;
  all: boolean;
}): LoopScore {
  const { runs, withLoop } = a;
  const n = Math.max(1, runs.length);
  const sum = (f: (r: HubRun) => number) => runs.reduce((t, r) => t + f(r), 0);
  const p = clamp((a.minute - 300) / 420);
  const blend = (ready: number, result: number) => clamp(ready * (1 - p) + result * p, 0, 100);
  const k = withLoop ? 1 : 0.35;

  // 1 Waste → Power
  const wet = sum((r) => r.s.wasteWetKg);
  const wasteReady = (sum((r) => r.hub.segregationScore * (r.hub.biogasM3PerDay > 0 ? 1 : 0.6)) / n) * k;
  const waste = blend(wasteReady, wet > 0 ? (sum((r) => r.s.wasteDivertedKg) / wet) * 100 : wasteReady);

  // 2 Sun + Biogas → Pumps
  const clean = sum((r) => r.cleanKwh);
  const grid = sum((r) => r.s.gridKwh);
  const dry = clamp(sum((r) => r.s.minutesWithoutWater) / (n * 90));
  const energyReady = (sum((r) => (r.hub.solarKwp > 0 || r.hub.biogasM3PerDay > 0 ? 1 : 0)) / n) * 70 * k;
  const energy = blend(energyReady, (clean + grid > 0 ? (clean / (clean + grid)) * 100 : energyReady) * (1 - 0.5 * dry));

  // 3 Rain → Water
  const pits =
    sum((r) =>
      pitOpenFactor(
        r.hub.hasRechargePit,
        r.hub.pitCleanDaysAgo,
        withLoop && (a.all || a.effects.openedPits.includes(r.hub.id)),
      ),
    ) / n;
  const top = Object.values(a.drainRisk)
    .sort((x, y) => y - x)
    .slice(0, 5);
  const drainSafety = 100 - top.reduce((t, x) => t + x, 0) / Math.max(1, top.length);
  const rain = clamp(pits * 100 * 0.5 + drainSafety * 0.5 - a.floodedCount * 5, 0, 100);

  // 4 Used water → Resource
  const potential = sum((r) => r.s.stpInflowL) * C.STP_YIELD;
  const used = sum((r) => r.s.reuseL + r.s.rechargeTopUpL + r.s.stpSurplusL * (r.hub.stpRegistered ? 1 : 0.3));
  const plants = runs.filter((r) => r.hub.stpKld > 0);
  const reuseReady =
    (plants.reduce((t, r) => t + (r.hub.stpRegistered ? 1 : 0.4) * (r.hub.stpHealthy ? 1 : 0.6), 0) /
      Math.max(1, n)) *
    80 *
    k;
  const reuse = blend(reuseReady, potential > 0 ? (used / potential) * 100 : reuseReady);

  // 5 Saved water → Saved power
  const demand = sum((r) => r.s.demandL);
  const savedShare = demand > 0 ? sum((r) => r.s.reuseL + r.s.rechargeTopUpL + r.s.rechargeL * C.RECHARGE_CREDIT) / demand : 0;
  const cleanShare = clean + grid > 0 ? clean / (clean + grid) : 0;
  const savings = blend((energyReady + reuseReady) / 2, 60 * clamp(savedShare / 0.3) + 40 * cleanShare);

  const byLoop: Record<LoopId, number> = {
    waste: Math.round(waste),
    energy: Math.round(energy),
    rain: Math.round(rain),
    reuse: Math.round(reuse),
    savings: Math.round(savings),
  };
  return { byLoop, total: totalScore(byLoop) };
}

/** loop_score = weighted mean of the five sub-scores. */
export function totalScore(byLoop: Record<LoopId, number>): number {
  return Math.round(LOOPS.reduce((t, l) => t + byLoop[l.id] * C.WEIGHTS[l.id], 0));
}

/** Snapshot for a minute of the day. */
export function snapshotAt(day: DayTimeline, minute: number): SimSnapshot {
  const i = Math.min(STEPS_PER_DAY, Math.max(0, Math.floor(minute / STEP)));
  return day.steps[i]!;
}
