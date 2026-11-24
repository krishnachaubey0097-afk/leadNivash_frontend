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
          'inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-600',
          pill ? 'rounded-full' : 'rounded-input',
          // Variants
          variant === 'primary' &&
            'bg-brand-600 hover:bg-brand-700 text-white shadow-sm',
          variant === 'secondary' &&
            'bg-white border border-border text-ink hover:bg-surface-hover shadow-sm',
          variant === 'soft' &&
            'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/50',
          variant === 'dark' &&
            'bg-navy text-white hover:bg-[#132D45] shadow-sm',
          variant === 'ghost' &&
            'bg-transparent text-text hover:bg-surface-hover hover:text-ink',
          variant === 'danger' &&
            'bg-danger text-white hover:bg-red-700 shadow-sm',
          // Sizes — touch targets ≥ 48px on mobile
          size === 'sm' && 'min-h-[44px] sm:min-h-0 h-10 sm:h-9 px-3.5 text-sm gap-1.5',
          size === 'md' && 'min-h-[48px] h-12 px-5 text-btn gap-2',
          size === 'lg' && 'min-h-[52px] h-[52px] px-6 text-base gap-2.5 font-semibold',
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
