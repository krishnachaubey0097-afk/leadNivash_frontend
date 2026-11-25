/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      ringColor: {
        DEFAULT: '#018E45',
      },
      colors: {
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)',
          950: 'var(--brand-950)',
        },
        lime: {
          DEFAULT: 'var(--lime)',
          soft: 'var(--lime-soft)',
        },
        'ink-black': 'var(--ink-black)',
        cream: 'var(--cream)',
        line: 'var(--line)',
        ink: {
          DEFAULT: 'var(--ink-900)',
          900: 'var(--ink-900)',
          700: 'var(--ink-700)',
          500: 'var(--ink-500)',
        },
        text: 'var(--text)',
        muted: 'var(--muted)',
        faint: 'var(--faint)',
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          raised: 'var(--surface-raised)',
          hover: 'var(--surface-hover)',
        },
        border: {
          DEFAULT: 'var(--border)',
          subtle: 'var(--border-subtle)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          text: 'var(--gold-text)',
          bg: 'var(--gold-bg)',
        },
        info: {
          DEFAULT: 'var(--info)',
          bg: 'var(--info-bg)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        warn: {
          DEFAULT: 'var(--warn)',
          bg: 'var(--warn-bg)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          bg: 'var(--danger-bg)',
        },
      },
      screens: {
        '2xl': '1440px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        jakarta: ["'Plus Jakarta Sans'", 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['22px', { lineHeight: '1.25', fontWeight: '600' }],
        'section-title': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '1.35', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5' }],
        'body-lg': ['16px', { lineHeight: '1.5' }],
        'secondary': ['13px', { lineHeight: '1.5' }],
        'meta': ['12px', { lineHeight: '1.4' }],
        'btn': ['15px', { lineHeight: '1', fontWeight: '600' }],
      },
      spacing: {
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
      },
      borderRadius: {
        'input': '10px',
        'card': '14px',
        'card-lg': '16px',
        'sheet': '20px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
      },
    },
  },
  plugins: [],
}
