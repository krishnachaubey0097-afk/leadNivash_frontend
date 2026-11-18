/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-50)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
        },
        ink: 'var(--ink)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        gold: 'var(--gold)',
        info: 'var(--info)',
        warn: {
          DEFAULT: 'var(--warn)',
          bg: 'var(--warn-bg)',
        },
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'input': '12px',
        'card': '16px',
        'sheet': '24px',
      },
    },
  },
  plugins: [],
}
