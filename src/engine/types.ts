import type { LoopId } from '@/lib/loops';

export type { LoopId };
export type Role = 'officer' | 'resident' | 'worker';
export type ScenarioId = 'normal' | 'storm' | 'heatwave' | 'peak';
export type ActionStatus = 'pending' | 'dispatched' | 'done' | 'verified';
export type Trade = 'sanitation' | 'pump' | 'plumber' | 'lineman';
/** 'with' = LoopLocal scheduling on; 'without' = the same day run the usual way. */
export type Mode = 'with' | 'without';

export interface Hub {
  id: string;
  name: string;
  area: string;
  localityId: string;
  flats: number;
  lat: number;
  lng: number;
  /** Discom section (feeder) that supplies the hub */
  section: string;
  solarKwp: number;
  roofAreaM2: number;
  /** Biogas the unit can make per day at full feed; 0 = no unit */
  biogasM3PerDay: number;
  tankKl: number;
  sumpKl: number;
  pumpKw: number;
  /** Litres per minute the pump lifts from sump to overhead tank */
  pumpLpm: number;
  hasRechargePit: boolean;
  pitCleanDaysAgo: number;
  /** STP capacity, kilolitres per day; 0 = no plant */
  stpKld: number;
  /** Registered for Green Water Tanker sales */
  stpRegistered: boolean;
  /** False = plant under-performing (treated output well below inflow) */
  stpHealthy: boolean;
  connectedLoadKw: number;
  ownTransformer: boolean;
  /** Wet/dry segregation at source, 0–100 */
  segregationScore: number;
  /** Hidden leak growing by this fraction per day (0 = none) */
  leakGrowth: number;
}

export interface Drain {
  id: string;
  name: string;
  /** [lng, lat] points */
  path: [number, number][];
  widthM: number;
  designWidthM: number;
  daysSinceClean: number;
  /** 0–1: how close the drain is to a garbage hotspot */
  hotspotProximity: number;
  complaints: number;
}

export interface Feeder {
  id: string;
  name: string;
  section: string;
  capacityKva: number;
  /** Load at an average hour of a normal day, % of capacity */
  baseLoadPct: number;
  lat: number;
  lng: number;
}

export interface Stp {
  id: string;
  name: string;
  hubId?: string;
  kld: number;
  registered: boolean;
  lat: number;
  lng: number;
}

export interface Worker {
  id: string;
  name: string;
  trade: Trade;
  area: string;
}

export interface BuyerSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  needKlPerDay: number;
}

export interface LocalityData {
  id: string;
  name: string;
  hubs: Hub[];
  drains: Drain[];
  feeders: Feeder[];
  stps: Stp[];
  workers: Worker[];
  sites: BuyerSite[];
}

export interface Outage {
  /** Index into the locality's feeder list (wraps around) */
  feederIndex: number;
  startHour: number;
  hours: number;
  /** Planned cuts are announced ahead, so tanks can be topped up first */
  planned: boolean;
}

export interface Scenario {
  id: ScenarioId;
  rainMmPerHour: (hour: number) => number;
  /** 0–1 */
  cloud: (hour: number) => number;
  tempC: (hour: number) => number;
  windKmh: (hour: number) => number;
  wasteFactor: number;
  loadFactor: number;
  outages: Outage[];
}

export type PumpSource = 'solar' | 'biogas' | 'grid' | 'off';

export interface HubState {
  hubId: string;
  solarKw: number;
  biogasKw: number;
  pumpOn: boolean;
  pumpSource: PumpSource;
  tankPct: number;
  sumpPct: number;
  gridUp: boolean;
  /** Taps running: false when the overhead tank is empty */
  waterOn: boolean;
  stpRunning: boolean;
  /** Share of pump + STP energy so far today that came from solar or biogas, 0–1 */
  cleanShare: number;
  // Cumulative since midnight:
  demandL: number;
  stpInflowL: number;
  stpOutflowL: number;
  reuseL: number;
  rechargeTopUpL: number;
  stpSurplusL: number;
  rechargeL: number;
  wasteWetKg: number;
  wasteDivertedKg: number;
  kwhShifted: number;
  gridKwh: number;
  minutesWithoutWater: number;
  tankerTrips: number;
  tankersAvoided: number;
  rupeesSaved: number;
}

export interface LoopScore {
  total: number;
  byLoop: Record<LoopId, number>;
}

export interface Weather {
  rainMmPerHour: number;
  cloud: number;
  tempC: number;
  windKmh: number;
}

export interface Totals {
  tankersAvoided: number;
  kwhShifted: number;
  rechargeL: number;
  wasteDivertedKg: number;
  rupeesSaved: number;
  reuseL: number;
  surplusL: number;
  minutesWithoutWater: number;
  floodedDrains: number;
}

export interface SimSnapshot {
  minute: number;
  scenario: ScenarioId;
  mode: Mode;
  weather: Weather;
  hubs: Record<string, HubState>;
  /** 0–100 per drain */
  drainRisk: Record<string, number>;
  /** True while the drain is overflowing onto the street */
  drainFlooded: Record<string, boolean>;
  feederLoadPct: Record<string, number>;
  /** Sections without power right now */
  sectionsDown: string[];
  totals: Totals;
  score: LoopScore;
}

/** What a finished action changes in the simulation. */
export type ActionEffect =
  | { kind: 'drain'; drainId: string }
  | { kind: 'topup'; hubId: string }
  | { kind: 'pit'; hubId: string }
  | { kind: 'stp'; hubId: string }
  | { kind: 'shift'; section: string }
  | { kind: 'waste'; hubId: string }
  | { kind: 'leak'; hubId: string }
  | { kind: 'greenwater'; hubId: string }
  | { kind: 'none' };

export interface Action {
  id: string;
  loop: LoopId;
  title: string;
  reason: string;
  place: { label: string; lat: number; lng: number };
  assigneeRole: Trade | 'officer';
  assigneeId?: string;
  createdMinute: number;
  deadlineMinute: number;
  priority: 1 | 2 | 3;
  impact: { label: string; scoreDelta: number };
  status: ActionStatus;
  steps: string[];
  safetyTip: string;
  proofPhoto?: string;
  source: 'engine' | 'resident' | 'officer';
  effect: ActionEffect;
  /** Ranking value: urgency × impact × confidence */
  rank: number;
}

/** Effects of finished actions, fed back into the simulation. */
export interface Effects {
  clearedDrains: string[];
  toppedUpHubs: string[];
  openedPits: string[];
  fixedStps: string[];
  shiftedSections: string[];
  wasteCollected: string[];
  /** Assume every recommended action was carried out (used for comparisons). */
  all?: boolean;
}

export const NO_EFFECTS: Effects = {
  clearedDrains: [],
  toppedUpHubs: [],
  openedPits: [],
  fixedStps: [],
  shiftedSections: [],
  wasteCollected: [],
};

export interface AuditEntry {
  id: string;
  /** Simulated day and minute when it happened */
  day: number;
  minute: number;
  actor: Role | 'engine';
  event: string;
  prevHash: string;
  hash: string;
}
