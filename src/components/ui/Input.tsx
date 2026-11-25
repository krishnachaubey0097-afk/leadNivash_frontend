import React, { forwardRef } from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightElement, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'w-full bg-white border rounded-input h-11 sm:h-12 min-h-[44px] max-h-[48px] text-base text-ink placeholder-faint focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors duration-150',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightElement ? 'pr-12' : 'pr-3.5',
              error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-meta text-danger font-medium">{error}</p>
        ) : hint ? (
          <p className="text-meta text-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
