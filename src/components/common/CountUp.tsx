import { useCountUp } from '@/hooks/useCountUp';

/** A number that eases to its new value. `format` turns it into text. */
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  return <span className="tabular-nums">{format(useCountUp(value))}</span>;
}
