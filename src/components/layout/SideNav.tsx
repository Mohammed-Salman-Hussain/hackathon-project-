import { Link, NavLink } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { useT } from '@/i18n/useT';
import type { MessageKey } from '@/i18n/en';
import { ROUTES, type RouteMeta } from '@/routes';
import { cn } from '@/lib/utils';

function Item({ route }: { route: RouteMeta }) {
  const t = useT();
  return (
    <li>
      <NavLink
        to={route.path}
        className={({ isActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-text/5 hover:text-text',
            isActive && 'bg-water/10 text-water hover:bg-water/10 hover:text-water',
          )
        }
      >
        {({ isActive }) => (
          <>
            <span
              aria-hidden
              className={cn(
                'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-water opacity-0 transition-opacity',
                isActive && 'opacity-100',
              )}
            />
            <route.icon className="size-4 shrink-0" />
            <span className="truncate">{t(`nav.${route.key}` as MessageKey)}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

/** Desktop navigation (lg and up). */
export function SideNav() {
  const t = useT();
  return (
    <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-bg/60 backdrop-blur-xl lg:flex">
      <Link to="/" aria-label="LoopLocal" className="flex h-16 items-center px-5">
        <Logo />
      </Link>
      <nav aria-label={t('nav.main')} className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        <ul className="space-y-0.5">
          {ROUTES.filter((r) => r.group === 'main').map((r) => (
            <Item key={r.path} route={r} />
          ))}
        </ul>
        <p className="mb-1 mt-5 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted/70">
          {t('nav.tools')}
        </p>
        <ul className="space-y-0.5">
          {ROUTES.filter((r) => r.group === 'tools').map((r) => (
            <Item key={r.path} route={r} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
