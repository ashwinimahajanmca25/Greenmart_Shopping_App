/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#15803d", 
          dark: "#14532d", 
        },
        secondary: {
          DEFAULT: "#6ee7b7",
          dark: "#14532d",   
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '3rem',
          sm: '5rem',
        },
      },
    },
  },
  plugins: [],
}
