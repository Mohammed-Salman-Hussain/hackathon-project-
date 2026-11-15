import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Ellipsis } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useT } from '@/i18n/useT';
import type { MessageKey } from '@/i18n/en';
import { ROUTES } from '@/routes';
import { cn } from '@/lib/utils';

const PRIMARY = ['/command', '/loops', '/hub-twin', '/storm'];

const SHORT: Record<string, string> = { '/storm': 'Storm' };

/** Phone and tablet navigation: four main screens plus a "More" sheet with the rest. */
export function BottomNav() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const primary = ROUTES.filter((r) => PRIMARY.includes(r.path));
  const rest = ROUTES.filter((r) => !PRIMARY.includes(r.path));
  const moreActive = rest.some((r) => r.path === pathname);
  const tab =
    'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium text-muted transition-colors';

  return (
    <nav
      aria-label={t('nav.main')}
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t bg-bg/85 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-xl">
        {primary.map((r) => (
          <li key={r.path} className="flex min-w-0 flex-1">
            <NavLink to={r.path} className={({ isActive }) => cn(tab, isActive && 'text-water')}>
              <r.icon className="size-5" />
              <span className="max-w-full truncate">
                {SHORT[r.path] && t(`nav.${r.key}` as MessageKey) === r.label
                  ? SHORT[r.path]
                  : t(`nav.${r.key}` as MessageKey)}
              </span>
            </NavLink>
          </li>
        ))}
        <li className="flex min-w-0 flex-1">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" className={cn(tab, moreActive && 'text-water')}>
                <Ellipsis className="size-5" />
                <span>{t('nav.more')}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" title={t('nav.more')}>
              <ul className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-3">
                {rest.map((r) => (
                  <li key={r.path}>
                    <NavLink
                      to={r.path}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex h-full items-center gap-2.5 rounded-xl border bg-surface-2/50 px-3 py-3 text-sm font-medium text-text transition-colors hover:border-water/40',
                          isActive && 'border-water/50 bg-water/10 text-water',
                        )
                      }
                    >
                      <r.icon className="size-4 shrink-0 text-water" />
                      <span className="leading-tight">{t(`nav.${r.key}` as MessageKey)}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
