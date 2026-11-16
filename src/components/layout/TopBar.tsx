import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { HUB_DIRECTORY } from '@/data/hubDirectory';
import { useT } from '@/i18n/useT';
import { useUi } from '@/store/ui';
import { ROLE_ICONS, SCENARIO_ICONS } from '@/lib/icons';
import { ControlsSheet } from './ControlsSheet';
import {
  ClockControl,
  HubSelect,
  LanguageToggle,
  LocalitySelect,
  RoleSwitcher,
  ScenarioSelect,
  ThemeToggle,
} from './controls';

/**
 * Desktop (lg+): every control inline. Below xl the place selectors move into the
 * Controls sheet; on phones only the clock stays in the bar and a context strip
 * shows the current scenario, role and hub.
 */
export function TopBar() {
  const t = useT();
  const scenario = useUi((s) => s.scenario);
  const role = useUi((s) => s.role);
  const hubId = useUi((s) => s.hubId);
  const hub = HUB_DIRECTORY.find((h) => h.id === hubId);
  const ScenarioIcon = SCENARIO_ICONS[scenario];
  const RoleIcon = ROLE_ICONS[role];

  return (
    <header className="no-print sticky top-0 z-40 border-b bg-bg/75 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4 lg:h-16">
        <Link to="/" aria-label="LoopLocal" className="mr-1 rounded-lg lg:hidden">
          <Logo />
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          <LocalitySelect className="hidden w-[9.25rem] xl:inline-flex" />
          <HubSelect className="hidden w-[12.5rem] xl:inline-flex" />
          <ScenarioSelect className="w-[10.25rem]" />
        </div>

        <div className="flex-1" />

        <ClockControl className="hidden sm:inline-flex" />
        <ClockControl compact className="sm:hidden" />
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageToggle />
          <RoleSwitcher labelClassName="hidden min-[1400px]:inline" />
          <ThemeToggle />
        </div>
        <div className="xl:hidden">
          <ControlsSheet />
        </div>
      </div>

      {/* Context strip: phones and tablets */}
      <ControlsSheet
        trigger={
          <button
            type="button"
            aria-label={t('ui.controls')}
            className="flex w-full items-center gap-2 overflow-x-auto border-t px-3 py-1.5 text-xs no-scrollbar lg:hidden"
          >
            <span className="chip shrink-0 border-energy/30 text-energy">
              <ScenarioIcon className="size-3" />
              {t(`scenario.${scenario}`)}
            </span>
            <span className="chip shrink-0 border-water/30 text-water">
              <RoleIcon className="size-3" />
              {t(`role.${role}`)}
            </span>
            {hub ? <span className="truncate text-muted">{hub.name}</span> : null}
          </button>
        }
      />
    </header>
  );
}
