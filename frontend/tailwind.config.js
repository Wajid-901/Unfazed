/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // PRD Primary #2563EB
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        therapy: {
          teal: '#0d9488',
          sage: '#84a98c',
          warm: '#fdfbf7',
        }
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
      }
    },
  },
  plugins: [],
}
