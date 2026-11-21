import React from 'react';
import clsx from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx('animate-pulse rounded bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <div className="space-y-1 pt-1">
        <Skeleton className="h-7 w-16 rounded-xl" />
      </div>
      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
  );
};

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-3">
      <Skeleton className="w-full h-36 rounded-2xl" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-44 rounded-md" />
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const BuyerCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-40 rounded-md" />
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
        <Skeleton className="h-3 w-32 rounded-md" />
        <Skeleton className="h-3 w-24 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
};

