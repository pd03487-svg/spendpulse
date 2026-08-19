/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        dark: {
          950: '#080c14',
          900: '#0f172a',
          850: '#131d35',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
