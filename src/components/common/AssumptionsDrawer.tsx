import type { ReactNode } from 'react';
import { FunctionSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { C, FORMULAS } from '@/engine/formulas';
import { useT } from '@/i18n/useT';
import { LOOPS, loopColor } from '@/lib/loops';

const CONSTANTS: [string, string][] = [
  ['Water use', `${C.LITRES_PER_FLAT_DAY} L per flat per day`],
  ['Piped supply', `${Math.round(C.MUNICIPAL_SHARE * 100)}% of a normal day's demand`],
  ['Tanker load / price', `${C.TANKER_L.toLocaleString('en-IN')} L · ₹${C.TANKER_RUPEES.toLocaleString('en-IN')} (indicative)`],
  ['Grid tariff', `₹${C.TARIFF.toFixed(2)}/kWh · +₹${C.PEAK_SURCHARGE.toFixed(2)} peak · −₹${C.OFFPEAK_DISCOUNT.toFixed(2)} 10 am–6 pm`],
  ['Biogas', `${C.BIOGAS_KWH_PER_M3} kWh per m³ · ${C.BIOGAS_RUN_HOURS} run hours`],
  ['STP', `${Math.round(C.STP_YIELD * 100)}% yield · ${C.STP_KWH_PER_KL} kWh per kL`],
  ['On-site reuse', `up to ${Math.round(C.ONSITE_REUSE_SHARE * 100)}% of demand`],
  ['Wet waste', `${C.WASTE_KG_PER_FLAT} kg per flat × ${Math.round(C.WET_SHARE * 100)}% wet`],
  ['Street floods when', `clog risk ≥ ${C.FLOOD_RISK}% and rain ≥ ${C.FLOOD_RAIN} mm/h`],
];

/** Every formula and constant behind the "Model estimate" numbers. */
export function AssumptionsDrawer({ trigger }: { trigger?: ReactNode }) {
  const t = useT();
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="secondary" size="sm">
            <FunctionSquare /> {t('ui.assumptions')}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent title={t('ui.assumptions')} description={t('ui.assumptionsHint')}>
        <ul className="space-y-3">
          {FORMULAS.map((f) => (
            <li key={f.id} className="rounded-xl border bg-surface-2/40 p-3">
              <p className="text-sm font-semibold">{f.name}</p>
              <code className="mt-1.5 block whitespace-pre-wrap rounded-lg bg-bg/60 px-2.5 py-2 font-mono text-[12px] leading-relaxed text-water">
                {f.expression}
              </code>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{f.note}</p>
            </li>
          ))}
        </ul>
        <h3 className="mb-2 mt-6 text-sm font-semibold">Loop Score weights</h3>
        <ul className="space-y-1.5">
          {LOOPS.map((l) => (
            <li key={l.id} className="flex items-center gap-2 text-sm">
              <span className="size-2.5 rounded-full" style={{ background: loopColor(l.token) }} />
              <span className="flex-1">{l.name}</span>
              <span className="font-mono text-muted">{Math.round(C.WEIGHTS[l.id] * 100)}%</span>
            </li>
          ))}
        </ul>
        <h3 className="mb-2 mt-6 text-sm font-semibold">Constants</h3>
        <dl className="divide-y rounded-xl border text-sm">
          {CONSTANTS.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-3 py-2">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </SheetContent>
    </Sheet>
  );
}
