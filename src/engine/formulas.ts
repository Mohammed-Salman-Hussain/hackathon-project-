/**
 * Every formula the engine uses, in one file.
 * FORMULAS (bottom) is the plain-language list shown in the Assumptions drawer.
 * All outputs are model estimates built on the constants below.
 */

export const C = {
  /** Panel + inverter + dust losses */
  SOLAR_PERFORMANCE: 0.78,
  /** Electricity from a small biogas genset, kWh per m³ of gas */
  BIOGAS_KWH_PER_M3: 2.0,
  /** Hours a day the genset is sized to run */
  BIOGAS_RUN_HOURS: 6,
  /** Litres per person per day × people per flat */
  LITRES_PER_FLAT_DAY: 135 * 4,
  /** Share of a normal day's demand that piped supply delivers (5–8 am); the rest comes by tanker */
  MUNICIPAL_SHARE: 0.78,
  /** Share of supplied water that reaches the STP */
  SEWAGE_RETURN: 0.8,
  /** Treated output as a share of inflow, healthy plant / under-performing plant */
  STP_YIELD: 0.9,
  STP_YIELD_FAILING: 0.55,
  /** kWh used to treat 1,000 L */
  STP_KWH_PER_KL: 0.9,
  /** Share of fresh-water demand that treated water can replace (flushing, gardens, cooling) */
  ONSITE_REUSE_SHARE: 0.3,
  /** Runoff coefficient of a paved roof */
  RUNOFF: 0.8,
  /** Share of recharged water counted against later tanker need */
  RECHARGE_CREDIT: 0.3,
  /** One tanker load */
  TANKER_L: 5000,
  /** Indicative price of one private tanker load, ₹ */
  TANKER_RUPEES: 1200,
  /** Indicative grid tariff for common-area meters, ₹/kWh */
  TARIFF: 8.5,
  /** 2026-27 tariff order: +₹1.50 at peak, −₹0.50 from 10 am to 6 pm */
  PEAK_SURCHARGE: 1.5,
  OFFPEAK_DISCOUNT: 0.5,
  /** Waste per flat per day, kg, and the wet share (CPCB: 50–60%) */
  WASTE_KG_PER_FLAT: 1.2,
  WET_SHARE: 0.55,
  /** Rain rate at which a high-risk drain overflows, mm/h */
  FLOOD_RAIN: 15,
  FLOOD_RISK: 75,
  /** Loop Score weights (sum to 1) */
  WEIGHTS: { waste: 0.2, energy: 0.2, rain: 0.2, reuse: 0.2, savings: 0.2 },
  /** Most that verified actions can add to one loop's sub-score */
  ACTION_BONUS_CAP: 18,
} as const;

export const clamp = (x: number, min = 0, max = 1): number => Math.min(max, Math.max(min, x));

/** Clear-sky sunshine, 0–1: a half sine from 6 am to 6 pm. */
export function irradiance(hour: number): number {
  if (hour <= 6 || hour >= 18) return 0;
  return Math.sin((Math.PI * (hour - 6)) / 12);
}

/** solar_kW = capacity_kWp × irradiance(hour) × (1 − cloud) × 0.78 */
export function solarKw(capacityKwp: number, hour: number, cloud: number): number {
  return capacityKwp * irradiance(hour) * (1 - clamp(cloud)) * C.SOLAR_PERFORMANCE;
}

/** Gas made today, m³: unit size × waste volume × how well waste is segregated. */
export function biogasM3(m3PerDay: number, wasteFactor: number, segregation: number): number {
  return m3PerDay * wasteFactor * clamp(segregation / 100);
}

/** Power the genset gives while it runs, kW. */
export function biogasKw(m3Today: number): number {
  return (m3Today * C.BIOGAS_KWH_PER_M3) / C.BIOGAS_RUN_HOURS;
}

/** Water-use shape through the day; averages 1 over 24 h. Peaks 6–9 am and 6–9 pm. */
export function demandCurve(hour: number): number {
  const morning = Math.exp(-((hour - 7.5) ** 2) / 3.2);
  const evening = Math.exp(-((hour - 19.5) ** 2) / 4.5);
  const base = hour >= 5 && hour <= 23 ? 0.55 : 0.12;
  return (base + 1.9 * morning + 1.5 * evening) / 0.9285;
}

/** Fresh-water demand of a hub, litres per minute. Hot days use more. */
export function demandLpm(flats: number, hour: number, tempC: number): number {
  const heat = 1 + clamp((tempC - 34) / 30, 0, 0.3);
  return ((flats * C.LITRES_PER_FLAT_DAY) / 1440) * demandCurve(hour) * heat;
}

/** recharge_L = roof_area_m² × rain_mm × 0.8 × pit_open */
export function rechargeL(roofAreaM2: number, rainMm: number, pitOpen: number): number {
  return roofAreaM2 * rainMm * C.RUNOFF * clamp(pitOpen);
}

/** How much of the runoff a pit takes: 1 when inspected and open, less as silt builds up. */
export function pitOpenFactor(hasPit: boolean, cleanDaysAgo: number, inspected: boolean): number {
  if (!hasPit) return 0;
  if (inspected) return 1;
  return clamp(1 - cleanDaysAgo / 200, 0.2, 1);
}

/**
 * clog_risk (0–100) = 45% rain forecast + 25% waste-hotspot proximity
 *                   + 20% days since last clean (30 days = full) + 10% complaints (5 = full)
 */
