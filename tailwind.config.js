/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07070d',
        surface: '#111118',
        card: '#13131c',
        border: '#1e1e2a',
        primary: '#00ff88',
        info: '#00d4ff',
        gold: '#ffd700',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
