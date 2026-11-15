import { NavLink, Outlet, Link } from 'react-router-dom';
import { ROUTES } from '@/routes';
import { Logo } from '@/components/common/Logo';
import { AuroraBackground } from './AuroraBackground';
import { cn } from '@/lib/utils';

/** Minimal shell for Step 01. Step 02 replaces it with the full top bar and navigation. */
export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <AuroraBackground />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link to="/" aria-label="LoopLocal home">
            <Logo />
          </Link>
        </div>
        <nav aria-label="Main" className="mx-auto max-w-7xl overflow-x-auto px-2 no-scrollbar">
          <ul className="flex gap-1 pb-2">
            {ROUTES.map((r) => (
              <li key={r.path}>
                <NavLink
                  to={r.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm text-muted transition-colors hover:bg-text/5 hover:text-text',
                      isActive && 'bg-water/10 text-water',
                    )
                  }
                >
                  <r.icon className="size-4" />
                  {r.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className="flex-1 px-4 py-4">
        <Outlet />
      </main>
      <footer className="border-t px-4 py-4 text-center text-xs text-muted">
        The software recommends; people carry out the actions.
      </footer>
    </div>
  );
}
