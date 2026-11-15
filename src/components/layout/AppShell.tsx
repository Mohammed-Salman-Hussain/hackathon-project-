import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useClock } from '@/hooks/useClock';
import { useThemeSync } from '@/hooks/useTheme';
import { useT } from '@/i18n/useT';
import { AuroraBackground } from './AuroraBackground';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

/** Frame around every page: side nav (desktop), top bar, content, footer, bottom nav (mobile). */
export function AppShell() {
  useClock();
  useThemeSync();
  const t = useT();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col lg:pl-60">
      <AuroraBackground />
      <a
        href="#main"
        onClick={(e) => {
          // The hash is used by the router, so move focus by hand.
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        {t('ui.skip')}
      </a>
      <SideNav />
      <TopBar />
      <main id="main" tabIndex={-1} className="flex-1 px-3 py-4 outline-none sm:px-5 lg:px-6 lg:py-6">
        <div key={pathname} className="animate-fade-up">
          <Outlet />
        </div>
      </main>
      <div className="pb-16 lg:pb-0">
        <Footer />
      </div>
      <BottomNav />
    </div>
  );
}
