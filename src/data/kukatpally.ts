import type { BuyerSite, Drain, Feeder, Hub, Stp, Worker } from '@/engine/types';
import { createRng } from '@/engine/rng';
import { HUB_DIRECTORY } from './hubDirectory';

/**
 * Seed data for Kukatpally. Hubs, plants, workers and sites are fictional;
 * the area names and rough positions are real.
 */

/** Sizes that follow from the number of flats. */
export function deriveHub(
  base: Pick<Hub, 'id' | 'name' | 'area' | 'localityId' | 'flats' | 'lat' | 'lng' | 'section'>,
  spec: Partial<Hub>,
): Hub {
  const tankKl = Math.round(base.flats * 0.22);
  return {
    ...base,
    solarKwp: 0,
    roofAreaM2: Math.round(base.flats * 9),
    biogasM3PerDay: 0,
    tankKl,
    sumpKl: Math.round(tankKl * 2.2),
    pumpKw: Math.round((5.5 + base.flats / 40) * 10) / 10,
    pumpLpm: Math.round((tankKl * 1000) / 150),
    hasRechargePit: false,
    pitCleanDaysAgo: 0,
    stpKld: 0,
    stpRegistered: false,
    stpHealthy: true,
    connectedLoadKw: Math.round(18 + base.flats * 0.35),
    ownTransformer: false,
    segregationScore: 60,
    leakGrowth: 0,
    ...spec,
  };
}

type Spec = [id: string, lat: number, lng: number, section: string, spec: Partial<Hub>];

const HUB_SPECS: Spec[] = [
  ['sri-sai', 17.493, 78.392, 'KPHB-3',
    { solarKwp: 60, biogasM3PerDay: 40, hasRechargePit: true, pitCleanDaysAgo: 20, stpKld: 95, stpRegistered: true, ownTransformer: true, segregationScore: 78 }],
  ['lakshmi-heights', 17.4875, 78.399, 'KPHB-1',
    { solarKwp: 35, stpKld: 60, segregationScore: 62 }],
  ['green-park-c', 17.469, 78.425, 'MSP-1',
    { biogasM3PerDay: 15, hasRechargePit: true, pitCleanDaysAgo: 150, segregationScore: 55 }],
  ['vasavi-towers', 17.4985, 78.388, 'KPHB-6',
    { solarKwp: 110, biogasM3PerDay: 60, hasRechargePit: true, pitCleanDaysAgo: 35, stpKld: 140, stpRegistered: true, ownTransformer: true, segregationScore: 82 }],
  ['nalla-cheruvu-view', 17.483, 78.413, 'NCH-1',
    { solarKwp: 40, hasRechargePit: true, pitCleanDaysAgo: 95, stpKld: 75, stpHealthy: false, ownTransformer: true, segregationScore: 58 }],
  ['balaji-enclave', 17.476, 78.442, 'BLN-1',
    { solarKwp: 25, stpKld: 55, segregationScore: 49 }],
  ['rythu-bazar-res', 17.485, 78.408, 'VVN-1',
    { biogasM3PerDay: 25, segregationScore: 70 }],
  ['sai-krupa', 17.496, 78.396, 'KPHB-4',
    { solarKwp: 50, hasRechargePit: true, pitCleanDaysAgo: 60, stpKld: 80, stpRegistered: true, ownTransformer: true, segregationScore: 66, leakGrowth: 0.07 }],
  ['idl-lake-view', 17.48, 78.422, 'IDL-1',
    { solarKwp: 80, biogasM3PerDay: 45, hasRechargePit: true, pitCleanDaysAgo: 15, stpKld: 110, ownTransformer: true, segregationScore: 74 }],
  ['vivekananda-c', 17.499, 78.408, 'VVN-1',
    { solarKwp: 30, stpKld: 65, segregationScore: 52, leakGrowth: 0.04 }],
];