export function clogRisk(input: {
  /** Heaviest rain expected in the next 6 h, mm/h */
  rainAheadMmPerHour: number;
  hotspotProximity: number;
  daysSinceClean: number;
  complaints: number;
  /** Narrowed drains choke sooner: design width ÷ current width */
  narrowing?: number;
}): number {
  const rain = clamp(input.rainAheadMmPerHour / 30);
  const narrow = clamp(((input.narrowing ?? 1) - 1) / 2.5, 0, 1) * 0.12;
  const risk =
    0.45 * rain +
    0.25 * clamp(input.hotspotProximity) +
    0.2 * clamp(input.daysSinceClean / 30) +
    0.1 * clamp(input.complaints / 5) +
    narrow * (0.4 + 0.6 * rain);
  return Math.round(clamp(risk) * 100);
}

/** Feeder load shape through the day; averages about 1. Evening peak 6–10 pm. */
export function loadCurve(hour: number): number {
  const morning = 0.22 * Math.exp(-((hour - 8) ** 2) / 5);
  const evening = 0.3 * Math.exp(-((hour - 20) ** 2) / 6);
  const night = -0.25 * Math.exp(-((hour - 3) ** 2) / 6);
  return 0.86 + morning + evening + night;
}

/** feeder_load_% = base × scenario load factor × hour curve + cooling uplift above 35 °C − shifted pumping */
export function feederLoadPct(basePct: number, loadFactor: number, hour: number, tempC: number, shiftedPct = 0): number {
  const cooling = clamp((tempC - 35) / 10, 0, 1) * 14;
  return Math.round(clamp(basePct * loadFactor * loadCurve(hour) + cooling - shiftedPct, 0, 130));
}

/** tankers_avoided = (tanker trips on the usual day − trips with LoopLocal) + recharge × 0.3 ÷ 5,000 L */
export function tankersAvoided(usualTrips: number, trips: number, rechargeLitres: number): number {
  return Math.max(0, usualTrips - trips) + (rechargeLitres * C.RECHARGE_CREDIT) / C.TANKER_L;
}

/** ₹ saved = clean kWh × (tariff + peak surcharge avoided) + tankers avoided × tanker price */
export function rupeesSaved(kwhShifted: number, tankers: number): number {
  return kwhShifted * (C.TARIFF + C.PEAK_SURCHARGE) + tankers * C.TANKER_RUPEES;
}

/** Wet waste a hub produces in a day, kg. */
export function wetWasteKgPerDay(flats: number, wasteFactor: number): number {
  return flats * C.WASTE_KG_PER_FLAT * C.WET_SHARE * wasteFactor;
}

/** Water flowing at 2–4 am when almost nobody is using any, litres per hour. A rising value means a leak. */
export function nightFlowLph(flats: number, leakGrowth: number, dayIndex: number, noise: number): number {
  const baseline = flats * 1.1;
  return Math.round(baseline * (1 + leakGrowth * dayIndex) * (1 + noise));
}

export interface FormulaDoc {
  id: string;
  name: string;
  expression: string;
  note: string;
}

export const FORMULAS: FormulaDoc[] = [
  { id: 'solar', name: 'Solar output', expression: 'solar_kW = capacity_kWp × irradiance(hour) × (1 − cloud) × 0.78',
    note: 'Irradiance is a half sine from 6 am to 6 pm. 0.78 covers panel, inverter and dust losses.' },
  { id: 'biogas', name: 'Biogas power', expression: 'biogas_kW = m³/day × waste factor × segregation × 2.0 kWh/m³ ÷ 6 run hours',
    note: 'Better segregation at source means more usable feed for the digester.' },
  { id: 'demand', name: 'Water demand', expression: 'demand_L/min = flats × 540 L/day ÷ 1440 × hour curve × heat factor',
    note: '135 litres per person per day, 4 people per flat. Peaks at 6–9 am and 6–9 pm.' },
  { id: 'tank', name: 'Tank level', expression: 'tank Δ = pump inflow − demand',
    note: 'With LoopLocal the pump runs on solar or biogas in daylight, and tops up before an announced cut. A tank is a battery you fill when power is available.' },
  { id: 'recharge', name: 'Rain recharged', expression: 'recharge_L = roof_area_m² × rain_mm × 0.8 × pit_open',
    note: 'pit_open is 1 for an inspected pit and falls towards 0.2 as silt builds up over 200 days.' },
  { id: 'clog', name: 'Drain clog risk', expression: 'clog_risk = 45% rain forecast + 25% waste hotspot + 20% days since clean + 10% complaints',
    note: 'Rain forecast is the heaviest rain expected in the next 6 hours (30 mm/h = full). Narrowed drains score higher.' },
  { id: 'stp', name: 'Treated water', expression: 'surplus = outflow − on-site use − recharge top-up',
    note: 'Outflow is 90% of inflow for a healthy plant. On-site use replaces up to 30% of fresh-water demand.' },
  { id: 'feeder', name: 'Feeder load', expression: 'load_% = base × scenario factor × hour curve + cooling uplift − shifted pumping',
    note: 'Cooling uplift starts above 35 °C. Evening peak is 6–10 pm.' },
  { id: 'tankers', name: 'Tankers avoided', expression: 'tankers = (trips on the usual day − trips with LoopLocal) + recharge × 0.3 ÷ 5,000 L',
    note: 'The usual day is the same weather with timer pumping and no reuse. Piped supply covers 78% of demand; a tanker is called when the sump falls below 10%. Only 30% of recharged water is counted.' },
  { id: 'rupees', name: 'Money saved', expression: '₹ = clean kWh × (₹8.50 + ₹1.50 peak surcharge) + tankers × ₹1,200',
    note: 'Indicative tariff and tanker price. Applicability of time-of-day rates to common-area meters is not confirmed.' },
  { id: 'score', name: 'Loop Score', expression: 'loop_score = 20% waste + 20% energy + 20% rain + 20% reuse + 20% savings',
    note: 'Each loop scores 0–100 from the day so far. Verified actions add up to 18 points to their loop.' },
];
