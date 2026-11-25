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
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
        <RadixDialog.Content
          className={clsx(
            'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-white border-t border-border p-5 rounded-t-sheet shadow-xl overflow-y-auto focus:outline-none animate-in slide-in-from-bottom duration-200 sm:max-w-lg sm:mx-auto sm:rounded-card sm:border sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2',
            className
          )}
        >
          {/* Mobile pull handle */}
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-start justify-between mb-4">
            <div>
              <RadixDialog.Title className="text-card-title font-semibold text-ink">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-secondary text-muted mt-1">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <button
                className="text-muted hover:text-ink p-2 -mr-2 rounded-lg transition-colors duration-150 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </RadixDialog.Close>
          </div>

          <div>{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
