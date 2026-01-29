import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        // Digimon theme colors
        digimon: {
          // Dark blue - primary background and accents
          dark: {
            50: '#e6f0ff',
            100: '#b3d1ff',
            200: '#80b3ff',
            300: '#4d94ff',
            400: '#1a75ff',
            500: '#0052cc',
            600: '#003d99',
            700: '#002966',
            800: '#0a1628',
            900: '#050d17',
            950: '#030810',
          },
          // Orange/amber - action highlights and accents
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
            950: '#431407',
          },
          // Stage colors
          stage: {
            fresh: '#94a3b8',      // Slate
            'in-training': '#a3e635', // Lime
            rookie: '#22c55e',     // Green
            champion: '#3b82f6',   // Blue
            ultimate: '#a855f7',   // Purple
            mega: '#f59e0b',       // Amber
          },
          // Attribute colors (flavor only)
          attribute: {
            vaccine: '#22d3ee',   // Cyan
            data: '#a3e635',      // Lime
            virus: '#f43f5e',     // Rose
            free: '#94a3b8',      // Slate
          },
          // Status colors
          status: {
            health: '#22c55e',
            damage: '#ef4444',
            buff: '#3b82f6',
            debuff: '#a855f7',
          },
        },
      },
      fontFamily: {
        // Digital/tech-inspired for headers
        display: ['Orbitron', 'ui-monospace', 'monospace'],
        // Clean sans-serif for body
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px theme(colors.digimon.orange.500)' },
          '100%': { boxShadow: '0 0 20px theme(colors.digimon.orange.500), 0 0 30px theme(colors.digimon.orange.300)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
