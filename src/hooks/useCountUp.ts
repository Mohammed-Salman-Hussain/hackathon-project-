import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Eases a displayed number towards `value`.
 * One loop chases the latest target, so frequent updates never restart or overshoot.
 */
export function useCountUp(value: number, ms = 450): number {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const current = useRef(value);
  const target = useRef(value);
  const raf = useRef(0);

  useEffect(() => {
    target.current = value;
    if (reduced) {
      current.current = value;
      setShown(value);
      return;
    }
    if (raf.current) return; // already chasing
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.max(0, now - last);
      last = now;
      const gap = target.current - current.current;
      const done = Math.abs(gap) <= Math.max(0.5, Math.abs(target.current) * 0.002);
      current.current = done ? target.current : current.current + gap * (1 - Math.exp(-dt / (ms / 3)));
      setShown(current.current);
      raf.current = done ? 0 : requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  }, [value, ms, reduced]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    },
    [],
  );

  return shown;
}
