import React from 'react';

interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, active, onChange, className }) => {
  return (
    <div className={`inline-flex items-center rounded-input bg-surface-hover border border-border p-0.5 ${className || ''}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 whitespace-nowrap text-center text-sm font-medium py-2 px-3 rounded-[8px] transition-all duration-150 min-h-[36px] cursor-pointer ${
            opt.value === active
              ? 'text-ink bg-white shadow-sm'
              : 'text-muted hover:text-ink'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
