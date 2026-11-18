import { describe, it, expect } from 'vitest';
import { normalizeToE164, formatDisplayPhone, getDigitsOnly } from '../lib/phone';

describe('Phone Normalization & Formatting', () => {
  it('normalizes 10-digit Indian numbers to E.164', () => {
    expect(normalizeToE164('9812345678')).toBe('+919812345678');
    expect(normalizeToE164('98123-45678')).toBe('+919812345678');
  });

  it('formats display phone with clean spaces', () => {
    expect(formatDisplayPhone('9812345678')).toBe('+91 98123 45678');
    expect(formatDisplayPhone('919812345678')).toBe('+91 98123 45678');
  });

  it('extracts digits only for wa.me links', () => {
    expect(getDigitsOnly('+91 98123-45678')).toBe('919812345678');
    expect(getDigitsOnly('9812345678')).toBe('919812345678');
  });
});
