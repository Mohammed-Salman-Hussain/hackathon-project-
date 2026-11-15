/**
 * Names and places of the Loop Hubs, used by the selectors.
 * Hubs are fictional; the area names are real. Step 03 adds the engineering
 * fields (solar, tanks, STP …) in src/data/hubs.ts keyed by the same ids.
 */
export interface HubEntry {
  id: string;
  name: string;
  area: string;
  localityId: string;
  flats: number;
}

export const HUB_DIRECTORY: HubEntry[] = [
  { id: 'sri-sai', name: 'Sri Sai Residency', area: 'KPHB Phase 3', localityId: 'kukatpally', flats: 212 },
  { id: 'lakshmi-heights', name: 'Lakshmi Heights', area: 'KPHB Phase 1', localityId: 'kukatpally', flats: 140 },
  { id: 'green-park-c', name: 'Green Park Colony Block C', area: 'Moosapet', localityId: 'kukatpally', flats: 96 },
  { id: 'vasavi-towers', name: 'Vasavi Towers', area: 'KPHB Phase 6', localityId: 'kukatpally', flats: 320 },
  { id: 'nalla-cheruvu-view', name: 'Cheruvu View Apartments', area: 'Nalla Cheruvu', localityId: 'kukatpally', flats: 168 },
  { id: 'balaji-enclave', name: 'Balaji Enclave', area: 'Balanagar', localityId: 'kukatpally', flats: 124 },
  { id: 'rythu-bazar-res', name: 'Annapurna Residency', area: 'Rythu Bazar Road', localityId: 'kukatpally', flats: 88 },
  { id: 'sai-krupa', name: 'Sai Krupa Homes', area: 'KPHB Phase 4', localityId: 'kukatpally', flats: 180 },
  { id: 'idl-lake-view', name: 'Lake Ridge Block A', area: 'IDL Lake Road', localityId: 'kukatpally', flats: 240 },
  { id: 'vivekananda-c', name: 'Vivekananda Nagar Colony', area: 'Vivekananda Nagar', localityId: 'kukatpally', flats: 150 },
  { id: 'lb-sagar-ring', name: 'Sagar Ring Residency', area: 'Sagar Ring Road', localityId: 'lb-nagar', flats: 190 },
  { id: 'lb-kothapet', name: 'Kothapet Fruit Market Colony', area: 'Kothapet', localityId: 'lb-nagar', flats: 110 },
  { id: 'uppal-nacharam', name: 'Musi View Towers', area: 'Uppal Bhagayath', localityId: 'uppal', flats: 260 },
  { id: 'uppal-ramanthapur', name: 'Ramanthapur Lake Homes', area: 'Ramanthapur', localityId: 'uppal', flats: 132 },
  { id: 'yg-krishna-nagar', name: 'Krishna Nagar Residency', area: 'Krishna Nagar', localityId: 'yousufguda', flats: 104 },
  { id: 'yg-rahmath', name: 'Rahmath Nagar Heights', area: 'Rahmath Nagar', localityId: 'yousufguda', flats: 156 },
  { id: 'ap-sr-nagar', name: 'SR Nagar Square', area: 'SR Nagar', localityId: 'ameerpet', flats: 200 },
  { id: 'ap-balkampet', name: 'Balkampet Court', area: 'Balkampet', localityId: 'ameerpet', flats: 118 },
];

export const hubsIn = (localityId: string): HubEntry[] =>
  HUB_DIRECTORY.filter((h) => h.localityId === localityId);
