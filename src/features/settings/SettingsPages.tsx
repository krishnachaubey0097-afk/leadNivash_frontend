import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Button';
import { Settings as SettingsIcon, Sun, Moon, Type, LogOut } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleSetTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('ln_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('ln_theme', 'light');
    }
  };

  const handleToggleLargeText = () => {
    const isLg = document.documentElement.getAttribute('data-text') === 'lg';
    if (isLg) {
      document.documentElement.removeAttribute('data-text');
      localStorage.removeItem('ln_text');
    } else {
      document.documentElement.setAttribute('data-text', 'lg');
      localStorage.setItem('ln_text', 'lg');
    }
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-5 h-5 text-brand-600" />
        <h1 className="text-lg font-bold text-ink font-heading">Settings & Preferences</h1>
      </div>

      {/* Appearance (§5.9) */}
      <div className="p-5 bg-surface border border-border rounded-card space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Appearance</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleSetTheme('light')}>
            <Sun className="w-4 h-4 mr-1.5 text-amber-500" />
            <span>Light Theme</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleSetTheme('dark')}>
            <Moon className="w-4 h-4 mr-1.5 text-blue-400" />
            <span>Dark Theme</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleToggleLargeText} className="w-full">
          <Type className="w-4 h-4 mr-1.5" />
          <span>Toggle Large Text Mode</span>
        </Button>
      </div>

      {/* Broker Profile (§5.9) */}
      <div className="p-5 bg-surface border border-border rounded-card space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted">Broker Profile</h2>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Broker Name</span>
            <span className="font-bold text-ink">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Email</span>
            <span className="font-bold text-ink">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">WhatsApp Phone</span>
            <span className="font-bold text-ink">{user?.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Agency</span>
            <span className="font-bold text-ink">{user?.agency?.name || 'Independent'}</span>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <Button variant="danger" onClick={() => logout()} className="w-full">
        <LogOut className="w-4 h-4 mr-2" />
        <span>Sign Out of LeadNivesh</span>
      </Button>
    </div>
  );
};
