import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  icon?: ReactNode;
}

/** Themed dropdown. `label` is the accessible name. */
export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  icon,
  className,
  compact = false,
}: {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  label: string;
  icon?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectPrimitive.Trigger
        aria-label={label}
        className={cn(
          'inline-flex h-10 min-w-0 items-center justify-between gap-2 rounded-xl border bg-surface-2/60 px-3 text-sm font-medium text-text transition-colors hover:bg-surface-2',
          compact && 'h-9 px-2.5 text-xs',
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon ? <span className="shrink-0 text-water [&_svg]:size-4">{icon}</span> : null}
          <span className="truncate">
            <SelectPrimitive.Value />
          </span>
        </span>
        <SelectPrimitive.Icon>
          <ChevronDown className="size-3.5 shrink-0 text-muted" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-[60] max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border bg-surface-2 shadow-card animate-fade-up"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-3 pr-8 text-sm text-text outline-none data-[highlighted]:bg-water/15 data-[state=checked]:text-water"
              >
                {o.icon ? <span className="shrink-0 [&_svg]:size-4">{o.icon}</span> : null}
                <span className="flex flex-col">
                  <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                  {o.hint ? <span className="text-[11px] text-muted">{o.hint}</span> : null}
                </span>
                <SelectPrimitive.ItemIndicator className="absolute right-2">
                  <Check className="size-3.5" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
