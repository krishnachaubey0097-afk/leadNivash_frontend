// LeadNivesh In-Memory Access Token Store (PRD §7.3, §9)
// NEVER store tokens, phones or customer data in localStorage/sessionStorage.

let inMemoryToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export const tokenStore = {
  get(): string | null {
    return inMemoryToken;
  },

  set(token: string | null): void {
    inMemoryToken = token;
    listeners.forEach((listener) => listener(token));
  },

  clear(): void {
    inMemoryToken = null;
    listeners.forEach((listener) => listener(null));
  },

  subscribe(listener: (token: string | null) => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
