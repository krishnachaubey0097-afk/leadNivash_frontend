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
            'bg-brand-700 hover:bg-[#036246] text-white shadow-sm hover:shadow-md hover:shadow-brand-700/20',
          variant === 'secondary' &&
            'bg-surface border border-border text-ink hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm',
          variant === 'soft' &&
            'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/40 dark:text-brand-600 font-bold',
          variant === 'dark' &&
            'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 shadow-sm',
          variant === 'ghost' &&
            'bg-transparent text-text hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-ink',
          variant === 'danger' &&
            'bg-danger text-white hover:bg-red-700 shadow-sm shadow-danger/20',
          // Sizes (touch targets ≥ 44px)
          size === 'sm' && 'h-9 px-3.5 text-xs gap-1.5',
          size === 'md' && 'h-11 px-5 text-sm gap-2',
          size === 'lg' && 'h-12 px-6 text-base gap-2.5 font-bold',
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
