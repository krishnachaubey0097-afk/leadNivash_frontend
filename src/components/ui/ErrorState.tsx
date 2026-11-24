import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load records',
  message = 'A network issue or server delay occurred. Please check your connection and try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={`text-center py-10 px-6 bg-danger-bg border border-danger/20 rounded-card max-w-lg mx-auto ${
        className || ''
      }`}
    >
      <div className="w-12 h-12 rounded-card bg-danger/10 text-danger flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-body-lg font-semibold text-danger">{title}</h3>
      <p className="text-secondary text-muted mt-1 max-w-sm mx-auto leading-relaxed">{message}</p>
      {onRetry && (
        <div className="pt-4">
          <Button onClick={onRetry} variant="secondary" size="sm" className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-muted" />
            <span>Try again</span>
          </Button>
        </div>
      )}
    </div>
  );
};