export const KUKATPALLY_HUBS: Hub[] = HUB_SPECS.map(([id, lat, lng, section, spec]) => {
  const entry = HUB_DIRECTORY.find((h) => h.id === id)!;
  return deriveHub({ ...entry, lat, lng, section }, spec);
});

export const KUKATPALLY_FEEDERS: Feeder[] = (
  [
    ['F-01', 'KPHB Phase 1 feeder', 'KPHB-1', 500, 68, 17.4868, 78.4005],
    ['F-02', 'KPHB Phase 3 feeder', 'KPHB-3', 500, 62, 17.4925, 78.3935],
    ['F-03', 'KPHB Phase 4 feeder', 'KPHB-4', 315, 71, 17.4952, 78.3972],
    ['F-04', 'KPHB Phase 6 feeder', 'KPHB-6', 630, 55, 17.4992, 78.3895],
    ['F-05', 'Moosapet feeder', 'MSP-1', 315, 74, 17.4702, 78.4238],
    ['F-06', 'Balanagar feeder', 'BLN-1', 500, 77, 17.4772, 78.4405],
    ['F-07', 'Nalla Cheruvu feeder', 'NCH-1', 315, 64, 17.4838, 78.4142],
    ['F-08', 'Vivekananda Nagar feeder', 'VVN-1', 400, 70, 17.4978, 78.4068],
    ['F-09', 'IDL Lake Road feeder', 'IDL-1', 400, 59, 17.4808, 78.4208],
  ] as const
).map(([id, name, section, capacityKva, baseLoadPct, lat, lng]) => ({ id, name, section, capacityKva, baseLoadPct, lat, lng }));

type DrainSpec = [name: string, lat: number, lng: number, over?: Partial<Drain>];

const DRAIN_SPECS: DrainSpec[] = [
  ['KPHB Phase 1 main drain', 17.4882, 78.4002],
  ['KPHB Phase 2 lane drain', 17.4905, 78.3968],
  ['KPHB Phase 3 colony drain', 17.4938, 78.3932, { daysSinceClean: 24, hotspotProximity: 0.55, complaints: 2 }],
  ['KPHB Phase 4 storm drain', 17.4958, 78.3975],
  ['KPHB Phase 5 culvert', 17.4972, 78.3925],
  ['KPHB Phase 6 outfall', 17.4996, 78.3872],
  ['IDL nala, Moosapet reach', 17.4725, 78.4232, { widthM: 2, designWidthM: 7, daysSinceClean: 41, hotspotProximity: 0.85, complaints: 6 }],
  ['IDL nala, lake inlet', 17.4792, 78.4215, { widthM: 3.5, designWidthM: 7, daysSinceClean: 33, hotspotProximity: 0.6, complaints: 3 }],
  ['Nalla Cheruvu outlet', 17.4822, 78.4138, { daysSinceClean: 36, hotspotProximity: 0.7, complaints: 4 }],
  ['Nalla Cheruvu surplus weir', 17.4841, 78.4161],
  ['Rythu Bazar market drain', 17.4853, 78.4086, { daysSinceClean: 19, hotspotProximity: 0.9, complaints: 5 }],
  ['Moosapet main road drain', 17.4682, 78.4262],
  ['Moosapet railway culvert', 17.4668, 78.4221, { daysSinceClean: 52, hotspotProximity: 0.5, complaints: 2 }],
  ['Balanagar industrial drain', 17.4768, 78.4432, { hotspotProximity: 0.65 }],
  ['Balanagar flyover drain', 17.4745, 78.4398],
  ['Khaitlapur transfer station drain', 17.4812, 78.4298, { daysSinceClean: 28, hotspotProximity: 0.95, complaints: 4 }],
  ['Vivekananda Nagar lane drain', 17.4985, 78.4075],
  ['Vivekananda Nagar park drain', 17.5002, 78.4102],
  ['JNTU road storm drain', 17.4948, 78.3905],
  ['Kukatpally Y-junction drain', 17.4852, 78.4128, { daysSinceClean: 30, hotspotProximity: 0.6, complaints: 3 }],
  ['Bhagyanagar colony drain', 17.4898, 78.4052],
  ['Allwyn colony nala', 17.5018, 78.4012, { widthM: 2.5, designWidthM: 4.5 }],
];

