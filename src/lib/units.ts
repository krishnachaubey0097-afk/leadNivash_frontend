// LeadNivesh Land Units Converter (PRD §3.6, §5.7, §7.6)
// Mirrors exact backend rules from backend/src/utils/units.ts

export type SupportedAreaUnit = 'gaj' | 'sqft' | 'sqmt' | 'marla' | 'kanal' | 'acre' | 'bigha';

export const UNIT_LABELS: Record<SupportedAreaUnit, string> = {
  gaj: 'Gaj / Sq.Yards (गज)',
  sqft: 'Square Feet (Sq.Ft)',
  sqmt: 'Square Meters (Sq.Mt)',
  marla: 'Marla (मरला)',
  kanal: 'Kanal (कनाल)',
  acre: 'Acre (एकड़)',
  bigha: 'Bigha (बीघा — manual check)',
};

export interface AreaConversionResult {
  gaj: number;
  sqft: number;
  sqmt: number;
  marla: number;
  kanal: number;
  acre: number;
  bighaNotice?: string;
}

/**
 * Converts area into canonical Gaj.
 * Bigha throws a manual verification refusal error per PRD §3.6.
 */
export const toCanonicalGaj = (value: number, unit: SupportedAreaUnit, marlaToGaj = 30.25): number => {
  if (unit === 'bigha') {
    throw new Error('Bigha alag-alag jagah alag hota hai — manually check karein');
  }

  switch (unit) {
    case 'gaj':
      return value;
    case 'sqft':
      return value / 9;
    case 'sqmt':
      return (value * 10.7639) / 9;
    case 'marla':
      return value * marlaToGaj;
    case 'kanal':
      return value * 20 * marlaToGaj;
    case 'acre':
      return value * 4840;
    default:
      return value;
  }
};

/**
 * Converts canonical Gaj into all units simultaneously.
 */
export const convertFromGaj = (gajValue: number, marlaToGaj = 30.25): AreaConversionResult => {
  return {
    gaj: Number(gajValue.toFixed(2)),
    sqft: Number((gajValue * 9).toFixed(2)),
    sqmt: Number(((gajValue * 9) / 10.7639).toFixed(2)),
    marla: Number((gajValue / marlaToGaj).toFixed(2)),
    kanal: Number((gajValue / (20 * marlaToGaj)).toFixed(3)),
    acre: Number((gajValue / 4840).toFixed(4)),
    bighaNotice: 'Bigha alag-alag jagah alag hota hai — manually check karein',
  };
};
