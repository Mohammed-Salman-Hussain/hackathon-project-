import { useMemo } from 'react';
import { getLocality } from '@/data/locality';
import { buildSession, momentAt, type Moment, type Session } from '@/engine/session';
import { STEP } from '@/engine/simulate';
import { useSimStore } from '@/store/sim';
import { useUi } from '@/store/ui';

/** The day for the selected locality and scenario. Changes only when those or an action changes. */
export function useSession(): Session {
  const localityId = useUi((s) => s.localityId);
  const scenario = useUi((s) => s.scenario);
  const records = useSimStore((s) => s.records);
  const custom = useSimStore((s) => s.custom);
  return useMemo(() => buildSession(getLocality(localityId), scenario, records, custom), [localityId, scenario, records, custom]);
}

/** The session at the current simulated time. Re-renders once per 5 simulated minutes. */
export function useSim(): Session & Moment {
  const session = useSession();
  const tick = useUi((s) => Math.floor(s.minute / STEP));
  return useMemo(() => ({ ...session, ...momentAt(session, tick * STEP) }), [session, tick]);
}
