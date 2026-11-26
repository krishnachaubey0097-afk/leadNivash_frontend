const SITE_URL = 'https://lead-nivash-frontend.vercel.app';
const SITE_NAME = 'LeadNivash';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const BACKEND_URL = 'https://leadnivash.onrender.com';

const ROUTE_META = {
  '/': {
    title: 'LeadNivash | Turn Messages into Property Deals',
    description:
      'AI-powered WhatsApp real estate broker OS for property listings, buyer matching, Pan-India stamp duty calculators, and deal closing across India.',
    ogType: 'website',
  },
  '/pricing': {
    title: 'Pricing Plans & High-ROI Subscriptions | LeadNivash',
    description:
      'Start your 14-day free LeadNivash trial. Transparent pricing at ₹399/month or ₹3,299/year for Indian real estate brokers and property agencies.',
    ogType: 'product',
  },
  '/contact': {
    title: 'Contact Support & Helpdesk | LeadNivash',
    description:
      'Connect with the LeadNivash onboarding and support team via WhatsApp, phone, or email for real estate broker workspace setup.',
    ogType: 'website',
  },
  '/privacy': {
    title: 'Privacy Policy & Owner Vault Isolation | LeadNivash',
    description:
      'Read how LeadNivash protects private owner phone numbers, broker client leads, and encrypted data under India DPDPA 2023 guidelines.',
    ogType: 'website',
  },
  '/terms': {
    title: 'Terms of Service | LeadNivash',
    description:
      'Commercial broker agreement, acceptable use terms, and workspace rules for using LeadNivash real estate SaaS in India.',
    ogType: 'website',
  },
  '/refund': {
    title: 'Refund & Cancellation Policy | LeadNivash',
    description:
      'Learn about LeadNivash 7-day money-back guarantee, free trial expiration rules, and subscription cancellation process.',
    ogType: 'website',
  },
  '/cookies': {
    title: 'Cookie Policy & Web Storage | LeadNivash',
    description:
      'Details on strictly necessary session cookies and local preferences used by LeadNivash with zero third-party ad tracking.',
    ogType: 'website',
  },
  '/login': {
    title: 'Broker Workspace Login | LeadNivash',
    description:
      'Sign in to your LeadNivash broker workspace to manage property listings, buyer requirements, and instant matching.',
    ogType: 'website',
  },
  '/register': {
    title: 'Start Your 14-Day Free Broker Trial | LeadNivash',
    description:
      'Create your LeadNivash broker account for AI WhatsApp listing extraction, instant buyer matching, and branded flyers.',
    ogType: 'website',
  },
};

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatRupees(paise) {
  if (!paise || Number.isNaN(Number(paise))) return '';
  const rupees = Number(paise) / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  return `₹${Math.round(rupees).toLocaleString('en-IN')}`;
}

export default async function handler(req, res) {
  const urlObj = new URL(req.url || '/', SITE_URL);
  let routePath = urlObj.searchParams.get('path') || '/';
  if (!routePath.startsWith('/')) routePath = `/${routePath}`;

  let meta = ROUTE_META[routePath] || ROUTE_META['/'];
  let image = DEFAULT_IMAGE;
  const canonicalUrl = `${SITE_URL}${routePath === '/' ? '/' : routePath}`;

  // Dynamic metadata for shared broker lead intake forms (/form/:brokerId)
  if (routePath.startsWith('/form/')) {
    const formBrokerId = routePath.slice('/form/'.length).split('/')[0];
    meta = {
      title: 'Share Your Property Requirement or Listing | LeadNivash',
      description:
        'Submit your buying requirement or property listing details directly to your verified property advisor.',
      ogType: 'website',
    };

    if (formBrokerId && /^[0-9a-fA-F]{24}$/.test(formBrokerId)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const apiRes = await fetch(
          `${BACKEND_URL}/api/v1/public/lead-form/${encodeURIComponent(formBrokerId)}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (apiRes.ok) {
          const json = await apiRes.json();
          const profile = json?.data || json;
          if (profile?.agencyName) {
            meta = {
              title: `${profile.agencyName} — Property Requirement & Listing Form | LeadNivash`,
              description: `Looking to buy or sell in ${profile.city || 'India'}? Share your requirement in 30 seconds directly with ${profile.agencyName}.`,
              ogType: 'website',
            };
          }
        }
      } catch {
        // Fallback safely if backend is waking
      }
    }
  }

  // Dynamic metadata + photo preview for shared public property flyers (/flyer/:id)
  if (routePath.startsWith('/flyer/')) {
    const flyerId = routePath.slice('/flyer/'.length).split('/')[0];
    meta = {
      title: 'Verified Property Flyer | LeadNivash',
      description: 'View verified property pricing, photos, area details, and book a site visit directly with the broker on LeadNivash.',
      ogType: 'website',
    };

    if (flyerId && /^[a-zA-Z0-9_-]{4,64}$/.test(flyerId)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const apiRes = await fetch(`${BACKEND_URL}/api/v1/properties/${encodeURIComponent(flyerId)}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (apiRes.ok) {
          const json = await apiRes.json();
          const p = json?.data || json;
          if (p?.title) {
            const priceText = formatRupees(p.priceDemandPaise);
            const sizeText = p.size?.value ? `${p.size.value} ${String(p.size.unit || '').toUpperCase()}` : '';
            meta = {
              title: `${p.title} — ${p.locality || 'India'} | LeadNivash`,
              description: [p.title, sizeText, p.locality, p.city, priceText].filter(Boolean).join(' · '),
              ogType: 'website',
            };
            if (p.photos?.[0]?.url) {
              image = p.photos[0].url;
            }
          }
        }
      } catch {
        // Fallback to safe static flyer metadata if backend is waking
      }
    }
  }

  const titleEsc = escapeHtml(meta.title);
  const descEsc = escapeHtml(meta.description);
  const imageEsc = escapeHtml(image);
  const canonicalEsc = escapeHtml(canonicalUrl);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${titleEsc}</title>
    <meta name="description" content="${descEsc}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonicalEsc}" />
    <meta property="og:type" content="${escapeHtml(meta.ogType)}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:url" content="${canonicalEsc}" />
    <meta property="og:title" content="${titleEsc}" />
    <meta property="og:description" content="${descEsc}" />
    <meta property="og:image" content="${imageEsc}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@leadnivassh" />
    <meta name="twitter:creator" content="@leadnivassh" />
    <meta name="twitter:url" content="${canonicalEsc}" />
    <meta name="twitter:title" content="${titleEsc}" />
    <meta name="twitter:description" content="${descEsc}" />
    <meta name="twitter:image" content="${imageEsc}" />
  </head>
  <body>
    <main>
      <h1>${titleEsc}</h1>
      <p>${descEsc}</p>
      <p><a href="${canonicalEsc}">${canonicalEsc}</a></p>
    </main>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  res.status(200).send(html);
}
