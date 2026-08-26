/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        card: '#12141c',
        'card-hover': '#181b26',
        border: '#1f2433',
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        charcoal: {
          700: '#272d3d',
          800: '#1a1e2b',
          900: '#11141e',
          950: '#0b0d14',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Hind Siliguri', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      }
    },
  },
  plugins: [],
}
