import { useCallback } from 'react';
import { useUi, type Lang } from '@/store/ui';
import { en, type MessageKey } from './en';
import { hi } from './hi';
import { te } from './te';

const DICTS: Record<Lang, Record<MessageKey, string>> = { en, te, hi };

export const LANGS: { value: Lang; label: string; name: string }[] = [
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'te', label: 'తె', name: 'తెలుగు' },
  { value: 'hi', label: 'हि', name: 'हिन्दी' },
];

/** Returns `t(key)` for the current language, falling back to English. */
export function useT() {
  const lang = useUi((s) => s.lang);
  return useCallback((key: MessageKey): string => DICTS[lang][key] ?? en[key], [lang]);
}
