import { describe, expect, it } from 'vitest';
import { LOOPS } from '../src/lib/loops';
import { ROUTES } from '../src/routes';

describe('scaffold', () => {
  it('defines exactly five loops with unique ids', () => {
    expect(LOOPS).toHaveLength(5);
    expect(new Set(LOOPS.map((l) => l.id)).size).toBe(5);
  });

  it('has unique route paths and keys', () => {
    expect(new Set(ROUTES.map((r) => r.path)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map((r) => r.key)).size).toBe(ROUTES.length);
  });
});
