import { useEffect } from 'react';
import { SIM_MINUTES_PER_SECOND, useUi } from '@/store/ui';

/**
 * The one clock for the whole app. Mount once (in AppShell).
 * Advances the store in whole simulated minutes so subscribers re-render
 * at most ~12–48 times a second, not on every animation frame.
 */
export function useClock(): void {
  const playing = useUi((s) => s.playing);
  const speed = useUi((s) => s.speed);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    const frame = (now: number) => {
      // Cap the step so a background tab does not jump hours ahead on return.
      const dt = Math.min(now - last, 250);
      last = now;
      carry += (dt / 1000) * SIM_MINUTES_PER_SECOND * speed;
      if (carry >= 1) {
        const whole = Math.floor(carry);
        carry -= whole;
        useUi.getState().advance(whole);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);
}
