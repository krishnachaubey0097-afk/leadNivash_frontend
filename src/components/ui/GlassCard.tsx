import React from 'react';
import clsx from 'clsx';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

/**
 * GlassCard — Hero use only, radius 20, blur
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-[20px] bg-white/70 backdrop-blur-md border border-white/40 shadow-lg p-5 transition-all duration-200',
          interactive && 'hover:-translate-y-0.5 hover:shadow-xl hover:border-brand-600/30 cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
