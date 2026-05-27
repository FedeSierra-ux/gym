/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#06060f',
        background: '#06060f',
        surface: {
          DEFAULT: '#121225',
          elevated: '#1a1a2e',
        },
        card: '#0d0d1c',
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          hi: 'rgba(255,255,255,0.10)',
        },
        primary: {
          DEFAULT: '#00ff88',
          dim: '#00cc6a',
          muted: 'rgba(0,255,136,0.15)',
        },
        info: {
          DEFAULT: '#00d4ff',
          muted: 'rgba(0,212,255,0.15)',
        },
        gold: {
          DEFAULT: '#ffd700',
          muted: 'rgba(255,215,0,0.15)',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Display', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 24px rgba(0,255,136,0.35)',
        'glow-info': '0 0 24px rgba(0,212,255,0.35)',
        'glow-gold': '0 0 24px rgba(255,215,0,0.35)',
        'card': '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}
