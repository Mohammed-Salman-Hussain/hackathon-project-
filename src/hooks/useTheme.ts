import { useEffect } from 'react';
import { useUi } from '@/store/ui';

/** Keeps the <html> class and lang attribute in step with the store. */
export function useThemeSync(): void {
  const theme = useUi((s) => s.theme);
  const lang = useUi((s) => s.lang);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#060B1A' : '#F3F6FC');
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
}
