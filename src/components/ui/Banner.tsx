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
    plan: <AlertTriangle className="w-4 h-4 shrink-0 text-brand-700" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0 text-warn" />,
  }[variant];

  const defaultMsg = {
    offline: 'You are currently offline. Some features may be temporarily unavailable.',
    'server-waking': 'Connecting to server… This may take 30–60 seconds on initial wake.',
    plan: '14-day free trial active — unlimited access to all broker tools.',
    warning: 'Please review your pending actions.',
  }[variant];

  return (
    <div
      role="status"
      className={clsx(
        'w-full py-2.5 px-4 text-secondary font-medium flex items-center justify-between transition-colors duration-150',
        variant === 'offline' && 'bg-danger-bg text-danger border-b border-danger/10',
        variant === 'server-waking' && 'bg-warn-bg text-warn border-b border-warn/10',
        variant === 'plan' && 'bg-brand-50 text-brand-700 border-b border-brand-200/30',
        variant === 'warning' && 'bg-warn-bg text-warn border-b border-warn/10',
        className
      )}
    >
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
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
