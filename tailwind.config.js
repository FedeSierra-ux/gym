/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Aurora design tokens
        bg: '#0C0E14',
        surf: '#161821',
        surf2: '#1C1F2A',
        ink: '#ECEEF4',
        dim: '#8A91A3',
        faint: '#3B3F4E',
        acc: '#E8634A',
        acc2: '#F2A93B',
        good: '#34D399',
        line: 'rgba(236,238,244,0.07)',
        line2: 'rgba(236,238,244,0.12)',
        // Legacy aliases for non-migrated screens
        background: '#0C0E14',
        surface: {
          DEFAULT: '#161821',
          elevated: '#1C1F2A',
        },
        card: '#161821',
        border: {
          DEFAULT: 'rgba(236,238,244,0.07)',
          hi: 'rgba(236,238,244,0.12)',
        },
        primary: {
          DEFAULT: '#E8634A',
          dim: '#d4553e',
          muted: 'rgba(232,99,74,0.15)',
        },
        info: {
          DEFAULT: '#38BDF8',
          muted: 'rgba(56,189,248,0.15)',
        },
        gold: {
          DEFAULT: '#F2A93B',
          muted: 'rgba(242,169,59,0.15)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
