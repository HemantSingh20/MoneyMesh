/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563eb',     // Primary Blue
          purple: '#8b5cf6',   // Secondary Purple
          green: '#10b981',    // Success Green
          darkBg: '#0f172a',   // Slate 900
          darkCard: '#1e293b', // Slate 800
          lightBg: '#f8fafc',  // Slate 50
          lightCard: '#ffffff'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
