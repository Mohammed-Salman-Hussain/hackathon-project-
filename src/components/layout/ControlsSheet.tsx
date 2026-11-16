import { useState, type ReactNode } from 'react';
import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useT } from '@/i18n/useT';
import { resetDemo, useUi } from '@/store/ui';
import {
  ClockControl,
  HubSelect,
  LanguageToggle,
  LocalitySelect,
  RoleSwitcher,
  ScenarioSelect,
  ThemeToggle,
} from './controls';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      {children}
    </div>
  );
}

/** All top-bar controls in one panel, for phones and narrow windows. Also holds "Reset demo". */
export function ControlsSheet({ trigger }: { trigger?: ReactNode }) {
  const t = useT();
  const theme = useUi((s) => s.theme);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          {trigger ?? (
            <button
              type="button"
              aria-label={t('ui.controls')}
              className="grid size-9 shrink-0 place-items-center rounded-xl border bg-surface-2/60 text-muted transition-colors hover:text-water"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          )}
        </SheetTrigger>
        <SheetContent title={t('ui.controls')} description={t('ui.controlsHint')}>
          <div className="space-y-5">
            <Field label={t('ui.role')}>
              <RoleSwitcher full />
            </Field>
            <Field label={t('ui.scenario')}>
              <ScenarioSelect className="w-full" />
            </Field>
            <Field label={t('ui.locality')}>
              <LocalitySelect className="w-full" />
            </Field>
            <Field label={t('ui.hub')}>
              <HubSelect className="w-full" />
            </Field>
            <Field label={t('ui.clock')}>
              <ClockControl />
            </Field>
            <Field label={t('ui.language')}>
              <LanguageToggle full />
            </Field>
            <Field label={`${t('ui.theme')}: ${t(`ui.${theme}`)}`}>
              <ThemeToggle />
            </Field>
            <div className="border-t pt-4">
              <Button variant="secondary" className="w-full" onClick={() => setConfirm(true)}>
                <RotateCcw /> {t('ui.reset')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent title={`${t('ui.reset')}?`} description={t('ui.resetConfirm')} className="max-w-sm">
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">{t('ui.cancel')}</Button>
            </DialogClose>
            <Button variant="danger" onClick={resetDemo}>
              <RotateCcw /> {t('ui.reset')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
