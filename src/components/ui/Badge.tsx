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
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-meta font-semibold transition-colors',
        pill ? 'rounded-full' : 'rounded-md',
        // Status & Match Variants
        variant === 'available' && 'bg-brand-50 text-brand-700',
        variant === 'brand' && 'bg-brand-50 text-brand-700',
        variant === 'hold' && 'bg-warn-bg text-warn',
        variant === 'sold' && 'bg-gold-bg text-gold-text font-bold',
        variant === 'gold' && 'bg-gold-bg text-gold-text',
        variant === 'rented' && 'bg-info-bg text-info',
        variant === 'perfect' && 'bg-brand-50 text-brand-700 font-bold',
        variant === 'good' && 'bg-info-bg text-info',
        variant === 'stretch' && 'bg-warn-bg text-warn',
        variant === 'neutral' && 'bg-surface-hover text-ink-700',
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
      {variant === 'sold' && <Check className="w-3 h-3 stroke-[2.5]" />}
      {children}
    </span>
  );
};
