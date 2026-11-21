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
  title = 'Unable to Load Records',
  message = 'A network issue or server delay occurred. Please check your connection and try again.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={`text-center py-10 px-6 bg-gradient-to-br from-red-50/70 via-white to-red-50/40 dark:from-red-950/30 dark:via-slate-900 dark:to-red-950/20 border border-red-200 dark:border-red-900/60 rounded-3xl max-w-lg mx-auto shadow-xs ${
        className || ''
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
        <AlertCircle className="w-6 h-6 stroke-[2.2]" />
      </div>
      <h3 className="text-base font-black text-rose-700 dark:text-rose-400 font-heading">{title}</h3>
      <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">{message}</p>
      {onRetry && (
        <div className="pt-4">
          <Button onClick={onRetry} variant="secondary" size="sm" pill className="font-bold text-xs gap-1.5 shadow-2xs">
            <RotateCcw className="w-3.5 h-3.5 text-muted" />
            <span>Try Again</span>
          </Button>
        </div>
      )}
    </div>
  );
};
