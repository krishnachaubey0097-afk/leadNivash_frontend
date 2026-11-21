import React, { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';
import { Input } from './Input';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  expectedConfirmationPhrase?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
  onConfirm: () => void | Promise<void>;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  expectedConfirmationPhrase,
  isLoading,
  variant = 'danger',
  onConfirm,
}) => {
  const [typedPhrase, setTypedPhrase] = useState('');

  const isConfirmed = expectedConfirmationPhrase
    ? typedPhrase.trim() === expectedConfirmationPhrase
    : true;

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) setTypedPhrase('');
    onOpenChange(newOpen);
  };

  const handleConfirmClick = async () => {
    await onConfirm();
    if (!isLoading) {
      handleClose(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} title={title}>
      <div className="space-y-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-start gap-2.5 text-xs text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{description}</span>
        </div>

        {expectedConfirmationPhrase && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text">
              Type <span className="font-bold text-ink">{expectedConfirmationPhrase}</span> to confirm:
            </label>
            <Input
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              placeholder={expectedConfirmationPhrase}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" size="sm" pill onClick={() => handleClose(false)} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            size="sm"
            pill
            disabled={!isConfirmed || isLoading}
            isLoading={isLoading}
            onClick={handleConfirmClick}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
