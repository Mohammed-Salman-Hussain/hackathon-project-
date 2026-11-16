import { C, nightFlowLph } from './formulas';
import { SCENARIOS } from './scenarios';
import { STEP, STEPS_PER_DAY, firstRainHour, resolveOutages, totalScore, type DayTimeline } from './simulate';
import type { Action, ActionEffect, Hub, LocalityData, LoopId, LoopScore, ScenarioId, Trade } from './types';

/** "5 pm", "6:30 pm" */
export function clockLabel(minute: number): string {
  const m = ((Math.round(minute) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const mm = m % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${h24 < 12 ? 'am' : 'pm'}`;
}

const PRIORITY_WEIGHT = { 1: 3, 2: 2, 3: 1 } as const;

const CHECKLISTS: Record<ActionEffect['kind'], { steps: string[]; safetyTip: string }> = {
  drain: {
    steps: ['Put out cones and a warning board', 'Lift the gratings and remove silt and plastic', 'Clear the inlet screens', 'Photograph the open channel'],
    safetyTip: 'Never enter a drain alone. Wear gloves and boots, and keep clear of open manholes.',
  },
  topup: {
    steps: ['Check the sump level', 'Start the pump on the source shown', 'Fill the overhead tank to 95%', 'Switch off and log the level'],
    safetyTip: 'Keep hands dry at the starter panel. Do not run the pump if the sump is low.',
  },
  pit: {
    steps: ['Remove the cover and clear leaves and silt', 'Check the filter media', 'Open the inlet valve from the roof line', 'Replace the cover and photograph'],
    safetyTip: 'Barricade the open pit. Two people for lifting the cover.',
  },
  stp: {
    steps: ['Read blower current and dissolved oxygen', 'Check the blower belt and air filter', 'Inspect the diffusers', 'Note treated-water turbidity'],
    safetyTip: 'Isolate power before opening the blower guard. Avoid breathing near open tanks.',
  },
  shift: {
    steps: ['Confirm load on the feeder', 'Agree the new pump timings with the hub', 'Reset the pump timers to 10 am–6 pm', 'Re-check the load at 7 pm'],
    safetyTip: 'Use insulated gloves and a tester. Work on a de-energised panel only.',
  },
  waste: {
    steps: ['Collect wet waste from the bin room', 'Remove plastic and glass from the wet bin', 'Weigh and log the load', 'Deliver to the biogas feed point'],
    safetyTip: 'Gloves and mask on. Watch for sharp objects in mixed waste.',
  },
  leak: {
    steps: ['Close all outlets and read the meter', 'Walk the riser and check float valves', 'Dye-test cisterns on the flagged floors', 'Fix or tag the leak and re-read the meter'],
    safetyTip: 'Take care on terrace ladders. Shut the isolation valve before opening a joint.',
  },
  greenwater: {
    steps: ['Confirm the quality test is within limits', 'Book the Green Water Tanker slot', 'Share the gate pass with the site', 'Record litres handed over'],
    safetyTip: 'Treated water is for construction and gardening only, never for drinking.',
  },
  none: {
    steps: ['Visit the location', 'Assess and photograph', 'Fix or escalate', 'Mark done'],
    safetyTip: 'Check the surroundings before starting work.',
  },
};

interface Draft {
  key: string;
  loop: LoopId;
  title: string;
  reason: string;
  place: Action['place'];
  assigneeRole: Trade | 'officer';
  createdMinute: number;
  deadlineMinute: number;
  priority: 1 | 2 | 3;
  impactLabel: string;
  scoreDelta: number;
  effect: ActionEffect;
  confidence: number;
}

const hubPlace = (h: Hub) => ({ label: `${h.name}, ${h.area}`, lat: h.lat, lng: h.lng });

/**
 * Rule-based and deterministic. Reads the baseline "with LoopLocal" day (no actions carried out yet)
 * and returns every action the engine would raise that day, ranked.
 * The ids are stable, so statuses saved in the store survive a reload.
 */
export function planDay(data: LocalityData, scenarioId: ScenarioId, baseline: DayTimeline): Action[] {
  const scenario = SCENARIOS[scenarioId];
  const drafts: Draft[] = [];
  const rainHour = firstRainHour(scenario, 1);
  const stormHour = firstRainHour(scenario, 20);
  const rainStart = rainHour === null ? null : Math.round(rainHour * 60);
  const outages = resolveOutages(scenario, data);

  // Rule 1 — drains likely to choke
  const peaks = data.drains
    .map((d) => {
      let peak = 0;
      let first = -1;
      for (let i = 0; i <= STEPS_PER_DAY; i++) {
        const r = baseline.steps[i]!.drainRisk[d.id] ?? 0;
        if (r > peak) peak = r;
        if (first < 0 && r >= 70) first = i * STEP;
      }
      return { d, peak, first };
    })
    .sort((a, b) => b.peak - a.peak);
  if (rainStart !== null) {
    for (const { d, peak, first } of peaks.filter((x) => x.first >= 0).slice(0, 6)) {
      const deadline = Math.max(first + 60, rainStart - 30);
      drafts.push({
        key: `drain:${d.id}`,
        loop: 'rain',
        title: `Clear ${d.id} (${d.name}) before ${clockLabel(deadline)}`,
        reason: `Clog risk ${peak}% · rain expected from ${clockLabel(rainStart)} · last cleaned ${d.daysSinceClean} days ago`,
        place: { label: d.name, lat: d.path[1]![1], lng: d.path[1]![0] },
        assigneeRole: 'sanitation',
        createdMinute: first,
        deadlineMinute: deadline,
        priority: peak >= 85 ? 1 : 2,
        impactLabel: 'Keeps the street from flooding',
        scoreDelta: peak >= 85 ? 4 : 3,
        effect: { kind: 'drain', drainId: d.id },
        confidence: peak / 100,
      });
    }
  } else {
    for (const { d, peak } of peaks.filter((x) => x.peak >= 40).slice(0, 2)) {
      drafts.push({
        key: `drain:${d.id}`,
        loop: 'rain',
        title: `Routine clean of ${d.id} (${d.name})`,
        reason: `Clog risk ${peak}% in dry weather · ${d.complaints} complaints · last cleaned ${d.daysSinceClean} days ago`,
        place: { label: d.name, lat: d.path[1]![1], lng: d.path[1]![0] },
        assigneeRole: 'sanitation',
        createdMinute: 7 * 60,
        deadlineMinute: 16 * 60,
        priority: 3,
        impactLabel: 'Ready before the next rain',
        scoreDelta: 2,
        effect: { kind: 'drain', drainId: d.id },
        confidence: peak / 100,
      });
    }
  }

  // Rule 2 — top up tanks before a planned cut, or before a storm
  const topped = new Set<string>();
  for (const o of outages.filter((x) => x.planned)) {
    for (const h of data.hubs.filter((x) => x.section === o.section)) {
      const start = Math.round(o.startHour * 60);
      topped.add(h.id);
      drafts.push({
        key: `topup:${h.id}`,
        loop: 'energy',
        title: `Top up ${h.name} tanks by ${clockLabel(start - 180)}`,
        reason: `Planned cut ${clockLabel(start)}–${clockLabel(Math.round(o.endHour * 60))} in Section ${h.section}`,
        place: hubPlace(h),
        assigneeRole: 'pump',
        createdMinute: Math.max(6 * 60, start - 6 * 60),
        deadlineMinute: start - 180,
        priority: 1,
        impactLabel: `Water for ${h.flats} flats through the cut`,
        scoreDelta: 4,
        effect: { kind: 'topup', hubId: h.id },
        confidence: 0.95,
      });
    }
  }
  if (stormHour !== null) {
    const start = Math.round(stormHour * 60);
    // Sections that tend to lose power in high wind come first, then the largest hubs.
    const prone = new Set(outages.filter((o) => !o.planned).map((o) => o.section));
    const candidates = [...data.hubs]
      .filter((x) => !topped.has(x.id))
      .sort((a, b) => Number(prone.has(b.section)) - Number(prone.has(a.section)) || b.flats - a.flats)
      .slice(0, 4);
    for (const h of candidates) {
      const risky = prone.has(h.section);
      drafts.push({
        key: `topup:${h.id}`,
        loop: 'energy',
        title: `Top up ${h.name} tanks by ${clockLabel(start - 90)}`,
        reason: `Storm expected from ${clockLabel(rainStart ?? start)} · ${risky ? `Section ${h.section} is outage-prone in high wind` : 'unplanned outages likely'}`,
        place: hubPlace(h),
        assigneeRole: 'pump',
        createdMinute: Math.max(6 * 60, start - 6 * 60),
        deadlineMinute: start - 90,
        priority: risky ? 1 : 2,
        impactLabel: `Water for ${h.flats} flats if power fails`,
        scoreDelta: 3,
        effect: { kind: 'topup', hubId: h.id },
        confidence: risky ? 0.85 : 0.6,
      });
    }
  }

  // Rule 3 — open recharge pits before the storm
  if (rainStart !== null) {
    for (const h of data.hubs.filter((x) => x.hasRechargePit)) {
      const litres = Math.round((h.roofAreaM2 * 60 * C.RUNOFF) / 1000);
      drafts.push({
        key: `pit:${h.id}`,
        loop: 'rain',
        title: `Open and inspect the recharge pit at ${h.name}`,
        reason: `Rain from ${clockLabel(rainStart)} · pit last cleaned ${h.pitCleanDaysAgo} days ago`,
        place: hubPlace(h),
        assigneeRole: 'plumber',
        createdMinute: Math.max(6 * 60, rainStart - 6 * 60),
        deadlineMinute: rainStart - 30,
        priority: h.pitCleanDaysAgo > 90 ? 1 : 2,
        impactLabel: `Up to ${litres} kL into the ground, not the street`,
        scoreDelta: 3,
        effect: { kind: 'pit', hubId: h.id },
        confidence: 0.85,
      });
    }
  }

  // Rule 4 — plant taking normal inflow but giving little treated water
  for (const h of data.hubs.filter((x) => x.stpKld > 0 && !x.stpHealthy)) {
    drafts.push({
      key: `stp:${h.id}`,
      loop: 'reuse',
      title: `Check the STP blower at ${h.name}`,
      reason: `Inflow is normal but treated output is down to ${Math.round(C.STP_YIELD_FAILING * 100)}%`,
      place: hubPlace(h),
      assigneeRole: 'plumber',
      createdMinute: 8 * 60,
      deadlineMinute: 14 * 60,
      priority: 2,
      impactLabel: `Restores about ${Math.round(h.stpKld * 0.3)} kL a day of reusable water`,
      scoreDelta: 4,
      effect: { kind: 'stp', hubId: h.id },
      confidence: 0.8,
    });
  }

  // Rule 5 — feeder heading for overload
  const feederPeaks = data.feeders
    .map((f) => {
      let first = -1;
      let peak = 0;
      for (let i = 0; i <= STEPS_PER_DAY; i++) {
        const load = baseline.steps[i]!.feederLoadPct[f.id] ?? 0;
        if (load > peak) peak = load;
        if (first < 0 && load >= 85) first = i * STEP;
      }
      return { f, first, peak };
    })
    .filter((x) => x.first >= 0)
    .sort((a, b) => b.peak - a.peak)
    .slice(0, 4);
  for (const { f, first, peak } of feederPeaks) {
    drafts.push({
      key: `shift:${f.section}`,
      loop: 'savings',
      title: `Move pump timings off-peak in Section ${f.section}`,
      reason: `${f.name} forecast to reach ${peak}% at ${clockLabel(first)}`,
      place: { label: f.name, lat: f.lat, lng: f.lng },
      assigneeRole: 'lineman',
      createdMinute: Math.max(6 * 60, first - 5 * 60),
      deadlineMinute: Math.max(7 * 60, first - 60),
      priority: peak >= 100 ? 1 : 2,
      impactLabel: 'Takes pumping out of the evening peak',
      scoreDelta: 3,
      effect: { kind: 'shift', section: f.section },
      confidence: 0.75,
    });
  }

  // Rule 6 — poor segregation
  for (const h of data.hubs.filter((x) => x.segregationScore < 60)) {
    drafts.push({
      key: `waste:${h.id}`,
      loop: 'waste',
      title: `Collect and re-sort wet waste at ${h.name}`,
      reason: `Segregation score ${h.segregationScore} · mixed waste is reaching the street bins`,
      place: hubPlace(h),
      assigneeRole: 'sanitation',
      createdMinute: 6 * 60 + 30,
      deadlineMinute: 11 * 60,
      priority: 3,
      impactLabel: 'More feed for biogas, less in the drains',
      scoreDelta: 2,
      effect: { kind: 'waste', hubId: h.id },
      confidence: 0.7,
    });
  }

  // Rule 7 — night flow creeping up
  for (const h of data.hubs.filter((x) => x.leakGrowth > 0)) {
    const base = nightFlowLph(h.flats, 0, 0, 0);
    const now = nightFlowLph(h.flats, h.leakGrowth, 6, 0);
    if (now < base * 1.3) continue;
    const perDay = (now - base) * 24;
    drafts.push({
      key: `leak:${h.id}`,
      loop: 'savings',
      title: `Check for a leak at ${h.name}`,
      reason: `Night flow ${now} L/h, ${Math.round((now / base - 1) * 100)}% above baseline for 3 nights`,
      place: hubPlace(h),
      assigneeRole: 'plumber',
      createdMinute: 6 * 60,
      deadlineMinute: 18 * 60,
      priority: 2,
      impactLabel: `About ${Math.round(perDay / 100) * 100} L a day being lost`,
      scoreDelta: 3,
      effect: { kind: 'leak', hubId: h.id },
      confidence: 0.75,
    });
  }

  // Rule 8 — surplus treated water to sell or register
  let siteIndex = 0;
  for (const h of data.hubs.filter((x) => x.stpKld > 0)) {
    const site = data.sites.length ? data.sites[siteIndex % data.sites.length] : undefined;
    let first = -1;
    for (let i = 0; i <= STEPS_PER_DAY; i++) {
      if ((baseline.steps[i]!.hubs[h.id]?.stpSurplusL ?? 0) >= 5000) {
        first = i * STEP;
        break;
      }
    }
    if (first < 0) continue;
    const endKl = Math.round((baseline.steps[STEPS_PER_DAY]!.hubs[h.id]?.stpSurplusL ?? 0) / 1000);
    if (h.stpRegistered && site) {
      siteIndex++;
      drafts.push({
        key: `greenwater:${h.id}`,
        loop: 'reuse',
        title: `Book a Green Water Tanker: ${h.name} → ${site.name}`,
        reason: `${endKl} kL surplus treated water today · site needs ${site.needKlPerDay} kL`,
        place: hubPlace(h),
        assigneeRole: 'officer',
        createdMinute: first,
        deadlineMinute: Math.min(1380, first + 300),
        priority: 3,
        impactLabel: 'Treated water sold instead of drained',
        scoreDelta: 2,
        effect: { kind: 'greenwater', hubId: h.id },
        confidence: 0.8,
      });
    } else if (endKl >= 25) {
      drafts.push({
        key: `register:${h.id}`,
        loop: 'reuse',
        title: `Register ${h.name} STP for Green Water Tankers`,
        reason: `${endKl} kL surplus a day has no buyer because the plant is not registered`,
        place: hubPlace(h),
        assigneeRole: 'officer',
        createdMinute: 9 * 60,
        deadlineMinute: 17 * 60,
        priority: 3,
        impactLabel: 'Opens a sale route for surplus water',
        scoreDelta: 2,
        effect: { kind: 'greenwater', hubId: h.id },
        confidence: 0.6,
      });
    }
  }

  return drafts
    .map((d): Action => {
      const hoursToAct = Math.max(0.5, (d.deadlineMinute - d.createdMinute) / 60);
      const urgency = 1 / hoursToAct + PRIORITY_WEIGHT[d.priority];
      return {
        id: `${data.id}:${scenarioId}:${d.key}`,
        loop: d.loop,
        title: d.title,
        reason: d.reason,
        place: d.place,
        assigneeRole: d.assigneeRole,
        createdMinute: d.createdMinute,
        deadlineMinute: d.deadlineMinute,
        priority: d.priority,
        impact: { label: d.impactLabel, scoreDelta: d.scoreDelta },
        status: 'pending',
        ...CHECKLISTS[d.effect.kind],
        source: 'engine',
        effect: d.effect,
        rank: Math.round(urgency * d.scoreDelta * d.confidence * 100) / 100,
      };
    })
    .sort((a, b) => b.rank - a.rank);
}

export const checklistFor = (kind: ActionEffect['kind']) => CHECKLISTS[kind];

/** Verified actions lift their loop's sub-score, capped per loop. */
export function applyActionBonus(score: LoopScore, actions: Pick<Action, 'loop' | 'status' | 'impact'>[]): LoopScore {
  const bonus: Record<LoopId, number> = { waste: 0, energy: 0, rain: 0, reuse: 0, savings: 0 };
  for (const a of actions) if (a.status === 'verified') bonus[a.loop] += a.impact.scoreDelta;
  const byLoop = { ...score.byLoop };
  (Object.keys(byLoop) as LoopId[]).forEach((id) => {
    byLoop[id] = Math.min(100, byLoop[id] + Math.min(C.ACTION_BONUS_CAP, bonus[id]));
  });
  return { byLoop, total: totalScore(byLoop) };
}
