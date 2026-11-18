// LeadNivesh WhatsApp Link Builder (PRD §6.2, Appendix B)
import { getDigitsOnly } from './phone';

/**
 * Builds standard https://wa.me/{phone}?text=... link
 */
export const buildWhatsAppLink = (phone?: string | null, text?: string): string => {
  const digits = getDigitsOnly(phone);
  const encoded = text ? encodeURIComponent(text) : '';
  if (digits) {
    return `https://wa.me/${digits}${encoded ? `?text=${encoded}` : ''}`;
  }
  return `https://wa.me/${encoded ? `?text=${encoded}` : ''}`;
};

export const openWhatsApp = (phone?: string | null, text?: string): void => {
  const url = buildWhatsAppLink(phone, text);
  window.open(url, '_blank', 'noopener,noreferrer');
};
