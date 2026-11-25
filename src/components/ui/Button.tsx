import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { ArrowUpRight, Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost' | 'danger' | 'soft' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  isLoading?: boolean;
  hideArrow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      pill = false,
      isLoading,
      hideArrow = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isPrimary = variant === 'primary';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'group inline-flex items-center justify-center font-semibold whitespace-nowrap truncate transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1',
          pill ? 'rounded-full' : isPrimary ? 'rounded-[14px]' : 'rounded-input',
          // Primary — Cashfree Ink-Black + olive/lime radial sheen + glossy shine sweep + #D7F79A ↗ chip
          isPrimary && 'btn-cashfree-primary btn-shine-sweep text-white',
          // Secondary — Crisp white surface with hairline highlight & soft hover lift
          variant === 'secondary' &&
            'bg-white border border-ink-black/15 text-ink-900 hover:bg-lime-soft/50 hover:border-ink-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(18,20,15,0.05)]',
          // Ghost / Tertiary
          (variant === 'tertiary' || variant === 'ghost') &&
            'bg-transparent text-ink-700 hover:bg-ink-black/[0.05] hover:text-ink-900',
          // Destructive / Danger
          (variant === 'destructive' || variant === 'danger') &&
            'bg-danger text-white hover:bg-red-700 shadow-sm ring-1 ring-inset ring-white/15',
          // Soft — Lime-soft tinted highlight pill
          variant === 'soft' &&
            'bg-lime-soft text-ink-900 border border-lime hover:bg-lime/55 shadow-2xs',
          // Dark — Solid ink-black with shine sweep without forced arrow chip
          variant === 'dark' &&
            'bg-ink-black btn-shine-sweep border border-white/15 text-white hover:border-lime/40 shadow-sm',
          // Sizes — touch targets ≥ 48px on mobile, compact on desktop
          size === 'sm' &&
            (isPrimary && !hideArrow
              ? 'min-h-[44px] sm:min-h-0 h-10 sm:h-9 pl-3.5 pr-1.5 text-sm gap-2'
              : 'min-h-[44px] sm:min-h-0 h-10 sm:h-9 px-3.5 text-sm gap-1.5'),
          size === 'md' &&
            (isPrimary && !hideArrow
              ? 'min-h-[48px] sm:min-h-0 h-12 sm:h-11 pl-4 pr-1.5 text-btn gap-2.5'
              : 'min-h-[48px] sm:min-h-0 h-12 sm:h-11 px-5 text-btn gap-2'),
          size === 'lg' &&
            (isPrimary && !hideArrow
              ? 'min-h-[52px] h-[52px] pl-5 pr-2 text-base gap-3 font-semibold'
              : 'min-h-[52px] h-[52px] px-6 text-base gap-2.5 font-semibold'),
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0 relative z-10" />}
        <span className="relative z-10 inline-flex items-center gap-1.5 truncate">{children}</span>
        {isPrimary && !hideArrow && !isLoading && (
          <span
            aria-hidden="true"
            className={clsx(
              'relative z-10 bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
              size === 'sm'
                ? 'w-6 h-6 rounded-[7px]'
                : size === 'lg'
                ? 'w-8 h-8 rounded-[10px]'
                : 'w-7 h-7 rounded-[8px]'
            )}
          >
            <ArrowUpRight className={clsx('stroke-[2.3]', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