export function buildDrains(specs: DrainSpec[], seed: string): Drain[] {
  const rng = createRng(seed);
  return specs.map(([name, lat, lng, over], i) => {
    const angle = rng.range(0, Math.PI);
    const len = rng.range(0.0022, 0.0042);
    const dx = Math.cos(angle) * len;
    const dy = Math.sin(angle) * len;
    const bend = rng.range(-0.0008, 0.0008);
    const designWidthM = Math.round(rng.range(2, 5) * 2) / 2;
    return {
      id: `D-${String(i + 1).padStart(2, '0')}`,
      name,
      path: [
        [lng - dx, lat - dy],
        [lng + bend, lat - bend],
        [lng + dx, lat + dy],
      ],
      widthM: designWidthM,
      designWidthM,
      daysSinceClean: rng.int(3, 22),
      hotspotProximity: Math.round(rng.range(0.1, 0.45) * 100) / 100,
      complaints: rng.int(0, 2),
      ...over,
    };
  });
}

export const KUKATPALLY_DRAINS: Drain[] = buildDrains(DRAIN_SPECS, 'kukatpally-drains');

/** Hub plants plus four other private plants in the area. */
export const KUKATPALLY_STPS: Stp[] = [
  ...KUKATPALLY_HUBS.filter((h) => h.stpKld > 0).map((h) => ({
    id: `STP-${h.id}`,
    name: `${h.name} STP`,
    hubId: h.id,
    kld: h.stpKld,
    registered: h.stpRegistered,
    lat: h.lat,
    lng: h.lng,
  })),
  { id: 'STP-forum-arcade', name: 'Forum Arcade commercial complex STP', kld: 180, registered: true, lat: 17.4842, lng: 78.3895 },
  { id: 'STP-sunrise-hosp', name: 'Sunrise Multispeciality STP', kld: 120, registered: false, lat: 17.4915, lng: 78.4028 },
  { id: 'STP-metro-tech', name: 'Metro Tech Park STP', kld: 220, registered: false, lat: 17.4778, lng: 78.4352 },
  { id: 'STP-lotus-school', name: 'Lotus Public School STP', kld: 45, registered: false, lat: 17.4965, lng: 78.4041 },
];

export const KUKATPALLY_WORKERS: Worker[] = (
  [
    ['Ramesh Yadav', 'sanitation', 'KPHB'],
    ['Lakshmi Devi', 'sanitation', 'Moosapet'],
    ['Mohammed Irfan', 'sanitation', 'Balanagar'],
    ['Sunitha Rani', 'sanitation', 'Nalla Cheruvu'],
    ['Venkatesh Goud', 'pump', 'KPHB'],
    ['Srinivas Reddy', 'pump', 'Moosapet'],
    ['Anjali Kumari', 'pump', 'Vivekananda Nagar'],
    ['Abdul Rahman', 'plumber', 'KPHB'],
    ['Ravi Teja', 'plumber', 'Balanagar'],
    ['Padma Naidu', 'plumber', 'Nalla Cheruvu'],
    ['Kiran Kumar', 'lineman', 'KPHB'],
    ['Suresh Babu', 'lineman', 'Moosapet'],
  ] as const
).map(([name, trade, area], i) => ({ id: `W-${String(i + 1).padStart(2, '0')}`, name, trade, area }));

export const KUKATPALLY_SITES: BuyerSite[] = [
  { id: 'S-01', name: 'Metro corridor site, Moosapet', lat: 17.4712, lng: 78.4275, needKlPerDay: 30 },
  { id: 'S-02', name: 'Residential tower site, KPHB Phase 7', lat: 17.5008, lng: 78.3852, needKlPerDay: 18 },
  { id: 'S-03', name: 'Road-widening site, Balanagar', lat: 17.4752, lng: 78.4388, needKlPerDay: 12 },
];
