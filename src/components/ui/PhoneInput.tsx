import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Phone } from 'lucide-react';

export interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  value?: string;
  onChange?: (val: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, label, error, hint, value = '', onChange, id, ...props }, ref) => {
    const inputId = id || props.name;

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      onChange?.(raw.slice(0, 10));
    };

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-text uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 flex items-center gap-1.5 text-muted pointer-events-none select-none">
            <Phone className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-ink border-r border-border pr-2">+91</span>
          </div>
          <input
            id={inputId}
            ref={ref}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={value}
            onChange={handleTextChange}
            placeholder="98123 45678"
            className={clsx(
              'w-full bg-surface border rounded-input py-2.5 pl-20 pr-3.5 text-base font-medium text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition',
              error ? 'border-danger focus:ring-danger' : 'border-border',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs text-danger font-medium mt-0.5">{error}</p>
        ) : hint ? (
          <p className="text-[11px] text-muted mt-0.5">{hint}</p>
        ) : null}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
