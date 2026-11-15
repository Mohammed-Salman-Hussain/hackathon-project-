import { Building2, MapPin, Moon, Pause, Play, Sun } from 'lucide-react';
import { ROLE_ICONS, SCENARIO_ICONS } from '@/lib/icons';
import { Select } from '@/components/ui/select';
import { Tooltip } from '@/components/ui/tooltip';
import { Segmented } from '@/components/common/Segmented';
import { LOCALITIES } from '@/data/localities';
import { hubsIn } from '@/data/hubDirectory';
import { LANGS, useT } from '@/i18n/useT';
import { formatClock, useUi, type Role, type ScenarioId, DAY_MINUTES } from '@/store/ui';
import { cn } from '@/lib/utils';

export function LocalitySelect({ className }: { className?: string }) {
  const t = useT();
  const value = useUi((s) => s.localityId);
  const set = useUi((s) => s.setLocality);
  return (
    <Select
      label={t('ui.locality')}
      value={value}
      onChange={set}
      icon={<MapPin />}
      className={className}
      options={LOCALITIES.map((l) => ({ value: l.id, label: l.name }))}
    />
  );
}

export function HubSelect({ className }: { className?: string }) {
  const t = useT();
  const localityId = useUi((s) => s.localityId);
  const value = useUi((s) => s.hubId);
  const set = useUi((s) => s.setHub);
  return (
    <Select
      label={t('ui.hub')}
      value={value}
      onChange={set}
      icon={<Building2 />}
      className={className}
      options={hubsIn(localityId).map((h) => ({
        value: h.id,
        label: h.name,
        hint: `${h.area} · ${h.flats} ${t('ui.flats')}`,
      }))}
    />
  );
}

const SCENARIOS: ScenarioId[] = ['normal', 'storm', 'heatwave', 'peak'];

export function ScenarioSelect({ className }: { className?: string }) {
  const t = useT();
  const value = useUi((s) => s.scenario);
  const set = useUi((s) => s.setScenario);
  const Icon = SCENARIO_ICONS[value];
  return (
    <Select
      label={t('ui.scenario')}
      value={value}
      onChange={set}
      icon={<Icon />}
      className={className}
      options={SCENARIOS.map((id) => {
        const I = SCENARIO_ICONS[id];
        return { value: id, label: t(`scenario.${id}`), icon: <I /> };
      })}
    />
  );
}

const ROLES: Role[] = ['officer', 'resident', 'worker'];

export function RoleSwitcher({ labelClassName, full }: { labelClassName?: string; full?: boolean }) {
  const t = useT();
  const value = useUi((s) => s.role);
  const set = useUi((s) => s.setRole);
  return (
    <Segmented
      label={t('ui.role')}
      value={value}
      onChange={set}
      full={full}
      labelClassName={labelClassName}
      options={ROLES.map((r) => {
        const I = ROLE_ICONS[r];
        return { value: r, label: t(`role.${r}`), icon: <I /> };
      })}
    />
  );
}

export function LanguageToggle({ full }: { full?: boolean }) {
  const t = useT();
  const value = useUi((s) => s.lang);
  const set = useUi((s) => s.setLang);
  return (
    <Segmented
      label={t('ui.language')}
      value={value}
      onChange={set}
      full={full}
      options={LANGS.map((l) => ({ value: l.value, label: l.label, title: l.name }))}
    />
  );
}

export function ThemeToggle() {
  const t = useT();
  const theme = useUi((s) => s.theme);
  const set = useUi((s) => s.setTheme);
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <Tooltip label={`${t('ui.theme')}: ${t(`ui.${next}`)}`}>
      <button
        type="button"
        aria-label={`${t('ui.theme')}: ${t(`ui.${next}`)}`}
        onClick={() => set(next)}
        className="grid size-9 shrink-0 place-items-center rounded-xl border bg-surface-2/60 text-muted transition-colors hover:text-energy"
      >
        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </Tooltip>
  );
}

/** Time of day, play / pause, speed, and a thin day-progress bar. */
export function ClockControl({ compact = false, className }: { compact?: boolean; className?: string }) {
  const t = useT();
  const minute = useUi((s) => s.minute);
  const playing = useUi((s) => s.playing);
  const speed = useUi((s) => s.speed);
  const setPlaying = useUi((s) => s.setPlaying);
  const cycleSpeed = useUi((s) => s.cycleSpeed);
  const isDay = minute >= 6 * 60 && minute < 18 * 60 + 30;
  return (
    <div
      role="group"
      aria-label={t('ui.clock')}
      className={cn(
        'relative inline-flex h-9 shrink-0 items-center gap-1 overflow-hidden rounded-xl border bg-surface-2/60 pl-2.5 pr-1',
        className,
      )}
    >
      {isDay ? <Sun className="size-4 text-energy" aria-hidden /> : <Moon className="size-4 text-rain" aria-hidden />}
      <span className="w-[3.1rem] text-center font-mono text-sm font-semibold tabular-nums" aria-live="off">
        {formatClock(minute)}
      </span>
      <button
        type="button"
        aria-label={playing ? t('ui.pause') : t('ui.play')}
        aria-pressed={playing}
        onClick={() => setPlaying(!playing)}
        className="grid size-7 place-items-center rounded-lg text-water transition-colors hover:bg-water/15"
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      {!compact ? (
        <button
          type="button"
          aria-label={`${t('ui.speed')} ${speed}×`}
          onClick={cycleSpeed}
          className="h-7 min-w-8 rounded-lg px-1.5 text-xs font-bold text-muted transition-colors hover:bg-text/5 hover:text-text"
        >
          {speed}×
        </button>
      ) : null}
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-water to-aqua"
        style={{ width: `${(minute / DAY_MINUTES) * 100}%` }}
      />
    </div>
  );
}
