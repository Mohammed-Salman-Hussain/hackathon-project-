import { LOOPS, loopColor } from '@/lib/loops';
import { cn } from '@/lib/utils';

/**
 * Signature motif: a ring of five colour-coded arcs, one per loop.
 * `values` (0–1 each) fills each arc partially, for use as a gauge.
 */
export function LoopRing({
  size = 40,
  stroke,
  values,
  spin = false,
  className,
  title = 'LoopLocal',
}: {
  size?: number;
  stroke?: number;
  values?: number[];
  spin?: boolean;
  className?: string;
  title?: string;
}) {
  const sw = stroke ?? Math.max(3, size * 0.11);
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const seg = c / LOOPS.length;
  const gap = Math.min(seg * 0.22, sw * 1.6);
  const arc = seg - gap;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={title}
      className={cn(spin && 'animate-spin-slow', className)}
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`} fill="none" strokeLinecap="round">
        {LOOPS.map((loop, i) => {
          const v = values ? Math.max(0, Math.min(1, values[i] ?? 0)) : 1;
          return (
            <g key={loop.id}>
              {values ? (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  stroke={loopColor(loop.token, 0.16)}
                  strokeWidth={sw}
                  strokeDasharray={`${arc} ${c - arc}`}
                  strokeDashoffset={-(i * seg)}
                />
              ) : null}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={loopColor(loop.token)}
                strokeWidth={sw}
                strokeDasharray={`${Math.max(0.001, arc * v)} ${c}`}
                strokeDashoffset={-(i * seg)}
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
