import { HashRouter, Route, Routes } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { AppShell } from '@/components/layout/AppShell';
import { Home } from '@/pages/Home';
import { NotFound } from '@/pages/NotFound';
import { ScreenBrief } from '@/pages/ScreenBrief';
import { ROUTES } from '@/routes';
import { useUi } from '@/store/ui';

export default function App() {
  const theme = useUi((s) => s.theme);
  return (
    <TooltipProvider delayDuration={200}>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Home />} />
            {ROUTES.map((r) => (
              <Route key={r.path} path={r.path} element={<ScreenBrief route={r} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster theme={theme} />
    </TooltipProvider>
  );
}
