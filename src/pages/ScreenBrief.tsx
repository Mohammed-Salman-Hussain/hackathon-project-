import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { RouteMeta } from '@/routes';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LOOPS, loopColor } from '@/lib/loops';

/**
 * Interim page for a screen whose build step has not landed yet.
 * Each one is replaced by the real screen in the step shown (docs/PLAN.md §6).
 */
export function ScreenBrief({ route }: { route: RouteMeta }) {
  const Icon = route.icon;
  return (
    <div className="mx-auto max-w-3xl animate-fade-up py-6">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-water/10 text-water">
            <Icon className="size-6" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              Build step {String(route.step).padStart(2, '0')}
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">{route.label}</h1>
          </div>
        </div>
        <p className="mt-5 text-base leading-relaxed text-muted">{route.blurb}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {LOOPS.map((l) => (
            <span
              key={l.id}
              className="chip"
              style={{ color: loopColor(l.token), borderColor: loopColor(l.token, 0.35) }}
            >
              {l.name}
            </span>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="secondary">
            <Link to="/">
              Back to overview <ArrowRight />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
