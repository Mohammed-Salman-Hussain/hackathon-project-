import { Sigma } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { useT } from '@/i18n/useT';
import { cn } from '@/lib/utils';

/** Marks a number as an output of the engine, not a measurement. */
export function EstimateChip({ className }: { className?: string }) {
  const t = useT();
  return (
    <Tooltip label={t('ui.estimateTip')}>
      <span tabIndex={0} className={cn('chip cursor-help border-aqua/30 bg-aqua/5 text-aqua', className)}>
        <Sigma className="size-3" />
        {t('ui.estimate')}
      </span>
    </Tooltip>
  );
}
