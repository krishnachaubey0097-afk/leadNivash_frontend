import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export const SITE_NAME = 'LeadNivash';
export const SITE_URL = 'https://lead-nivash-frontend.vercel.app';
export const DEFAULT_TITLE = 'LeadNivash | Turn Messages into Property Deals';
export const DEFAULT_DESCRIPTION =
  'AI-powered WhatsApp real estate broker OS for property listings, buyer matching, Pan-India stamp duty calculators, and deal closing across India.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/hero-bg.jpg`;

export interface SEOProps {
  title?: string;
  exactTitle?: boolean;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  keywords?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function buildFullTitle(title?: string, exactTitle?: boolean): string {
  if (!title) return DEFAULT_TITLE;
  if (exactTitle || title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

function buildCanonicalUrl(canonicalPath?: string): string {
  if (!canonicalPath || canonicalPath === '/') return `${SITE_URL}/`;
  const normalized = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  return `${SITE_URL}${normalized}`;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  exactTitle = false,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '/',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  keywords,
  noindex = false,
  jsonLd,
}) => {
  const fullTitle = buildFullTitle(title, exactTitle);
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  useEffect(() => {
    // Clear static HTML fallback tags once React 19 + react-helmet-async takes over <head>
    const staticTags = document.head.querySelectorAll('[data-static-seo="true"]');
    staticTags.forEach((node) => node.remove());
  }, []);

  return (
    <Helmet>
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {schemas.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};
