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
  expectedConfirmationPhrase?: string; // e.g. "DELETE PERMANENTLY"
  isLoading?: boolean;
  onConfirm: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Hamesha ke liye Delete karein',
  expectedConfirmationPhrase,
  isLoading,
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

  return (
    <Dialog open={open} onOpenChange={handleClose} title={title}>
      <div className="space-y-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-input flex items-start gap-2.5 text-xs text-danger">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{description}</span>
        </div>

        {expectedConfirmationPhrase && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text">
              Confirmation ke liye <span className="font-bold text-ink">{expectedConfirmationPhrase}</span> type karein:
            </label>
            <Input
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              placeholder={expectedConfirmationPhrase}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" onClick={() => handleClose(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!isConfirmed}
            isLoading={isLoading}
            onClick={() => {
              onConfirm();
              handleClose(false);
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
