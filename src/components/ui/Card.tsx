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
          'rounded-[14px] border transition-all duration-150',
          // Variants — flat, 1px border, clean
          variant === 'default' &&
            'bg-white border-border shadow-card',
          variant === 'raised' &&
            'bg-white border-border shadow-card-hover',
          variant === 'flat' &&
            'bg-bg border-border',
          variant === 'glow' &&
            'bg-brand-50 border-brand-600/20',
          variant === 'dark' &&
            'bg-white border-brand-600/20 shadow-card',
          // Interactive Hover: hover lift only where the card is clickable
          interactive &&
            'hover:-translate-y-0.5 hover:shadow-card-hover hover:border-brand-600/30 cursor-pointer active:scale-[0.995]',
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
    className={clsx('p-4 pb-3 flex items-center justify-between gap-3', className)}
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
    className={clsx('text-card-title font-semibold text-ink', className)}
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
    className={clsx('text-secondary text-muted leading-relaxed', className)}
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
  <div ref={ref} className={clsx('p-4 pt-0', className)} {...props}>
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
    className={clsx('p-4 pt-3 flex items-center justify-between border-t border-border mt-3', className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';
