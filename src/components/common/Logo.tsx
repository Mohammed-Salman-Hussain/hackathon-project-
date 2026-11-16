import { LoopRing } from './LoopRing';
import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LoopRing size={30} title="LoopLocal logo" />
      {showText ? (
        <span className="font-display text-lg font-bold tracking-tight">
          Loop<span className="text-water">Local</span>
        </span>
      ) : null}
    </span>
  );
}
