import React from 'react';
import clsx from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base Shimmer Skeleton Element
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={clsx('shimmer-skeleton rounded-lg', className)}
      {...props}
    />
  );
};

/**
 * 1. StatCardSkeleton (Dashboard Metrics)
 */
export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-2xl" />
      </div>
      <div className="space-y-1 pt-1">
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
        <Skeleton className="h-4 w-14 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
  );
};

/**
 * 2. PropertyCardSkeleton (Inventory Grid)
 */
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-3.5">
      {/* Photo Thumbnail Skeleton */}
      <Skeleton className="w-full h-36 rounded-2xl" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-4 w-36 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-48 rounded-md" />
      <div className="flex gap-1.5 pt-1">
        <Skeleton className="h-4 w-14 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * 3. BuyerCardSkeleton (Buyers Vault Grid)
 */
export const BuyerCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-2xl" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28 rounded-lg" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-border/40">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <Skeleton className="h-3 w-40 rounded-md" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/60">
        <Skeleton className="h-7 w-20 rounded-full" />
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

/**
 * 4. InquiryCardSkeleton (Lead Inbox)
 */
export const InquiryCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 border border-border/40">
        <Skeleton className="h-3 w-36 rounded-md" />
        <Skeleton className="h-3 w-56 rounded-md" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-md" />
      </div>
    </div>
  );
};

/**
 * 5. MatchCardSkeleton (Dashboard Matches & Quick Chat Results)
 */
export const MatchCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-md" />
      </div>

      <div className="space-y-1">
        <Skeleton className="h-4 w-44 rounded-lg" />
        <Skeleton className="h-3 w-28 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>

      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-2.5 w-16 rounded-md" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-2.5 w-16 rounded-md ml-auto" />
          <Skeleton className="h-3.5 w-20 rounded-md ml-auto" />
        </div>
      </div>

      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
        <Skeleton className="h-8 flex-1 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
};

/**
 * 6. PropertyDetailSkeleton (Full Property View)
 */
export const PropertyDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 text-left">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>

      {/* Hero Gallery Placeholder */}
      <Skeleton className="w-full h-64 sm:h-80 rounded-3xl" />

      {/* Headline & Specs Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="space-y-2">
            <Skeleton className="h-6 w-56 rounded-xl" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
          </div>
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
              <Skeleton className="h-2.5 w-12 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-2">
          <Skeleton className="h-3.5 w-28 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-4/5 rounded-md" />
        </div>
      </div>

      {/* Owner Contact Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 space-y-3">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-10 w-full rounded-2xl" />
      </div>
    </div>
  );
};

/**
 * 7. BuyerDetailSkeleton (Full Buyer View)
 */
export const BuyerDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 text-left">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-18 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-border/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-xl" />
            <Skeleton className="h-3.5 w-32 rounded-md" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5">
              <Skeleton className="h-2.5 w-14 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Matching Listings Skeleton Grid */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-48 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MatchCardSkeleton />
          <MatchCardSkeleton />
        </div>
      </div>
    </div>
  );
};

/**
 * 8. FlyerSkeleton (Public Share Flyer)
 */
export const FlyerSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-3 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-4">
        {/* Brand header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>

        {/* Media Carousel */}
        <Skeleton className="w-full h-72 sm:h-96 rounded-3xl" />

        {/* Details Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-56 rounded-xl" />
              <Skeleton className="h-3.5 w-36 rounded-md" />
            </div>
            <Skeleton className="h-7 w-24 rounded-xl" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Inquiry Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};
