/**
 * Real Estate Speech Normalizer for Indian Real Estate (Hinglish / English / Hindi numbers)
 * Formats voice quirks like "three bhk" -> "3 BHK", "demand 80 lac" -> "demand 80 Lakh", etc.
 */
export function normalizeRealEstateVoiceTranscript(input: string): string {
  if (!input) return '';
  let text = input;

  // Replace spoken BHK formats
  text = text.replace(/\b(one|1)\s*(bhk|b\.h\.k|bedroom|bed\s*room)\b/gi, '1 BHK');
  text = text.replace(/\b(two|to|too|2)\s*(bhk|b\.h\.k|bedroom|bed\s*room)\b/gi, '2 BHK');
  text = text.replace(/\b(three|tree|3)\s*(bhk|b\.h\.k|bedroom|bed\s*room)\b/gi, '3 BHK');
  text = text.replace(/\b(four|for|4)\s*(bhk|b\.h\.k|bedroom|bed\s*room)\b/gi, '4 BHK');
  text = text.replace(/\b(five|5)\s*(bhk|b\.h\.k|bedroom|bed\s*room)\b/gi, '5 BHK');
  text = text.replace(/\bb\s*h\s*k\b/gi, 'BHK');

  // Replace spoken Lakhs / Crores
  text = text.replace(/\b(\d+)\s*(lac|lacs|lakh|lakhs)\b/gi, '$1 Lakh');
  text = text.replace(/\b(lac|lacs|lakhs)\b/gi, 'Lakh');
  text = text.replace(/\b(\d+)\s*(cr|crore|crores)\b/gi, '$1 Cr');
  text = text.replace(/\b(crore|crores)\b/gi, 'Cr');

  // Replace Gaj / Marla / Square yard
  text = text.replace(/\b(\d+)\s*(gaz|guj|gajj|gaaj)\b/gi, '$1 gaj');
  text = text.replace(/\b(gaz|guj|gajj|gaaj)\b/gi, 'gaj');
  text = text.replace(/\b(sq\s*yd|sq\s*yard|square\s*yard|square\s*yards)\b/gi, 'sq. yard');

  // Replace floor formats
  text = text.replace(/\b(first|1st)\s*floor\b/gi, '1st Floor');
  text = text.replace(/\b(second|2nd)\s*floor\b/gi, '2nd Floor');
  text = text.replace(/\b(third|3rd)\s*floor\b/gi, '3rd Floor');
  text = text.replace(/\b(ground)\s*floor\b/gi, 'Ground Floor');

  // Clean double spaces
  return text.replace(/\s+/g, ' ').trim();
}
