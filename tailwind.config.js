/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#00875A', // Official LeadNivesh Logo Green
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        slate: {
          850: '#161f30',
          900: '#0f172a',
          950: '#080d1a',
        },
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          focus: 'rgb(var(--color-primary-focus) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          muted: 'rgb(var(--color-primary-muted) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgb(var(--color-primary) / 0.35)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'card-light': '0 2px 10px -1px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
