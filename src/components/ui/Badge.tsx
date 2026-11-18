import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

export type BadgeVariant =
  | 'available'
  | 'hold'
  | 'sold'
  | 'rented'
  | 'perfect'
  | 'good'
  | 'stretch'
  | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider',
        // Status & Match Variants
        variant === 'available' && 'bg-brand-50 text-brand-700',
        variant === 'hold' && 'bg-warn-bg text-warn',
        variant === 'sold' && 'bg-amber-100 dark:bg-amber-950/50 text-gold-text font-black',
        variant === 'rented' && 'bg-blue-100 dark:bg-blue-950/50 text-info',
        variant === 'perfect' && 'bg-brand-50 text-brand-700 font-extrabold',
        variant === 'good' && 'bg-blue-50 dark:bg-blue-950/40 text-info font-bold',
        variant === 'stretch' && 'bg-warn-bg text-warn font-semibold',
        variant === 'neutral' && 'bg-slate-100 dark:bg-slate-800 text-muted',
        className
      )}
    >
      {variant === 'sold' && <Check className="w-3 h-3 stroke-[3]" />}
      {children}
    </span>
  );
};
