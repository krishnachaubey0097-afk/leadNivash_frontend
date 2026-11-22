import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'flat' | 'glow' | 'dark';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-card border transition-all duration-200',
          // Variants
          variant === 'default' &&
            'bg-gradient-to-br from-white via-white to-emerald-50/20 border-border/90 shadow-card text-text',
          variant === 'raised' &&
            'bg-gradient-to-br from-white via-white to-emerald-50/40 border-border shadow-card-hover text-text',
          variant === 'flat' &&
            'bg-gradient-to-br from-white via-[#F4F6F8] to-emerald-50/20 border-border/70 text-text',
          variant === 'glow' &&
            'bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/40 border-brand-600/30 shadow-glow text-text',
          variant === 'dark' &&
            'bg-gradient-to-br from-white via-emerald-50/40 to-emerald-100/30 text-ink border-emerald-500/30 shadow-card',
          // Interactive Hover
          interactive &&
            'hover:shadow-card-hover hover:border-brand-600/40 cursor-pointer active:scale-[0.99]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('p-5 pb-3 flex items-center justify-between gap-3', className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx('text-base font-black tracking-tight text-ink font-heading', className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx('text-xs text-muted leading-relaxed', className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={clsx('p-5 pt-0', className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('p-5 pt-0 flex items-center justify-between border-t border-border/50 mt-4', className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
