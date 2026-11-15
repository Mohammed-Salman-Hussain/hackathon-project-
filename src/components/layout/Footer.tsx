import { useT } from '@/i18n/useT';

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t px-4 py-5 text-center text-xs text-muted">
      <p className="font-medium text-text/80">{t('footer.line')}</p>
      <p className="mt-1">LoopLocal · {t('footer.note')} · SDG 6 · 7 · 9 · 11</p>
    </footer>
  );
}
