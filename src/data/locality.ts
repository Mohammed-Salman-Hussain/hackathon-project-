import type { Drain, Feeder, Hub, LocalityData, Stp, Worker } from '@/engine/types';
import { createRng } from '@/engine/rng';
import { hubsIn } from './hubDirectory';
import {
  KUKATPALLY_DRAINS,
  KUKATPALLY_FEEDERS,
  KUKATPALLY_HUBS,
  KUKATPALLY_SITES,
  KUKATPALLY_STPS,
  KUKATPALLY_WORKERS,
  buildDrains,
  deriveHub,
} from './kukatpally';
import { LOCALITIES } from './localities';

const KUKATPALLY: LocalityData = {
  id: 'kukatpally',
  name: 'Kukatpally',
  hubs: KUKATPALLY_HUBS,
  drains: KUKATPALLY_DRAINS,
  feeders: KUKATPALLY_FEEDERS,
  stps: KUKATPALLY_STPS,
  workers: KUKATPALLY_WORKERS,
  sites: KUKATPALLY_SITES,
};

const WORKER_NAMES = ['Narsing Rao', 'Fatima Begum', 'Mahesh Chary', 'Kavitha Bai', 'Yadagiri', 'Shankar Naik'] as const;
const TRADES = ['sanitation', 'sanitation', 'pump', 'plumber', 'lineman', 'pump'] as const;

/**
 * The other four localities get a smaller, generated data set (seeded, so it is
 * the same on every visit). It lets the whole app run when the locality changes.
 */
function generate(id: string, name: string, center: [number, number]): LocalityData {
  const rng = createRng(`locality-${id}`);
  const code = name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const [lng0, lat0] = center;
  const entries = hubsIn(id);

  const feeders: Feeder[] = [0, 1, 2].map((i) => ({
    id: `F-${String(i + 1).padStart(2, '0')}`,
    name: `${entries[i % entries.length]!.area} feeder${i >= entries.length ? ' 2' : ''}`,
    section: `${code}-${i + 1}`,
    capacityKva: rng.pick([315, 400, 500]),
    baseLoadPct: rng.int(58, 78),
    lat: lat0 + rng.range(-0.008, 0.008),
    lng: lng0 + rng.range(-0.008, 0.008),
  }));

  const hubs: Hub[] = entries.map((e, i) =>
    deriveHub(
      {
        ...e,
        lat: lat0 + rng.range(-0.007, 0.007),
        lng: lng0 + rng.range(-0.007, 0.007),
        section: feeders[i % feeders.length]!.section,
      },
      {
        solarKwp: i === 0 ? Math.round(e.flats * 0.3) : rng.pick([0, 30]),
        biogasM3PerDay: i === 0 ? Math.round(e.flats * 0.18) : 0,
        hasRechargePit: i === 0,
        pitCleanDaysAgo: rng.int(20, 120),
        stpKld: Math.round(e.flats * 0.45),
        stpRegistered: i === 0,
        ownTransformer: i === 0,
        segregationScore: rng.int(48, 76),
      },
    ),
  );

  const drains: Drain[] = buildDrains(
    Array.from({ length: 8 }, (_, i) => {
      const area = entries[i % entries.length]!.area;
      const kind = ['main drain', 'lane drain', 'storm drain', 'culvert'][i % 4];
      const risky = i % 3 === 0;
      return [
        `${area} ${kind}${i >= 4 * entries.length ? ' 2' : ''}`,
        lat0 + rng.range(-0.009, 0.009),
        lng0 + rng.range(-0.009, 0.009),
        risky ? { daysSinceClean: rng.int(26, 45), hotspotProximity: rng.range(0.55, 0.9), complaints: rng.int(2, 5) } : undefined,
      ];
    }),
    `${id}-drains`,
  );

  const stps: Stp[] = hubs.map((h) => ({
    id: `STP-${h.id}`,
    name: `${h.name} STP`,
    hubId: h.id,
    kld: h.stpKld,
    registered: h.stpRegistered,
    lat: h.lat,
    lng: h.lng,
  }));

  const workers: Worker[] = WORKER_NAMES.map((n, i) => ({
    id: `W-${String(i + 1).padStart(2, '0')}`,
    name: n,
    trade: TRADES[i]!,
    area: entries[i % entries.length]!.area,
  }));

  return {
    id,
    name,
    hubs,
    drains,
    feeders,
    stps,
    workers,
    sites: [
      { id: 'S-01', name: `Construction site, ${entries[0]!.area}`, lat: lat0 + 0.004, lng: lng0 - 0.005, needKlPerDay: 20 },
    ],
  };
}

const cache = new Map<string, LocalityData>([['kukatpally', KUKATPALLY]]);

/** Everything the engine needs to know about one locality. */
export function getLocality(id: string): LocalityData {
  const hit = cache.get(id);
  if (hit) return hit;
  const meta = LOCALITIES.find((l) => l.id === id) ?? LOCALITIES[0]!;
  const data = meta.id === 'kukatpally' ? KUKATPALLY : generate(meta.id, meta.name, meta.center);
  cache.set(id, data);
  return data;
}
