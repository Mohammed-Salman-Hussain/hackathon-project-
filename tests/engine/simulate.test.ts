import { describe, expect, it } from 'vitest';
import { getLocality } from '../../src/data/locality';
import { LOCALITIES } from '../../src/data/localities';
import { SCENARIO_IDS } from '../../src/engine/scenarios';
import { STEPS_PER_DAY, simulateDay, snapshotAt } from '../../src/engine/simulate';
import type { Effects } from '../../src/engine/types';
import { NO_EFFECTS } from '../../src/engine/types';

const kukatpally = getLocality('kukatpally');
const ALL: Effects = { ...NO_EFFECTS, all: true };
const end = (d: ReturnType<typeof simulateDay>) => d.steps[STEPS_PER_DAY]!;

describe('seed data', () => {
  it('meets the sizes in the spec', () => {
    expect(kukatpally.hubs.length).toBeGreaterThanOrEqual(8);
    expect(kukatpally.drains.length).toBeGreaterThanOrEqual(20);
    expect(kukatpally.feeders.length).toBeGreaterThanOrEqual(8);
    expect(kukatpally.stps.length).toBeGreaterThanOrEqual(10);
    expect(kukatpally.stps.some((s) => s.registered)).toBe(true);
    expect(kukatpally.stps.some((s) => !s.registered)).toBe(true);
    expect(kukatpally.workers.length).toBeGreaterThanOrEqual(10);
  });
  it('every hub sits on a feeder section that exists, in every locality', () => {
    for (const l of LOCALITIES) {
      const data = getLocality(l.id);
      const sections = new Set(data.feeders.map((f) => f.section));
      for (const h of data.hubs) expect(sections.has(h.section)).toBe(true);
      expect(data.drains.length).toBeGreaterThan(0);
      expect(data.workers.length).toBeGreaterThan(0);
    }
  });
});

describe('simulateDay', () => {
  it('is deterministic', () => {
    const a = simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with' });
    const b = simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with' });
    expect(a).toEqual(b);
  });

  it('keeps every value in range for every scenario, mode and locality', () => {
    for (const l of LOCALITIES) {
      const data = getLocality(l.id);
      for (const scenario of SCENARIO_IDS) {
        for (const mode of ['with', 'without'] as const) {
          const day = simulateDay({ data, scenario, mode });
          expect(day.steps).toHaveLength(STEPS_PER_DAY + 1);
          for (const s of day.steps) {
            expect(s.score.total).toBeGreaterThanOrEqual(0);
            expect(s.score.total).toBeLessThanOrEqual(100);
            for (const h of Object.values(s.hubs)) {
              expect(h.tankPct).toBeGreaterThanOrEqual(0);
              expect(h.tankPct).toBeLessThanOrEqual(100);
              expect(h.sumpPct).toBeGreaterThanOrEqual(0);
              expect(h.sumpPct).toBeLessThanOrEqual(100);
              expect(Number.isFinite(h.rupeesSaved)).toBe(true);
            }
            for (const r of Object.values(s.drainRisk)) expect(r >= 0 && r <= 100).toBe(true);
          }
        }
      }
    }
  });

  it('cumulative totals never go down during the day', () => {
    const day = simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with', effects: ALL });
    for (let i = 1; i <= STEPS_PER_DAY; i++) {
      const a = day.steps[i - 1]!.totals;
      const b = day.steps[i]!.totals;
      expect(b.rechargeL).toBeGreaterThanOrEqual(a.rechargeL);
      expect(b.kwhShifted).toBeGreaterThanOrEqual(a.kwhShifted - 1e-9);
      expect(b.wasteDivertedKg).toBeGreaterThanOrEqual(a.wasteDivertedKg);
      expect(b.reuseL).toBeGreaterThanOrEqual(a.reuseL);
    }
  });

  it('changing the scenario changes the outputs', () => {
    const normal = end(simulateDay({ data: kukatpally, scenario: 'normal', mode: 'with' }));
    const storm = end(simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with' }));
    const heat = end(simulateDay({ data: kukatpally, scenario: 'heatwave', mode: 'with' }));
    const peak = simulateDay({ data: kukatpally, scenario: 'peak', mode: 'with' });
    expect(normal.totals.rechargeL).toBe(0);
    expect(storm.totals.rechargeL).toBeGreaterThan(100_000);
    expect(heat.totals.kwhShifted).toBeGreaterThan(normal.totals.kwhShifted);
    const maxLoad = (d: typeof peak) => Math.max(...d.steps.flatMap((s) => Object.values(s.feederLoadPct)));
    expect(maxLoad(peak)).toBeGreaterThan(maxLoad(simulateDay({ data: kukatpally, scenario: 'normal', mode: 'with' })));
    expect(snapshotAt(simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with' }), 20 * 60).sectionsDown).toContain('KPHB-3');
  });

  it('a storm day goes better with LoopLocal, and best when the actions are carried out', () => {
    const without = end(simulateDay({ data: kukatpally, scenario: 'storm', mode: 'without' }));
    const withLoop = end(simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with' }));
    const acted = end(simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with', effects: ALL }));
    expect(without.totals.floodedDrains).toBeGreaterThan(3);
    expect(acted.totals.floodedDrains).toBe(0);
    expect(without.totals.minutesWithoutWater).toBeGreaterThan(60);
    expect(acted.totals.minutesWithoutWater).toBe(0);
    expect(withLoop.totals.rechargeL).toBeGreaterThan(without.totals.rechargeL);
    expect(acted.totals.rechargeL).toBeGreaterThan(withLoop.totals.rechargeL);
    expect(withLoop.score.total).toBeGreaterThan(without.score.total);
    expect(acted.score.total).toBeGreaterThan(withLoop.score.total + 5);
    expect(acted.totals.tankersAvoided).toBeGreaterThan(0);
  });

  it('clearing one drain lowers that drain’s risk only', () => {
    const base = simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with' });
    const cleared = simulateDay({
      data: kukatpally,
      scenario: 'storm',
      mode: 'with',
      effects: { ...NO_EFFECTS, clearedDrains: ['D-07'] },
    });
    const at = 18 * 60;
    expect(snapshotAt(cleared, at).drainRisk['D-07']!).toBeLessThan(snapshotAt(base, at).drainRisk['D-07']! - 20);
    expect(snapshotAt(cleared, at).drainRisk['D-16']).toBe(snapshotAt(base, at).drainRisk['D-16']);
  });

  it('a topped-up tank is fuller when the planned cut starts', () => {
    const base = simulateDay({ data: kukatpally, scenario: 'storm', mode: 'with' });
    const topped = simulateDay({
      data: kukatpally,
      scenario: 'storm',
      mode: 'with',
      effects: { ...NO_EFFECTS, toppedUpHubs: ['sri-sai'] },
    });
    expect(snapshotAt(topped, 19 * 60).hubs['sri-sai']!.tankPct).toBeGreaterThan(snapshotAt(base, 19 * 60).hubs['sri-sai']!.tankPct + 5);
  });
});
