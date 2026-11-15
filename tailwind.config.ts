import type { Config } from 'tailwindcss';

// Every colour is a CSS variable defined in src/styles/globals.css.
// To change the palette, edit the variables there; nothing here needs to change.
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        line: token('line'),
        water: token('water'),
        aqua: token('aqua'),
        energy: token('energy'),
        waste: token('waste'),
        rain: token('rain'),
        danger: token('danger'),
        text: token('text'),
        muted: token('muted'),
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: { xl: '0.9rem', '2xl': '1.25rem' },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--water) / 0.25), 0 8px 40px -12px rgb(var(--water) / 0.35)',
        card: '0 10px 40px -18px rgb(0 0 0 / 0.55)',
      },
      keyframes: {
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(4%, -3%, 0) scale(1.08)' },
        },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        dash: { to: { strokeDashoffset: '-40' } },
      },
      animation: {
        'aurora-drift': 'aurora-drift 22s ease-in-out infinite',
        'spin-slow': 'spin-slow 40s linear infinite',
        'fade-up': 'fade-up 0.35s ease-out both',
        dash: 'dash 1.6s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
