import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoopRing } from '@/components/common/LoopRing';
import { LOOPS, loopColor } from '@/lib/loops';
import { ROUTES } from '@/routes';

/** Overview page. Step 04 replaces the hero with the 3D Loop Ring and the scroll story. */
export function Home() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="grid items-center gap-8 py-8 md:grid-cols-[1.15fr_0.85fr] md:py-14">
        <div>
          <p className="chip border-water/30 text-water">Neighbourhood layer · Kukatpally, Hyderabad</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Water, power, waste and drains, <span className="text-gradient">working as one loop.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            LoopLocal is the brain that gets a neighbourhood&rsquo;s water, power, waste and drains to help
            each other. The Loop Hub is the body where its decisions happen.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/command">
                Enter Command Centre <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/loops">See the five loops</Link>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto grid place-items-center">
          <div className="absolute size-56 rounded-full bg-water/20 blur-3xl" aria-hidden />
          <LoopRing size={260} stroke={20} spin title="The five loops" className="relative max-w-full" />
          <div className="absolute text-center">
            <p className="font-display text-5xl font-bold">5</p>
            <p className="text-xs uppercase tracking-widest text-muted">loops, one engine</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="loops-h" className="py-4">
        <h2 id="loops-h" className="text-xl font-semibold">
          The five loops
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {LOOPS.map((l) => (
            <Card key={l.id} className="p-4" style={{ borderColor: loopColor(l.token, 0.3) }}>
              <p className="text-xs font-semibold" style={{ color: loopColor(l.token) }}>
                Loop {l.index}
              </p>
              <p className="mt-1 font-display font-semibold">{l.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{l.summary}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="screens-h" className="py-8">
        <h2 id="screens-h" className="text-xl font-semibold">
          Screens
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((r) => (
            <Link key={r.path} to={r.path} className="group rounded-2xl">
              <Card className="h-full p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-water/40 group-hover:shadow-glow">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-water/10 text-water">
                    <r.icon className="size-4" />
                  </span>
                  <p className="font-display font-semibold">{r.label}</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{r.blurb}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
