import type { Scenario, ScenarioId } from './types';

const bump = (hour: number, centre: number, width: number) => Math.exp(-((hour - centre) ** 2) / (2 * width * width));
const dayTemp = (min: number, max: number) => (hour: number) =>
  min + (max - min) * Math.max(0, Math.sin((Math.PI * (hour - 6)) / 16)) ** 1.3;

/**
 * The four days the engine can run. Hours are 0–24.
 * Outages point at feeders by index so the same scenario works in every locality.
 */
export const SCENARIOS: Record<ScenarioId, Scenario> = {
  normal: {
    id: 'normal',
    rainMmPerHour: () => 0,
    cloud: (h) => 0.12 + 0.1 * bump(h, 15, 2),
    tempC: dayTemp(23, 33),
    windKmh: () => 9,
    wasteFactor: 1,
    loadFactor: 1,
    outages: [],
  },
  storm: {
    id: 'storm',
    // Builds from 5:30 pm, heaviest around 8 pm, gone by midnight.
    rainMmPerHour: (h) => (h < 17.5 || h > 23.75 ? 0 : 2 + 24 * bump(h, 20, 1.2)),
    cloud: (h) => (h < 12 ? 0.25 : h < 16 ? 0.25 + ((h - 12) / 4) * 0.65 : 0.95),
    tempC: dayTemp(23, 31),
    windKmh: (h) => 12 + 46 * bump(h, 19.5, 1.6),
    wasteFactor: 1.05,
    loadFactor: 0.96,
    outages: [
      { feederIndex: 1, startHour: 19, hours: 3, planned: true },
      { feederIndex: 4, startHour: 19.75, hours: 5.5, planned: false },
      { feederIndex: 6, startHour: 20.25, hours: 2.5, planned: false },
    ],
  },
  heatwave: {
    id: 'heatwave',
    rainMmPerHour: () => 0,
    cloud: () => 0.04,
    tempC: dayTemp(29, 43),
    windKmh: () => 14,
    wasteFactor: 1,
    loadFactor: 1.1,
    outages: [{ feederIndex: 5, startHour: 15, hours: 1.5, planned: false }],
  },
  peak: {
    id: 'peak',
    rainMmPerHour: () => 0,
    cloud: (h) => 0.2 + 0.15 * bump(h, 13, 2),
    tempC: dayTemp(25, 36),
    windKmh: () => 8,
    wasteFactor: 1.1,
    loadFactor: 1.18,
    outages: [{ feederIndex: 0, startHour: 18.5, hours: 1.5, planned: true }],
  },
};

export const SCENARIO_IDS: ScenarioId[] = ['normal', 'storm', 'heatwave', 'peak'];
