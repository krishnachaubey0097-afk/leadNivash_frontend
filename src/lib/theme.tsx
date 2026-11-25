import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'emerald' | 'navy' | 'gold' | 'indigo' | 'terracotta';

export interface AccentOption {
  id: AccentColor;
  name: string;
  hex: string;
  description: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'emerald', name: 'Emerald Green', hex: '#00875A', description: 'LeadNivash Brand Default' },
  { id: 'navy', name: 'Royal Navy', hex: '#2563EB', description: 'Corporate & Institutional' },
  { id: 'gold', name: 'Champagne Gold', hex: '#D97706', description: 'Luxury & High-Ticket' },
  { id: 'indigo', name: 'Urban Indigo', hex: '#6366F1', description: 'Modern Tech Broker' },
  { id: 'terracotta', name: 'Terracotta Red', hex: '#E11D48', description: 'High-Energy Closing' },
];

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('ln_theme_mode') as ThemeMode) || 'light';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('ln_accent_color') as AccentColor;
    return ACCENT_OPTIONS.some((opt) => opt.id === saved) ? saved : 'emerald';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);

  // Apply theme class and data-theme attribute
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('ln_theme_mode', mode);
  }, [mode, isDark]);

  // Handle Accent Color
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accent);
    localStorage.setItem('ln_accent_color', accent);
  }, [accent]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, accent, setAccent, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
