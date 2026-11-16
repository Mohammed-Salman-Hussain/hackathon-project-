const int = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const one = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 });

export const fmtInt = (n: number): string => int.format(Math.round(n));
export const fmtOne = (n: number): string => one.format(n);
/** Litres as "850 L", "12.4 kL" or "1.2 ML". */
export function fmtLitres(l: number): string {
  if (l >= 1_000_000) return `${one.format(l / 1_000_000)} ML`;
  if (l >= 1000) return `${one.format(l / 1000)} kL`;
  return `${int.format(l)} L`;
}
/** Rupees as "₹8,400" or "₹1.2 lakh". */
export function fmtRupees(r: number): string {
  if (r >= 100_000) return `₹${one.format(r / 100_000)} lakh`;
  return `₹${int.format(Math.round(r / 10) * 10)}`;
}
