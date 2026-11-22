import { describe, it, expect } from 'vitest';
import { normalizeRealEstateVoiceTranscript } from './voiceNormalizer';

describe('normalizeRealEstateVoiceTranscript', () => {
  it('normalizes spoken BHK terms', () => {
    expect(normalizeRealEstateVoiceTranscript('need three bhk in model town')).toBe(
      'need 3 BHK in model town'
    );
    expect(normalizeRealEstateVoiceTranscript('two bhk floor')).toBe('2 BHK floor');
    expect(normalizeRealEstateVoiceTranscript('4 b.h.k luxury apartment')).toBe(
      '4 BHK luxury apartment'
    );
  });

  it('normalizes lakhs and crores', () => {
    expect(normalizeRealEstateVoiceTranscript('budget 85 lacs negotiable')).toBe(
      'budget 85 Lakh negotiable'
    );
    expect(normalizeRealEstateVoiceTranscript('demand 1.25 cr')).toBe('demand 1.25 Cr');
  });

  it('normalizes gaj and sq. yard', () => {
    expect(normalizeRealEstateVoiceTranscript('plot size 250 gaz')).toBe('plot size 250 gaj');
    expect(normalizeRealEstateVoiceTranscript('500 square yards')).toBe('500 sq. yard');
  });

  it('handles empty input gracefully', () => {
    expect(normalizeRealEstateVoiceTranscript('')).toBe('');
  });
});
