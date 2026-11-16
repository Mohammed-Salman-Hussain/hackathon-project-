import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const sides = {
  right: 'inset-y-0 right-0 h-full w-[min(26rem,92vw)] rounded-l-2xl border-l',
  left: 'inset-y-0 left-0 h-full w-[min(20rem,88vw)] rounded-r-2xl border-r',
  bottom: 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl border-t',
} as const;

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: keyof typeof sides;
    title: string;
    description?: string;
  }
>(({ side = 'right', className, children, title, description, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#02050d]/65 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-50 overflow-y-auto bg-surface/95 p-5 shadow-card backdrop-blur-xl scrollbar-thin data-[state=open]:animate-fade-up',
        sides[side],
        className,
      )}
      {...props}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <DialogPrimitive.Title className="font-display text-lg font-semibold">{title}</DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1 text-sm text-muted">
              {description}
            </DialogPrimitive.Description>
          ) : null}
        </div>
        <DialogPrimitive.Close
          aria-label="Close"
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-text/5 hover:text-text"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      </div>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';
