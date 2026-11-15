import { describe, expect, it } from 'vitest';
import { getLocality } from '../../src/data/locality';
import { applyActionBonus, clockLabel, planDay } from '../../src/engine/decisions';
import { SCENARIO_IDS } from '../../src/engine/scenarios';
import { buildSession, effectsOf, momentAt } from '../../src/engine/session';
import { simulateDay } from '../../src/engine/simulate';

const data = getLocality('kukatpally');
const plan = (s: (typeof SCENARIO_IDS)[number]) => planDay(data, s, simulateDay({ data, scenario: s, mode: 'with' }));

describe('decision engine', () => {
  it('formats clock labels', () => {
    expect(clockLabel(0)).toBe('12 am');
    expect(clockLabel(17 * 60)).toBe('5 pm');
    expect(clockLabel(18 * 60 + 30)).toBe('6:30 pm');
    expect(clockLabel(12 * 60)).toBe('12 pm');
  });

  it('is deterministic, ranked, and gives every action a place, deadline, checklist and unique id', () => {
    for (const s of SCENARIO_IDS) {
      const a = plan(s);
      expect(plan(s)).toEqual(a);
      expect(a.length).toBeGreaterThan(5);
      expect(new Set(a.map((x) => x.id)).size).toBe(a.length);
      for (let i = 1; i < a.length; i++) expect(a[i - 1]!.rank).toBeGreaterThanOrEqual(a[i]!.rank);
      for (const x of a) {
        expect(x.deadlineMinute).toBeGreaterThan(x.createdMinute);
        expect(x.steps.length).toBeGreaterThanOrEqual(3);
        expect(x.safetyTip.length).toBeGreaterThan(10);
        expect(Number.isFinite(x.place.lat) && Number.isFinite(x.place.lng)).toBe(true);
        expect(x.status).toBe('pending');
      }
    }
  });

  it('a storm day raises drain, top-up and recharge-pit actions before the rain', () => {
    const a = plan('storm');
    const drains = a.filter((x) => x.effect.kind === 'drain');
    expect(drains.length).toBeGreaterThanOrEqual(2);
    expect(drains[0]!.title).toContain('D-07');
    expect(a.some((x) => x.effect.kind === 'topup' && x.title.includes('Sri Sai Residency') && x.reason.includes('KPHB-3'))).toBe(true);
    expect(a.some((x) => x.effect.kind === 'pit')).toBe(true);
    for (const x of a.filter((y) => ['drain', 'pit'].includes(y.effect.kind))) expect(x.deadlineMinute).toBeLessThanOrEqual(17.5 * 60);
  });

  it('a normal day has no storm actions but still has routine work', () => {
    const a = plan('normal');
    expect(a.some((x) => x.effect.kind === 'pit' || x.effect.kind === 'topup')).toBe(false);
    expect(a.some((x) => x.effect.kind === 'stp')).toBe(true);
    expect(a.some((x) => x.effect.kind === 'leak')).toBe(true);
    expect(a.some((x) => x.effect.kind === 'waste')).toBe(true);
  });

  it('a peak evening raises more load-shifting actions than a normal day', () => {
    const n = (s: 'normal' | 'peak') => plan(s).filter((x) => x.effect.kind === 'shift').length;
    expect(n('peak')).toBeGreaterThan(n('normal'));
  });
});

describe('session', () => {
  it('shows actions only once they are raised, and keeps in-progress ones visible', () => {
    const session = buildSession(data, 'storm', {}, []);
    const early = momentAt(session, 6 * 60).visible.length;
    const late = momentAt(session, 16 * 60).visible.length;
    expect(late).toBeGreaterThan(early);
    const future = session.actions.find((a) => a.createdMinute > 6 * 60)!;
    const s2 = buildSession(data, 'storm', { [future.id]: { status: 'dispatched' } }, []);
    expect(momentAt(s2, 6 * 60).visible.some((a) => a.id === future.id)).toBe(true);
  });

  it('done actions change the simulation and verified actions raise the Loop Score', () => {
    const base = buildSession(data, 'storm', {}, []);
    const drain = base.actions.find((a) => a.effect.kind === 'drain')!;
    const done = buildSession(data, 'storm', { [drain.id]: { status: 'done' } }, []);
    const verified = buildSession(data, 'storm', { [drain.id]: { status: 'verified' } }, []);
    expect(effectsOf(done.actions).clearedDrains).toHaveLength(1);
    const at = 23 * 60;
    expect(momentAt(done, at).snap.totals.floodedDrains).toBeLessThan(momentAt(base, at).snap.totals.floodedDrains);
    expect(momentAt(verified, at).score.byLoop.rain).toBeGreaterThan(momentAt(done, at).score.byLoop.rain);
    expect(momentAt(verified, at).score.total).toBeGreaterThanOrEqual(momentAt(base, at).score.total);
  });

  it('caps the bonus from verified actions', () => {
    const score = { total: 50, byLoop: { waste: 50, energy: 50, rain: 50, reuse: 50, savings: 50 } };
    const many = Array.from({ length: 20 }, () => ({ loop: 'rain' as const, status: 'verified' as const, impact: { label: '', scoreDelta: 4 } }));
    expect(applyActionBonus(score, many).byLoop.rain).toBe(68);
    expect(applyActionBonus(score, many).byLoop.waste).toBe(50);
  });
});
