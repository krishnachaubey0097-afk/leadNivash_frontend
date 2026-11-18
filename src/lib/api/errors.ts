export interface ApiFieldError {
  [field: string]: string[] | string;
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public fields?: ApiFieldError;

  constructor(status: number, code: string, message: string, fields?: ApiFieldError) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Maps API error codes to human-friendly, practical Hinglish/English UX messages
 * based on PRD §7.4 & Appendix A.
 */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'VALIDATION_ERROR':
        if (err.fields) {
          const firstKey = Object.keys(err.fields)[0];
          const val = err.fields[firstKey];
          return Array.isArray(val) ? val[0] : String(val);
        }
        return err.message || 'Kripya sabhi fields sahi bharein.';
      case 'INVALID_CREDENTIALS':
      case 'UNAUTHORIZED':
        return 'Email ya password galat hai';
      case 'TOKEN_EXPIRED':
      case 'TOKEN_INVALID':
        return 'Aapka session expire ho gaya hai. Dobara login karein.';
      case 'FORBIDDEN':
        return 'Aapko is action ki permission nahi hai.';
      case 'NOT_FOUND':
        return 'Requested record nahi mila ya delete ho chuka hai.';
      case 'CONFLICT':
        return err.message || 'Ye record pehle se maujood hai.';
      case 'PLAN_LIMIT_REACHED':
        return 'Aapki limit poori ho gayi. Pro mein unlimited fair-use milta hai.';
      case 'PAYLOAD_TOO_LARGE':
        return 'Text bahut lamba hai (max 4000 characters).';
      case 'PARSE_FAILED':
        return 'AI abhi details identify nahi kar paya. Manually check karke save karein.';
      case 'AI_UNAVAILABLE':
        return 'AI abhi available nahi hai — details check karke save karein.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Bahut saari requests bheji gayi hain. Thodi der baad try karein.';
      case 'LINK_EXPIRED':
        return 'Ye share link expire ho gaya hai.';
      default:
        return err.message || 'Kuch gadbad hui. Thodi der baad try karein.';
    }
  }

  if (err instanceof Error) {
    if (err.message.includes('Network Error')) {
      return 'Internet nahi hai — server se connection nahi ho pa raha.';
    }
    return err.message;
  }

  return 'An unexpected error occurred.';
};
