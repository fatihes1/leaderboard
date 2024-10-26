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
        'nav-color': '#17151f',
        'highlight-purple-dark': '#7c66dc',
        'highlight-purple-light': '#f5f5f5',
        'title-bg-dark': '#2d1059',
        'title-bg-light': '#e2e2e2',
        'bg-dark': '#17151f',
        'bg-light': '#f5f5f5'
      },
    },
  },
  plugins: [],
}

