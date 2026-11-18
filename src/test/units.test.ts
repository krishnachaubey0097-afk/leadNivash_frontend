import { describe, it, expect } from 'vitest';
import { toCanonicalGaj, convertFromGaj } from '../lib/units';

describe('Units Converter Engine', () => {
  it('converts sqft to canonical gaj (1 gaj = 9 sqft)', () => {
    expect(toCanonicalGaj(900, 'sqft')).toBe(100);
    expect(toCanonicalGaj(1800, 'sqft')).toBe(200);
  });

  it('converts marla to canonical gaj using marlaToGaj factor', () => {
    expect(toCanonicalGaj(1, 'marla', 30.25)).toBe(30.25);
    expect(toCanonicalGaj(2, 'marla', 25)).toBe(50);
  });

  it('converts acre to canonical gaj (1 acre = 4840 gaj)', () => {
    expect(toCanonicalGaj(1, 'acre')).toBe(4840);
  });

  it('refuses to auto-convert bigha per PRD §3.6 rule', () => {
    expect(() => toCanonicalGaj(1, 'bigha')).toThrowError(
      'Bigha alag-alag jagah alag hota hai — manually check karein'
    );
  });

  it('converts from gaj into all unit outputs', () => {
    const res = convertFromGaj(100);
    expect(res.gaj).toBe(100);
    expect(res.sqft).toBe(900);
    expect(res.bighaNotice).toContain('manually check karein');
  });
});
