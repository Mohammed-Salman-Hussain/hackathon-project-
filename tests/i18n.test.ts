import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/en';
import { hi } from '../src/i18n/hi';
import { te } from '../src/i18n/te';
import { ROUTES } from '../src/routes';
import { LOCALITIES } from '../src/data/localities';
import { hubsIn } from '../src/data/hubDirectory';

describe('i18n', () => {
  const keys = Object.keys(en).sort();
  it('Telugu and Hindi cover every English key with non-empty text', () => {
    for (const dict of [te, hi]) {
      expect(Object.keys(dict).sort()).toEqual(keys);
      for (const v of Object.values(dict)) expect(v.trim().length).toBeGreaterThan(0);
    }
  });
  it('every route has a nav label', () => {
    for (const r of ROUTES) expect(en).toHaveProperty(`nav.${r.key}`);
  });
});

describe('directory', () => {
  it('every locality has at least one hub', () => {
    for (const l of LOCALITIES) expect(hubsIn(l.id).length).toBeGreaterThan(0);
  });
});
