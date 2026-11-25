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
    <div className={`inline-flex items-center rounded-input bg-[#E9EDF1] border border-border p-0.5 ${className || ''}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative flex-1 whitespace-nowrap text-center text-sm font-medium py-2 px-3 rounded-[8px] transition-all duration-200 min-h-[36px] cursor-pointer ${
            opt.value === active
              ? 'text-ink-900 bg-white border border-line shadow-2xs font-semibold after:content-[""] after:absolute after:inset-x-2.5 after:bottom-0.5 after:h-[2px] after:rounded-full after:bg-lime'
              : 'text-ink-700 hover:text-ink-900 border border-transparent'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
