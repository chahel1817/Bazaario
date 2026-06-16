/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bazaario: {
          dark: '#090D16',       // Deep rich black/dark blue background
          card: '#111827',       // Dark card background
          cardHover: '#1F2937',  // Hover card background
          primary: '#14B8A6',    // Vibrant teal
          primaryHover: '#0D9488',
          accent: '#06B6D4',
          textMuted: '#9CA3AF',
          border: '#1F2937',
        }
      }
    },
  },
  plugins: [],
}
