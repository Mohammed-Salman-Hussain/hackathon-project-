import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Shown in the tooltip when the label is hidden */
  title?: string;
}

/** Radio group drawn as a pill of buttons. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  labelClassName,
  className,
  full = false,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentedOption<T>[];
  label: string;
  /** e.g. "hidden min-[1400px]:inline" to show icons only on narrow bars */
  labelClassName?: string;
  className?: string;
  full?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5 rounded-xl border bg-surface-2/60 p-0.5', full && 'flex w-full', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        const btn = (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.title ?? o.label}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-[0.6rem] px-2.5 text-xs font-semibold text-muted transition-colors hover:text-text [&_svg]:size-4',
              full ? 'flex-1' : 'whitespace-nowrap',
              active && 'bg-water/15 text-water shadow-[inset_0_0_0_1px_rgb(var(--water)/0.35)]',
            )}
          >
            {o.icon}
            <span className={cn(o.icon && labelClassName)}>{o.label}</span>
          </button>
        );
        return o.icon && labelClassName ? (
          <Tooltip key={o.value} label={o.title ?? o.label}>
            {btn}
          </Tooltip>
        ) : (
          btn
        );
      })}
    </div>
  );
}
