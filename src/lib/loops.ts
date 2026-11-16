/** The five loops. Colour tokens match tailwind.config.ts / globals.css. */
export type LoopId = 'waste' | 'energy' | 'rain' | 'reuse' | 'savings';

export interface LoopMeta {
  id: LoopId;
  index: number;
  name: string;
  short: string;
  /** Tailwind colour token name */
  token: 'waste' | 'energy' | 'rain' | 'water' | 'aqua';
  summary: string;
}

export const LOOPS: LoopMeta[] = [
  {
    id: 'waste',
    index: 1,
    name: 'Waste → Power',
    short: 'Waste',
    token: 'waste',
    summary: 'Wet waste goes to local biogas and stays out of the drains.',
  },
  {
    id: 'energy',
    index: 2,
    name: 'Sun + Biogas → Pumps',
    short: 'Energy',
    token: 'energy',
    summary: 'Pumps run in sunlit hours and tanks fill before planned cuts.',
  },
  {
    id: 'rain',
    index: 3,
    name: 'Rain → Water',
    short: 'Rain',
    token: 'rain',
    summary: 'Risky drains are cleared and recharge pits opened before a storm.',
  },
  {
    id: 'reuse',
    index: 4,
    name: 'Used water → Resource',
    short: 'Reuse',
    token: 'water',
    summary: 'Treated water is used on site, recharged, or sold as Green Water.',
  },
  {
    id: 'savings',
    index: 5,
    name: 'Saved water → Saved power',
    short: 'Savings',
    token: 'aqua',
    summary: 'Fewer tanker trips and less pumping mean a smaller power bill.',
  },
];

/** `rgb(var(--token))` string for SVG strokes and inline styles. */
export const loopColor = (token: LoopMeta['token'], alpha = 1): string =>
  `rgb(var(--${token}) / ${alpha})`;
