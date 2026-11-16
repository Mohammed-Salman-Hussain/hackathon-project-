import { CloudRain, Droplets, Recycle, Thermometer, Truck, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { AssumptionsDrawer } from '@/components/common/AssumptionsDrawer';
import { CountUp } from '@/components/common/CountUp';
import { GlassCard } from '@/components/common/GlassCard';
import { LoopScoreCard } from '@/components/common/LoopScoreCard';
import { clockLabel } from '@/engine/decisions';
import { useSim } from '@/hooks/useSim';
import { useT } from '@/i18n/useT';
import { fmtInt, fmtLitres } from '@/lib/format';
import { LOOPS, loopColor } from '@/lib/loops';

function Kpi({ icon, label, token, children }: { icon: ReactNode; label: string; token: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border bg-surface-2/40 p-3">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="[&_svg]:size-4" style={{ color: `rgb(var(--${token}))` }}>
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-1 font-display text-2xl font-bold">{children}</p>
    </div>
  );
}

/** Live read-out of the engine: Loop Score, the day's totals and the top actions. */
export function LiveEngine() {
  const t = useT();
  const { snap, visible, data } = useSim();
  const open = visible.filter((a) => a.status === 'pending').slice(0, 4);
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1.25fr]">
      <GlassCard
        title={`${data.name} · ${t(`scenario.${snap.scenario}`)}`}
        estimate
        action={<AssumptionsDrawer />}
        help="Loop Score is the weighted mean of the five loops for the day so far. Verified actions raise it."
      >
        <LoopScoreCard />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Kpi icon={<Truck />} label={t('kpi.tankers')} token="aqua">
            <CountUp value={snap.totals.tankersAvoided} format={fmtInt} />
          </Kpi>
          <Kpi icon={<Zap />} label={t('kpi.kwh')} token="energy">
            <CountUp value={snap.totals.kwhShifted} format={fmtInt} />
          </Kpi>
          <Kpi icon={<Droplets />} label={t('kpi.recharge')} token="rain">
            <CountUp value={snap.totals.rechargeL} format={fmtLitres} />
          </Kpi>
          <Kpi icon={<Recycle />} label={t('kpi.waste')} token="waste">
            <CountUp value={snap.totals.wasteDivertedKg} format={(n) => `${fmtInt(n)} kg`} />
          </Kpi>
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Thermometer className="size-3.5" /> {snap.weather.tempC} °C
          </span>
          <span className="inline-flex items-center gap-1">
            <CloudRain className="size-3.5" /> {snap.weather.rainMmPerHour} mm/h
          </span>
          {snap.sectionsDown.length ? (
            <span className="font-medium text-danger">Power out: {snap.sectionsDown.join(', ')}</span>
          ) : null}
        </p>
      </GlassCard>

      <GlassCard
        title={t('ui.topActions')}
        subtitle={`${visible.length} ${t('ui.raisedToday')}`}
        help="The decision engine ranks actions across all five loops by urgency, impact and confidence."
      >
        {open.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted">{t('ui.noActions')}</p>
        ) : (
          <ol className="space-y-2">
            {open.map((a, i) => {
              const loop = LOOPS.find((l) => l.id === a.loop)!;
              return (
                <li key={a.id} className="flex gap-3 rounded-xl border bg-surface-2/40 p-3">
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold"
                    style={{ background: loopColor(loop.token, 0.15), color: loopColor(loop.token) }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{a.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{a.reason}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      <span style={{ color: loopColor(loop.token) }}>{loop.name}</span> · by {clockLabel(a.deadlineMinute)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </GlassCard>
    </div>
  );
}
