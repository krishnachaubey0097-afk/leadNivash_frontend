import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import clsx from 'clsx';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
}

/**
 * Modal — Replaces mobile bottom sheets on desktop.
 * Centered, radius 20, blurred backdrop, close button top-right, footer actions right-aligned.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footerActions,
  className,
}) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
        <RadixDialog.Content
          className={clsx(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-32px)] max-w-lg bg-white border border-border p-6 rounded-[20px] shadow-2xl focus:outline-none animate-in fade-in zoom-in-95 duration-200',
            className
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <RadixDialog.Title className="text-lg font-bold text-ink">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="text-secondary text-muted mt-0.5">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <button
                className="text-muted hover:text-ink p-1.5 -mr-1.5 rounded-lg hover:bg-slate-100 transition-colors duration-150 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </RadixDialog.Close>
          </div>

          <div className="text-body text-text">{children}</div>

          {footerActions && (
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-5">
              {footerActions}
            </div>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
