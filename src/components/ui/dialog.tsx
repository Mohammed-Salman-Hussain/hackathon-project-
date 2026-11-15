import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;

const overlay =
  'fixed inset-0 z-50 bg-[#02050d]/70 backdrop-blur-sm data-[state=open]:animate-fade-up';

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { title: string; description?: string }
>(({ className, children, title, description, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className={overlay} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'glass fixed left-1/2 top-1/2 z-50 max-h-[88dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-surface/95 p-5 scrollbar-thin',
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
DialogContent.displayName = 'DialogContent';
