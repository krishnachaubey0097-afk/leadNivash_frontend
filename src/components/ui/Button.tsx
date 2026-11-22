import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      pill = false,
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-600',
          pill ? 'rounded-full' : 'rounded-input',
          // Variants
          variant === 'primary' &&
            'bg-brand-600 hover:bg-brand-700 text-white shadow-xs hover:shadow-sm font-semibold',
          variant === 'secondary' &&
            'bg-gradient-to-r from-white to-emerald-50/40 border border-border text-ink hover:border-brand-600/40 shadow-2xs',
          variant === 'soft' &&
            'bg-brand-50 text-brand-700 hover:bg-brand-100/80 font-bold border border-brand-200/50',
          variant === 'dark' &&
            'bg-gradient-to-r from-brand-600 via-brand-700 to-emerald-800 text-white hover:brightness-105 shadow-xs',
          variant === 'ghost' &&
            'bg-transparent text-text hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-ink',
          variant === 'danger' &&
            'bg-danger text-white hover:bg-red-700 shadow-sm shadow-danger/20',
          // Sizes (touch targets ≥ 44px on mobile)
          size === 'sm' && 'min-h-[44px] sm:min-h-0 h-11 sm:h-9 px-3.5 text-xs gap-1.5',
          size === 'md' && 'min-h-[44px] h-11 px-5 text-sm gap-2',
          size === 'lg' && 'min-h-[48px] h-12 px-6 text-base gap-2.5 font-bold',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
