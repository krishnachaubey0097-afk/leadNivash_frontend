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
  | 'neutral'
  | 'brand'
  | 'gold';

export interface BadgeProps {
  variant?: BadgeVariant;
  pill?: boolean;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  pill = true,
  dot = false,
  children,
  className,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold tracking-wide transition-colors',
        pill ? 'rounded-full' : 'rounded-md',
        // Status & Match Variants
        variant === 'available' && 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-600',
        variant === 'brand' && 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-600',
        variant === 'hold' && 'bg-warn-bg text-warn dark:bg-amber-950/40 dark:text-amber-400',
        variant === 'sold' && 'bg-amber-100 dark:bg-amber-950/50 text-gold-text font-black',
        variant === 'gold' && 'bg-gold-bg text-gold-text dark:bg-amber-950/40 dark:text-amber-400',
        variant === 'rented' && 'bg-blue-100 dark:bg-blue-950/50 text-info',
        variant === 'perfect' && 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-600 font-extrabold',
        variant === 'good' && 'bg-blue-50 dark:bg-blue-950/40 text-info font-bold',
        variant === 'stretch' && 'bg-warn-bg text-warn font-semibold',
        variant === 'neutral' && 'bg-slate-100 dark:bg-slate-800 text-muted',
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'available' || variant === 'brand' || variant === 'perfect'
              ? 'bg-brand-600'
              : variant === 'sold' || variant === 'gold' || variant === 'hold'
              ? 'bg-gold'
              : variant === 'rented' || variant === 'good'
              ? 'bg-info'
              : 'bg-muted'
          )}
        />
      )}
      {variant === 'sold' && <Check className="w-3 h-3 stroke-[3]" />}
      {children}
    </span>
  );
};
