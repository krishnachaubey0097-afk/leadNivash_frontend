import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Data load nahi ho paaya',
  message = 'Server se connect karte waqt dikkat aayi. Kripya dobara koshish karein.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={`text-center py-10 px-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-card max-w-lg mx-auto ${
        className || ''
      }`}
    >
      <AlertCircle className="w-8 h-8 text-danger mx-auto mb-2 opacity-80" />
      <h3 className="text-sm font-bold text-danger">{title}</h3>
      <p className="text-xs text-text mt-1 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm" className="mt-4">
          Dobara Koshish Karein (Retry)
        </Button>
      )}
    </div>
  );
};
