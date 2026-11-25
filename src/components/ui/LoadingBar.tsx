import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';

/**
 * Trigger global top loading bar from any async function or click event.
 */
export const triggerLoadingBar = (durationMs = 600) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('leadnivesh_api_loading', { detail: { active: true } }));
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('leadnivesh_api_loading', { detail: { active: false } }));
  }, durationMs);
};

export interface TopLoadingBarProps {
  className?: string;
}

/**
 * YouTube / GitHub style ultra-sleek top loading bar.
 * Fires automatically on route changes and on any async API activity.
 */
export const TopLoadingBar: React.FC<TopLoadingBarProps> = ({ className }) => {
  const location = useLocation();
  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Animate on route changes
  useEffect(() => {
    setIsVisible(true);
    setProgress(25);

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 120);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 320);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  // Listen to manual or API loading events
  useEffect(() => {
    const handleApiLoading = (e: Event) => {
      const active = (e as CustomEvent)?.detail?.active;
      if (active) {
        setIsVisible(true);
        setProgress((prev) => (prev < 30 ? 40 : Math.min(prev + 20, 85)));
      } else {
        setProgress(100);
        setTimeout(() => {
          setIsVisible(false);
          setProgress(0);
        }, 350);
      }
    };

    window.addEventListener('leadnivesh_api_loading', handleApiLoading);
    return () => window.removeEventListener('leadnivesh_api_loading', handleApiLoading);
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      className={clsx(
        'fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      role="progressbar"
      aria-label="Page loading indicator"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full top-progress-bar transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export interface LinearProgressBarProps {
  progress?: number; // 0 to 100 for determinate mode, undefined for indeterminate
  variant?: 'emerald' | 'brand' | 'amber';
  height?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

/**
 * Component-level linear loading bar for placement inside cards, headers, or forms.
 */
export const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  progress,
  variant = 'emerald',
  height = 'md',
  className,
  label,
}) => {
  const isIndeterminate = progress === undefined;

  const heightClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  }[height];

  const variantGradients = {
    emerald: 'bg-emerald-600',
    brand: 'bg-brand-600',
    amber: 'bg-amber-500',
  }[variant];

  return (
    <div className={clsx('w-full space-y-1', className)}>
      {label && (
        <div className="flex items-center justify-between text-[11px] font-bold text-muted">
          <span>{label}</span>
          {!isIndeterminate && <span>{Math.round(progress)}%</span>}
        </div>
      )}
      <div
        className={clsx(
          'w-full bg-slate-100 rounded-full overflow-hidden relative',
          heightClasses
        )}
      >
        {isIndeterminate ? (
          <div
            className={clsx(
              'absolute inset-0 rounded-full linear-indeterminate',
              variantGradients
            )}
          />
        ) : (
          <div
            className={clsx('h-full rounded-full transition-all duration-300', variantGradients)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        )}
      </div>
    </div>
  );
};
