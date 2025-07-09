/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
        techbit: ['Techbit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}