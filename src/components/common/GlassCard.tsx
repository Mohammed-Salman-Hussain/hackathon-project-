import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { EstimateChip } from './EstimateChip';
import { HelpTip } from './HelpTip';

/** Standard panel: title, optional "Model estimate" chip, and a "?" help tip. */
export function GlassCard({
  title,
  subtitle,
  help,
  estimate = false,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  help?: ReactNode;
  estimate?: boolean;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold">{title}</h3>
            {estimate ? <EstimateChip /> : null}
          </div>
          {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {action}
          {help ? <HelpTip>{help}</HelpTip> : null}
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </Card>
  );
}
