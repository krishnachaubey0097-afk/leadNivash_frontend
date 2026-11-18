import { describe, it, expect } from 'vitest';
import { ApiError, getErrorMessage } from '../lib/api/errors';

describe('Error-Code to UX Mapping (PRD §7.4)', () => {
  it('maps 401 unauthorized to friendly error', () => {
    const err = new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    expect(getErrorMessage(err)).toBe('Email ya password galat hai');
  });

  it('maps 402 plan limit reached to upgrade prompt', () => {
    const err = new ApiError(402, 'PLAN_LIMIT_REACHED', 'Limit reached');
    expect(getErrorMessage(err)).toBe('Aapki limit poori ho gayi. Pro mein unlimited fair-use milta hai.');
  });

  it('maps validation errors with field path', () => {
    const err = new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', {
      email: ['Valid email address is required'],
    });
    expect(getErrorMessage(err)).toBe('Valid email address is required');
  });

  it('maps 429 rate limit exceeded', () => {
    const err = new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Rate limited');
    expect(getErrorMessage(err)).toContain('Thodi der baad try karein');
  });
});
