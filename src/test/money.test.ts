import { describe, it, expect } from 'vitest';
import { parseToPaise, formatRupees, formatShortPrice } from '../lib/money';

describe('Money Engine (Integer Paise & Indian Formatter)', () => {
  it('parses crore notation into exact integer paise', () => {
    // 1.2 Cr = 1,20,00,000 Rupees = 1,20,00,00,000 paise
    expect(parseToPaise('1.2cr')).toBe(1200000000);
    expect(parseToPaise('1.25 crore')).toBe(1250000000);
    expect(parseToPaise('2 Cr')).toBe(2000000000);
  });

  it('parses lakh notation into exact integer paise', () => {
    // 90 L = 90,00,000 paise * 100 = 9,00,00,000 paise
    expect(parseToPaise('90L')).toBe(900000000);
    expect(parseToPaise('15 lakh')).toBe(150000000);
    expect(parseToPaise('85.5 lacs')).toBe(855000000);
  });

  it('parses plain numeric inputs into integer paise', () => {
    expect(parseToPaise('1500000')).toBe(150000000);
    expect(parseToPaise('50000')).toBe(5000000);
    expect(parseToPaise('₹ 1,50,000')).toBe(15000000);
  });

  it('returns null for invalid inputs', () => {
    expect(parseToPaise('')).toBeNull();
    expect(parseToPaise('abc')).toBeNull();
    expect(parseToPaise('-500')).toBeNull();
  });

  it('formats integer paise into full Indian currency format', () => {
    expect(formatRupees(150000000)).toBe('₹15,00,000');
    expect(formatRupees(1200000000)).toBe('₹1,20,00,000');
    expect(formatRupees(0)).toBe('₹0');
  });

  it('formats integer paise into short readable mobile notation', () => {
    expect(formatShortPrice(1200000000)).toBe('₹1.2 Cr');
    expect(formatShortPrice(900000000)).toBe('₹90 L');
    expect(formatShortPrice(5000000)).toBe('₹50 K');
  });
});
