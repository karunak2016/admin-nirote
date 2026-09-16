/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf2f4',
          100: '#fce7eb',
          600: '#cf2247',
          700: '#ad1638',
          800: '#8b1538',
          900: '#7a1535',
        },
        sidebar: '#111827',
      },
    },
  },
  plugins: [],
}
