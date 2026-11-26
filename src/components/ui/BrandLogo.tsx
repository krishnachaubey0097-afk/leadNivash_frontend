import React, { useId } from 'react';
import { clsx } from 'clsx';

interface BrandLogoIconProps {
  className?: string;
}

/**
 * Crisp inline SVG LeadNivash mark matching /logo-icon.png (zero external image latency).
 */
export const BrandLogoIcon: React.FC<BrandLogoIconProps> = ({ className = 'w-full h-full' }) => {
  const gradId = useId().replace(/:/g, '');

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`ln-roof-${gradId}`} x1="15%" y1="35%" x2="82%" y2="45%">
          <stop offset="0%" stopColor="#01994B" />
          <stop offset="52%" stopColor="#018E45" />
          <stop offset="76%" stopColor="#0D261F" />
          <stop offset="100%" stopColor="#12140F" />
        </linearGradient>
      </defs>

      {/* Peaked roof + right chimney + left sweeping arc */}
      <path
        d="M 51 8 L 68 25 L 68 17 Q 68 15 70 15 L 79 15 Q 81 15 81 17 L 81 42 L 91 55 L 76 58 L 51 24 C 34 42 22 57 21 69 C 20 80 31 85 31 85 Q 8 83 9 67 C 10 53 27 33 51 8 Z"
        fill={`url(#ln-roof-${gradId})`}
      />

      {/* Center 4-pane house window */}
      <rect x="41" y="42" width="8" height="8" rx="1.6" fill="#018E45" />
      <rect x="51" y="42" width="8" height="8" rx="1.6" fill="#018E45" />
      <rect x="41" y="52" width="8" height="8" rx="1.6" fill="#018E45" />
      <rect x="51" y="52" width="8" height="8" rx="1.6" fill="#018E45" />

      {/* Upward-sweeping growth arrow */}
      <path
        d="M 15 92 C 38 92 58 83 70 72 L 65 66 L 91 61 L 74 91 L 72 82 C 56 91 35 94 15 92 Z"
        fill="#018E45"
      />
    </svg>
  );
};

interface BrandLogoBoxProps {
  className?: string;
  iconClassName?: string;
}

/**
 * Framed rounded logo badge with white canvas so the mark pops cleanly on both light and dark surfaces.
 */
export const BrandLogoBox: React.FC<BrandLogoBoxProps> = ({
  className,
  iconClassName = 'w-full h-full',
}) => {
  return (
    <div
      className={clsx(
        'bg-white flex items-center justify-center shrink-0 select-none',
        className
      )}
    >
      <BrandLogoIcon className={iconClassName} />
    </div>
  );
};
