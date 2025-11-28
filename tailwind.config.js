/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a', // Slate 900
        'brand-green': '#10b981', // Emerald 500
      }
    },
  },
  plugins: [],
}
