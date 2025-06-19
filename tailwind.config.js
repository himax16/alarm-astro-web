/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,astro}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600
        background: '#f9fafb', // gray-50
        surface: '#fff',
        border: '#f6f7f9', // lighter than gray-100 for less pronounced border
      },
    },
  },
  plugins: [],
}
