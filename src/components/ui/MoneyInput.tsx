import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { IndianRupee } from 'lucide-react';
import { parseToPaise, formatRupees, formatShortPrice } from '../../lib/money';

export interface MoneyInputProps {
  label?: string;
  error?: string;
  hint?: string;
  valuePaise?: number | null;
  onChangePaise: (paise: number | null) => void;
  placeholder?: string;
  id?: string;
  name?: string;
}

export const MoneyInput: React.FC<MoneyInputProps> = ({
  label,
  error,
  hint,
  valuePaise,
  onChangePaise,
  placeholder = 'e.g. 1.2 Cr, 85 Lakh, or 5000000',
  id,
  name,
}) => {
  const [rawText, setRawText] = useState<string>(() => {
    if (valuePaise && valuePaise > 0) {
      return (valuePaise / 100).toString();
    }
    return '';
  });

  const [parsedPaise, setParsedPaise] = useState<number | null>(valuePaise || null);

  useEffect(() => {
    if (valuePaise !== parsedPaise) {
      setParsedPaise(valuePaise || null);
    }
  }, [valuePaise]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setRawText(text);
    const paise = parseToPaise(text);
    setParsedPaise(paise);
    onChangePaise(paise);
  };

  const inputId = id || name;

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <IndianRupee className="w-4 h-4 text-brand-600" />
        </div>
        <input
          id={inputId}
          name={name}
          type="text"
          value={rawText}
          onChange={handleChange}
          placeholder={placeholder}
          className={clsx(
            'w-full bg-surface border rounded-input py-2.5 pl-10 pr-24 text-base font-semibold text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition',
            error ? 'border-danger focus:ring-danger' : 'border-border'
          )}
        />
        {parsedPaise != null && parsedPaise > 0 && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded pointer-events-none">
            {formatShortPrice(parsedPaise)}
          </div>
        )}
      </div>

      {parsedPaise != null && parsedPaise > 0 && (
        <p className="text-[11px] font-medium text-muted">
          Understood: <span className="font-bold text-ink">{formatRupees(parsedPaise)}</span>
        </p>
      )}

      {error ? (
        <p className="text-xs text-danger font-medium mt-0.5">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted mt-0.5">{hint}</p>
      ) : null}
    </div>
  );
};
