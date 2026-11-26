import React from 'react';
import { clsx } from 'clsx';
import { SOCIAL_LINKS } from '../../config/constants';

interface SocialLinksProps {
  variant?: 'dark' | 'light';
  showLabels?: boolean;
  className?: string;
}

const XIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedInIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const CHANNELS = [
  {
    key: 'x',
    label: 'X (Twitter)',
    shortLabel: 'X',
    href: SOCIAL_LINKS.x,
    ariaLabel: 'Follow LeadNivash on X (Twitter)',
    Icon: XIcon,
  },
  {
    key: 'instagram',
    label: 'Instagram',
    shortLabel: 'Instagram',
    href: SOCIAL_LINKS.instagram,
    ariaLabel: 'Follow LeadNivash on Instagram',
    Icon: InstagramIcon,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    shortLabel: 'LinkedIn',
    href: SOCIAL_LINKS.linkedin,
    ariaLabel: 'Connect with LeadNivash on LinkedIn',
    Icon: LinkedInIcon,
  },
] as const;

export const SocialLinks: React.FC<SocialLinksProps> = ({
  variant = 'light',
  showLabels = false,
  className,
}) => {
  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      {CHANNELS.map(({ key, shortLabel, href, ariaLabel, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={ariaLabel}
          title={ariaLabel}
          className={clsx(
            'inline-flex items-center justify-center gap-1.5 rounded-xl border transition-all duration-150',
            showLabels ? 'h-9 px-3 text-xs font-semibold' : 'w-9 h-9',
            variant === 'dark'
              ? 'bg-white/5 border-white/15 text-[#C9CCC6] hover:bg-lime/15 hover:border-lime/50 hover:text-lime'
              : 'bg-white border-border text-ink-700 hover:bg-brand-50 hover:border-brand-600/40 hover:text-brand-700 shadow-2xs'
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {showLabels && <span>{shortLabel}</span>}
        </a>
      ))}
    </div>
  );
};
