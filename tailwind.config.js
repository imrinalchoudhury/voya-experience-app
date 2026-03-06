/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'voya-black': '#0C0A07',
        'voya-card': '#111009',
        'voya-gold': '#C9A96E',
        'category-dining': '#C9A96E',
        'category-stay': '#A8B5C8',
        'category-excursion': '#9CAF88',
        'category-cultural': '#C4A8B5',
        'category-wellness': '#A8C4C0',
        'category-transport': '#B8A8C4',
        'category-shopping': '#C9A96E',
      },
      fontFamily: {
        'cormorant': ['Cormorant Garamond', 'serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
