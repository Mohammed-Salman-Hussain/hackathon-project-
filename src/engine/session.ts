import { applyActionBonus, planDay } from './decisions';
import { simulateDay, snapshotAt, usualDay, type DayTimeline } from './simulate';
import type { Action, ActionStatus, Effects, LocalityData, LoopScore, ScenarioId, SimSnapshot } from './types';
import { NO_EFFECTS } from './types';

/** What the store remembers about an action the engine raised. */
export interface ActionRecord {
  status: ActionStatus;
  assigneeId?: string;
  proofPhoto?: string;
}

const STATUS_ORDER: Record<ActionStatus, number> = { pending: 0, dispatched: 1, done: 2, verified: 3 };

const dayCache = new Map<string, DayTimeline>();
const planCache = new Map<string, Action[]>();

function cached<T>(cache: Map<string, T>, key: string, make: () => T): T {
  let hit = cache.get(key);
  if (hit === undefined) {
    hit = make();
    if (cache.size > 24) cache.delete(cache.keys().next().value as string);
    cache.set(key, hit);
  }
  return hit;
}

/** Finished actions (done or verified) change the simulation. */
export function effectsOf(actions: Action[]): Effects {
  const e: Effects = {
    clearedDrains: [],
    toppedUpHubs: [],
    openedPits: [],
    fixedStps: [],
    shiftedSections: [],
    wasteCollected: [],
  };
  for (const a of actions) {
    if (a.status !== 'done' && a.status !== 'verified') continue;
    const x = a.effect;
    if (x.kind === 'drain') e.clearedDrains.push(x.drainId);
    else if (x.kind === 'topup') e.toppedUpHubs.push(x.hubId);
    else if (x.kind === 'pit') e.openedPits.push(x.hubId);
    else if (x.kind === 'stp') e.fixedStps.push(x.hubId);
    else if (x.kind === 'shift') e.shiftedSections.push(x.section);
    else if (x.kind === 'waste') e.wasteCollected.push(x.hubId);
  }
  (Object.keys(e) as (keyof Effects)[]).forEach((k) => {
    const v = e[k];
    if (Array.isArray(v)) v.sort();
  });
  return e;
}

export function dayFor(data: LocalityData, scenario: ScenarioId, effects: Effects = NO_EFFECTS): DayTimeline {
  return cached(dayCache, `${data.id}|${scenario}|${JSON.stringify(effects)}`, () =>
    simulateDay({ data, scenario, mode: 'with', effects }),
  );
}

export interface Session {
  data: LocalityData;
  scenario: ScenarioId;
  /** The day with LoopLocal, including the effect of finished actions */
  day: DayTimeline;
  /** The same day run the usual way, for comparisons */
  usual: DayTimeline;
  /** Every action for the day (engine + reported), statuses merged, ranked */
  actions: Action[];
}

/** Everything the screens need for one locality and scenario. Pure; results are cached. */
export function buildSession(
  data: LocalityData,
  scenario: ScenarioId,
  records: Record<string, ActionRecord>,
  custom: Action[],
): Session {
  const plan = cached(planCache, `${data.id}|${scenario}`, () => planDay(data, scenario, dayFor(data, scenario)));
  const actions = [...plan, ...custom.filter((a) => a.id.startsWith(`${data.id}:`))]
    .map((a) => {
      const r = records[a.id];
      return r ? { ...a, status: r.status, assigneeId: r.assigneeId ?? a.assigneeId, proofPhoto: r.proofPhoto ?? a.proofPhoto } : a;
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || b.rank - a.rank);
  return { data, scenario, actions, day: dayFor(data, scenario, effectsOf(actions)), usual: usualDay(data, scenario) };
}

export interface Moment {
  snap: SimSnapshot;
  usualSnap: SimSnapshot;
  /** Loop Score including the bonus from verified actions */
  score: LoopScore;
  /** Actions raised so far today (or already in progress) */
  visible: Action[];
}

/** The session as it stands at one minute of the day. */
export function momentAt(session: Session, minute: number): Moment {
  const snap = snapshotAt(session.day, minute);
  return {
    snap,
    usualSnap: snapshotAt(session.usual, minute),
    score: applyActionBonus(snap.score, session.actions),
    visible: session.actions.filter((a) => a.createdMinute <= minute || a.status !== 'pending'),
  };
}
