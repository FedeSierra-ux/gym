import { colors as t } from './design-tokens.js'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tokens de diseño — definidos una sola vez en design-tokens.js
        bg: t.bg,
        surf: t.surf,
        surf2: t.surf2,
        ink: t.ink,
        dim: t.dim,
        faint: t.faint,
        acc: t.acc,
        acc2: t.acc2,
        good: t.good,
        bad: t.bad,
        line: t.line,
        line2: t.line2,
        // Alias con los nombres que usan las pantallas escritas con clases
        background: t.bg,
        surface: { DEFAULT: t.surf, elevated: t.surf2 },
        card: t.surf,
        border: { DEFAULT: t.line, hi: t.line2 },
        primary: { DEFAULT: t.acc, dim: t.accDim, muted: 'rgba(232,99,74,0.15)' },
        info: { DEFAULT: t.info, muted: 'rgba(56,189,248,0.15)' },
        gold: { DEFAULT: t.acc2, muted: 'rgba(242,169,59,0.15)' },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
