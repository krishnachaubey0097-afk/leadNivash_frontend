import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import clsx from 'clsx';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  group?: string;
  hint?: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  id?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  title?: string;
  placeholder?: string;
  ariaLabel?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  value,
  onChange,
  options,
  title,
  placeholder = 'Select an option',
  ariaLabel,
  searchable,
  searchPlaceholder = 'Search options...',
  disabled = false,
  className,
  textClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedItemRef = useRef<HTMLButtonElement | null>(null);

  const normalizedValue = String(value ?? '');
  const showSearch = searchable ?? options.length >= 8;

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === normalizedValue),
    [options, normalizedValue],
  );

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.group && opt.group.toLowerCase().includes(q)) ||
        (opt.hint && opt.hint.toLowerCase().includes(q)),
    );
  }, [options, query]);

  const groupedSections = useMemo(() => {
    const sections: Array<{ group: string | null; items: CustomSelectOption[] }> = [];
    const groupIndex = new Map<string, number>();

    for (const opt of filteredOptions) {
      const groupName = opt.group ?? null;
      const key = groupName ?? '__default__';
      const existingIdx = groupIndex.get(key);
      if (existingIdx === undefined) {
        groupIndex.set(key, sections.length);
        sections.push({ group: groupName, items: [opt] });
      } else {
        sections[existingIdx].items.push(opt);
      }
    }
    return sections;
  }, [filteredOptions]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const timer = window.setTimeout(() => {
      selectedItemRef.current?.scrollIntoView({ block: 'nearest' });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  const handleSelect = (opt: CustomSelectOption) => {
    if (opt.disabled) return;
    onChange(String(opt.value));
    setOpen(false);
  };

  return (
    <RadixDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
      }}
    >
      <RadixDialog.Trigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel || title || placeholder}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={clsx(
            'w-full min-h-[44px] bg-white border border-border rounded-input px-3.5 py-2',
            'flex items-center justify-between gap-2.5 text-left transition-all',
            'text-[#12140F] font-semibold',
            'hover:border-[#018E45]/50 hover:bg-[#018E45]/[0.04]',
            'focus:outline-none focus:ring-2 focus:ring-[#018E45]/35 focus:border-[#018E45]',
            'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
            className,
          )}
        >
          <span
            className={clsx(
              'truncate block',
              selectedOption ? 'text-[#12140F]' : 'text-[#12140F]/55',
              textClassName,
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={clsx(
              'w-4 h-4 shrink-0 text-[#12140F]/75 transition-transform duration-200',
              open && 'rotate-180 text-[#018E45]',
            )}
          />
        </button>
      </RadixDialog.Trigger>

      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[99998] bg-[#12140F]/45 backdrop-blur-[2px] animate-fade-in" />

        <RadixDialog.Content
          aria-describedby={undefined}
          className={clsx(
            'fixed z-[99999] bg-white text-[#12140F] shadow-2xl border border-[#018E45]/25',
            'bottom-0 left-0 right-0 rounded-t-[20px] max-h-[82vh]',
            'sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
            'sm:w-[calc(100%-2rem)] sm:max-w-[440px] sm:rounded-[18px] sm:max-h-[76vh]',
            'flex flex-col overflow-hidden focus:outline-none',
          )}
        >
          {/* Mobile grab handle */}
          <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-white">
            <div className="w-10 h-1 rounded-full bg-[#018E45]/30" />
          </div>

          {/* Header with 25-30% faded brand colour over crisp white + black text */}
          <div
            className="px-4 py-3.5 border-b border-[#018E45]/20 flex items-center justify-between gap-3 shrink-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(1, 142, 69, 0.24) 0%, rgba(215, 247, 154, 0.30) 58%, #FFFFFF 100%)',
            }}
          >
            <div className="min-w-0">
              <RadixDialog.Title className="text-sm sm:text-[15px] font-bold text-[#12140F] truncate">
                {title || ariaLabel || 'Select an option'}
              </RadixDialog.Title>
              {selectedOption && (
                <p className="text-[11px] font-medium text-[#12140F]/75 truncate mt-0.5">
                  Selected: {selectedOption.label}
                </p>
              )}
            </div>
            <RadixDialog.Close asChild>
              <button
                type="button"
                aria-label="Close selector"
                className="w-8 h-8 rounded-full bg-white/90 border border-[#018E45]/25 text-[#12140F] hover:bg-[#018E45]/20 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </RadixDialog.Close>
          </div>

          {/* Optional search bar for longer lists (e.g. 36 States / UTs) */}
          {showSearch && (
            <div className="px-4 py-2.5 bg-white border-b border-border shrink-0">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#12140F]/50 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-10 pl-9 pr-8 bg-white border border-border rounded-input text-sm font-medium text-[#12140F] placeholder:text-[#12140F]/45 focus:outline-none focus:ring-2 focus:ring-[#018E45]/30 focus:border-[#018E45]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 text-[#12140F]/50 hover:text-[#12140F] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List (White background + Black text + 25-30% Brand Green fade on active/hover) */}
          <div
            role="listbox"
            aria-label={title || ariaLabel || 'Options'}
            className="flex-1 overflow-y-auto bg-white p-2.5 space-y-2 pb-6 sm:pb-3"
          >
            {groupedSections.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-[#12140F]/60 bg-white">
                No matching options found.
              </div>
            ) : (
              groupedSections.map((section, sIdx) => (
                <div key={section.group ?? `section-${sIdx}`} className="space-y-1">
                  {section.group && (
                    <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#12140F]/80 bg-[#018E45]/[0.14] rounded-lg border border-[#018E45]/15">
                      {section.group}
                    </div>
                  )}

                  <div className="space-y-1">
                    {section.items.map((opt) => {
                      const isSelected = String(opt.value) === normalizedValue;
                      return (
                        <button
                          key={String(opt.value)}
                          ref={isSelected ? selectedItemRef : undefined}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          disabled={opt.disabled}
                          onClick={() => handleSelect(opt)}
                          style={
                            isSelected
                              ? {
                                  background:
                                    'linear-gradient(90deg, rgba(1, 142, 69, 0.24) 0%, rgba(215, 247, 154, 0.34) 70%, rgba(1, 142, 69, 0.14) 100%)',
                                }
                              : undefined
                          }
                          className={clsx(
                            'w-full px-3.5 py-3 rounded-[12px] text-left flex items-center justify-between gap-3 transition-all cursor-pointer',
                            'text-[#12140F] border',
                            isSelected
                              ? 'border-[#018E45]/45 font-bold shadow-2xs'
                              : 'bg-white border-transparent hover:bg-[#018E45]/[0.14] hover:border-[#018E45]/25 font-medium',
                            opt.disabled && 'opacity-45 cursor-not-allowed',
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-sm leading-snug text-[#12140F] block">
                              {opt.label}
                            </span>
                            {opt.hint && (
                              <span className="text-[11px] text-[#12140F]/70 block mt-0.5">
                                {opt.hint}
                              </span>
                            )}
                          </div>

                          <span
                            className={clsx(
                              'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors',
                              isSelected
                                ? 'bg-[#018E45] border-[#018E45] text-white'
                                : 'bg-white border-[#12140F]/30',
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
