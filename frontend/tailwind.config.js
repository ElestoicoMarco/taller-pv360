/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores corporativos para un taller serio
        'taller-dark': '#0f172a', 
        'taller-blue': '#2563eb',
      }
    },
  },
  plugins: [],
}

