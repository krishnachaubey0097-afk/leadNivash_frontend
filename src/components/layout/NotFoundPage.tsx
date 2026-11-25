import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Home, LayoutDashboard, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = '404 - Page Not Found | LeadNivash';
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="relative max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xl space-y-5 text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-2xs group-hover:border-emerald-600/40 transition flex items-center justify-center">
            <img src="/logo-icon.png" alt="LeadNivash" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg font-black tracking-tight text-ink font-heading">
            Lead<span className="text-emerald-700">Nivash</span>
          </span>
        </Link>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-black tracking-widest uppercase border border-emerald-300/40 inline-block">
            Error 404
          </span>
          <h1 className="text-2xl font-black text-ink font-heading tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-muted max-w-xs mx-auto leading-relaxed">
            The page you are looking for doesn't exist, has been removed, or the link may be broken.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          <Link to="/app">
            <Button pill className="w-full font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs">
              <LayoutDashboard className="w-4 h-4 mr-1.5" />
              <span>Go to Broker Dashboard</span>
            </Button>
          </Link>

          <Link to="/">
            <Button variant="secondary" pill className="w-full font-bold text-xs">
              <Home className="w-4 h-4 mr-1.5" />
              <span>Back to Homepage</span>
            </Button>
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-muted hover:text-ink pt-1 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Need assistance? Contact support</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
