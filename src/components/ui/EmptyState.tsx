import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={`text-center py-12 px-4 bg-surface border border-dashed border-border rounded-card max-w-lg mx-auto ${
        className || ''
      }`}
    >
      {icon && <div className="text-muted flex justify-center mb-3 opacity-60">{icon}</div>}
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="text-xs text-muted mt-1 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
