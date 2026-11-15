import { CountUp } from '@/components/common/CountUp';
import { LoopRing } from '@/components/common/LoopRing';
import { useSim } from '@/hooks/useSim';
import { useT } from '@/i18n/useT';
import { LOOPS, loopColor } from '@/lib/loops';
import { cn } from '@/lib/utils';
import { AssumptionsDrawer } from './AssumptionsDrawer';

/** Loop Score gauge with the five sub-scores. `compact` is the side-nav version. */
export function LoopScoreCard({ compact = false, className }: { compact?: boolean; className?: string }) {
  const t = useT();
  const { score } = useSim();
  const size = compact ? 64 : 132;
  return (
    <div className={cn('flex items-center gap-3', !compact && 'gap-5', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <LoopRing
          size={size}
          stroke={compact ? 6 : 12}
          values={LOOPS.map((l) => score.byLoop[l.id] / 100)}
          title={`${t('kpi.score')} ${score.total}`}
        />
        <span className={cn('absolute inset-0 grid place-items-center font-display font-bold', compact ? 'text-lg' : 'text-4xl')}>
          <CountUp value={score.total} format={(n) => String(Math.round(n))} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('font-semibold', compact ? 'text-xs text-muted' : 'text-sm')}>{t('kpi.score')}</p>
        {compact ? (
          <AssumptionsDrawer
            trigger={
              <button type="button" className="mt-0.5 text-xs font-medium text-water underline-offset-2 hover:underline">
                {t('ui.assumptions')}
              </button>
            }
          />
        ) : (
          <ul className="mt-2 space-y-1">
            {LOOPS.map((l) => (
              <li key={l.id} className="flex items-center gap-2 text-xs">
                <span className="w-14 shrink-0 text-muted">{l.short}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-text/10">
                  <span
                    className="block h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${score.byLoop[l.id]}%`, background: loopColor(l.token) }}
                  />
                </span>
                <span className="w-6 text-right font-mono tabular-nums">{score.byLoop[l.id]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
