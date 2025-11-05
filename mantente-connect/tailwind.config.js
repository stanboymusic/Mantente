/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mantente color palette
        gold: '#e2b54e',
        'light-gold': '#f4d895',
        brown: '#8b6f47',
        'dark-brown': '#6d5a39',
        taupe: '#a89080',
        violet: '#7c5daf',
        'light-violet': '#a481c2',
        'dark-gray': '#5a5a5a',
        gray: '#999999',
        'light-gray': '#e8e8e8',
        white: '#ffffff',
        dark: '#222222',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}