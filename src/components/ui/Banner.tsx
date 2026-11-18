import React from 'react';
import clsx from 'clsx';
import { WifiOff, Server, AlertTriangle, X } from 'lucide-react';

export type BannerVariant = 'offline' | 'server-waking' | 'plan' | 'warning';

export interface BannerProps {
  variant: BannerVariant;
  message?: string;
  onDismiss?: () => void;
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({ variant, message, onDismiss, className }) => {
  const icon = {
    offline: <WifiOff className="w-4 h-4 shrink-0 text-danger" />,
    'server-waking': <Server className="w-4 h-4 shrink-0 text-warn animate-pulse" />,
    plan: <AlertTriangle className="w-4 h-4 shrink-0 text-gold-text" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0 text-warn" />,
  }[variant];

  const defaultMsg = {
    offline: 'You are currently offline. Some features may be temporarily unavailable.',
    'server-waking': 'Connecting to server… This may take 30–60 seconds on initial wake.',
    plan: '14-Day Free Trial Active — Unlimited access to all broker tools.',
    warning: 'Please review your pending actions.',
  }[variant];

  return (
    <div
      role="status"
      className={clsx(
        'w-full py-2 px-4 text-xs font-semibold flex items-center justify-between transition',
        variant === 'offline' && 'bg-red-50 dark:bg-red-950/60 text-danger border-b border-red-200 dark:border-red-900',
        variant === 'server-waking' && 'bg-amber-50 dark:bg-amber-950/60 text-warn border-b border-amber-200 dark:border-amber-900',
        variant === 'plan' && 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 border-b border-brand-50',
        variant === 'warning' && 'bg-amber-50 dark:bg-amber-950/60 text-warn border-b border-amber-200',
        className
      )}
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        {icon}
        <span>{message || defaultMsg}</span>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="p-1 hover:opacity-75 transition cursor-pointer" aria-label="Dismiss">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
