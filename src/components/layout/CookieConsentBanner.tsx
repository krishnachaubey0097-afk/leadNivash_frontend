import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const CookieConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('leadnivash_cookie_consent');
      if (!consent) {
        // Delay slightly for smooth entrance without jarring initial render
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // If localStorage is unavailable, fail silently
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('leadnivash_cookie_consent', 'all');
    } catch {}
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('leadnivash_cookie_consent', 'essential');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-slate-950/20 text-slate-900 dark:text-slate-100 text-xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold font-heading text-sm">
            <Cookie className="w-4 h-4 shrink-0" />
            <span>Privacy & Cookie Choices</span>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            aria-label="Dismiss cookie notice"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          We use essential cookies and secured local tokens to maintain your broker session, preserve your regional calculation standards, and protect private owner listings. We do not sell data or use third-party ad trackers.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[10px]">
            <Link
              to="/cookies"
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
            >
              Cookie Policy
            </Link>
            <span>·</span>
            <Link
              to="/privacy"
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
            >
              Privacy Policy
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Essential Only
            </button>
            <Button
              size="sm"
              pill
              onClick={handleAcceptAll}
              className="text-[11px] py-1.5 px-3 font-bold"
            >
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
