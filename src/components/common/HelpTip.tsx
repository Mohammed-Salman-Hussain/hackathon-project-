import { useState, type ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { CircleHelp } from 'lucide-react';
import { useT } from '@/i18n/useT';

/** The "?" on every panel. Opens on hover, focus and tap (so it works on phones). */
export function HelpTip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
      <TooltipPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={t('ui.help')}
          onClick={() => setOpen((o) => !o)}
          className="grid size-6 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-text/5 hover:text-water"
        >
          <CircleHelp className="size-4" />
        </button>
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side="bottom"
          align="end"
          sideOffset={6}
          collisionPadding={12}
          className="z-[60] max-w-[17rem] rounded-xl border bg-surface-2 px-3 py-2 text-xs leading-relaxed text-text shadow-card animate-fade-up"
        >
          {children}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
