import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import clsx from 'clsx';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in" />
        <RadixDialog.Content
          className={clsx(
            'fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] bg-surface border-t border-border p-6 rounded-t-sheet shadow-2xl overflow-y-auto focus:outline-none animate-in slide-in-from-bottom duration-200 sm:max-w-lg sm:mx-auto sm:rounded-card sm:border sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2',
            className
          )}
        >
          {/* Mobile pull handle */}
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-start justify-between mb-4">
            <div>
              <RadixDialog.Title className="text-base font-bold text-ink">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-xs text-muted mt-0.5">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <button
                className="text-muted hover:text-ink p-1 rounded-lg transition cursor-pointer"
                aria-label="Close sheet"
              >
                <X className="w-4 h-4" />
              </button>
            </RadixDialog.Close>
          </div>

          <div>{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
