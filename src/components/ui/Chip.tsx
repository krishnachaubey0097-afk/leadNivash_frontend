import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

export type ChipVariant =
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

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  pill?: boolean;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  variant = 'neutral',
  pill = true,
  dot = false,
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors duration-150',
        pill ? 'rounded-full' : 'rounded-md',
        // Variants
        variant === 'available' && 'bg-brand-50 text-brand-700',
        variant === 'brand' && 'bg-brand-50 text-brand-700',
        variant === 'hold' && 'bg-amber-50 text-amber-700 border border-amber-200/60',
        variant === 'sold' && 'bg-amber-100 text-amber-800 font-bold',
        variant === 'gold' && 'bg-amber-100 text-amber-800',
        variant === 'rented' && 'bg-blue-50 text-blue-700',
        variant === 'perfect' && 'bg-brand-50 text-brand-700 font-bold',
        variant === 'good' && 'bg-blue-50 text-blue-700',
        variant === 'stretch' && 'bg-amber-50 text-amber-700',
        variant === 'neutral' && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'available' || variant === 'brand' || variant === 'perfect'
              ? 'bg-brand-600'
              : variant === 'sold' || variant === 'gold' || variant === 'hold'
              ? 'bg-amber-500'
              : variant === 'rented' || variant === 'good'
              ? 'bg-blue-500'
              : 'bg-slate-400'
          )}
        />
      )}
      {icon}
      {variant === 'sold' && !icon && <Check className="w-3 h-3 stroke-[2.5]" />}
      <span>{children}</span>
    </span>
  );
};

export const StatusChip = Chip;
