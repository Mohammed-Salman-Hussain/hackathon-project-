export interface Locality {
  id: string;
  name: string;
  /** Map centre [lng, lat] */
  center: [number, number];
}

export const LOCALITIES: Locality[] = [
  { id: 'kukatpally', name: 'Kukatpally', center: [78.4011, 17.4948] },
  { id: 'lb-nagar', name: 'LB Nagar', center: [78.5526, 17.3457] },
  { id: 'uppal', name: 'Uppal', center: [78.5593, 17.4018] },
  { id: 'yousufguda', name: 'Yousufguda', center: [78.4283, 17.4375] },
  { id: 'ameerpet', name: 'Ameerpet', center: [78.4483, 17.4375] },
];

export const DEFAULT_LOCALITY = 'kukatpally';
