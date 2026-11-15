import { describe, expect, it } from 'vitest';
import {
  C,
  clogRisk,
  demandCurve,
  feederLoadPct,
  irradiance,
  pitOpenFactor,
  rechargeL,
  solarKw,
  tankersAvoided,
} from '../../src/engine/formulas';
import { createRng } from '../../src/engine/rng';
import { sha256Hex } from '../../src/engine/sha256';

describe('formulas', () => {
  it('solar: zero at night, capacity × 0.78 at clear-sky noon, less under cloud', () => {
    expect(solarKw(60, 3, 0)).toBe(0);
    expect(solarKw(60, 20, 0)).toBe(0);
    expect(solarKw(60, 12, 0)).toBeCloseTo(60 * 0.78, 5);
    expect(solarKw(60, 12, 0.5)).toBeCloseTo(60 * 0.78 * 0.5, 5);
    expect(irradiance(9)).toBeCloseTo(irradiance(15), 5);
  });

  it('recharge: roof × rain × 0.8 × pit', () => {
    expect(rechargeL(1000, 10, 1)).toBe(8000);
    expect(rechargeL(1000, 10, 0)).toBe(0);
    expect(pitOpenFactor(false, 0, true)).toBe(0);
    expect(pitOpenFactor(true, 150, true)).toBe(1);
    expect(pitOpenFactor(true, 150, false)).toBeCloseTo(0.25, 5);
    expect(pitOpenFactor(true, 400, false)).toBe(0.2);
  });

  it('clog risk rises with rain, hotspot, days since clean and complaints, within 0–100', () => {
    const base = { rainAheadMmPerHour: 0, hotspotProximity: 0.3, daysSinceClean: 10, complaints: 1 };
    const dry = clogRisk(base);
    expect(clogRisk({ ...base, rainAheadMmPerHour: 30 })).toBeGreaterThan(dry);
    expect(clogRisk({ ...base, hotspotProximity: 0.9 })).toBeGreaterThan(dry);
    expect(clogRisk({ ...base, daysSinceClean: 40 })).toBeGreaterThan(dry);
    expect(clogRisk({ ...base, complaints: 5 })).toBeGreaterThan(dry);
    expect(clogRisk({ rainAheadMmPerHour: 99, hotspotProximity: 1, daysSinceClean: 99, complaints: 99, narrowing: 4 })).toBe(100);
    expect(clogRisk({ rainAheadMmPerHour: 0, hotspotProximity: 0, daysSinceClean: 0, complaints: 0 })).toBe(0);
  });

  it('water-demand curve averages 1 over a day', () => {
    let sum = 0;
    for (let m = 0; m < 1440; m++) sum += demandCurve(m / 60);
    expect(sum / 1440).toBeCloseTo(1, 2);
  });

  it('feeder load peaks in the evening and falls when pumping is shifted', () => {
    expect(feederLoadPct(70, 1, 20, 30)).toBeGreaterThan(feederLoadPct(70, 1, 14, 30));
    expect(feederLoadPct(70, 1, 20, 30, 6)).toBe(feederLoadPct(70, 1, 20, 30) - 6);
    expect(feederLoadPct(70, 1, 15, 43)).toBeGreaterThan(feederLoadPct(70, 1, 15, 30));
  });

  it('tankers avoided never goes negative', () => {
    expect(tankersAvoided(3, 5, 0)).toBe(0);
    expect(tankersAvoided(5, 1, C.TANKER_L / C.RECHARGE_CREDIT)).toBe(5);
  });

  it('Loop Score weights sum to 1', () => {
    expect(Object.values(C.WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
  });
});

describe('rng', () => {
  it('is repeatable for the same seed and differs between seeds', () => {
    const a = createRng('seed');
    const b = createRng('seed');
    const c = createRng('other');
    const xs = Array.from({ length: 5 }, () => a.next());
    expect(Array.from({ length: 5 }, () => b.next())).toEqual(xs);
    expect(Array.from({ length: 5 }, () => c.next())).not.toEqual(xs);
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('sha256', () => {
  it('matches the published test vectors', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
  });
  it('matches Node crypto on longer, non-ASCII input', async () => {
    const { createHash } = await import('node:crypto');
    const text = 'LoopLocal · కూకట్‌పల్లి · '.repeat(40);
    expect(sha256Hex(text)).toBe(createHash('sha256').update(text).digest('hex'));
  });
});
