export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#edfcf5',
          100: '#d3f8e5',
          200: '#abefd0',
          300: '#74e0b5',
          400: '#3cc995',
          500: '#17ae7b',
          600: '#0b8c64',
          700: '#097052',
          800: '#0a5942',
          900: '#094938',
          950: '#032921',
        },
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
      },
      animation: {
        rise: 'rise 260ms cubic-bezier(0.22, 1, 0.36, 1) both',
        ring: 'pulseRing 1900ms ease-out infinite',
      },
    },
  },
  plugins: [],
}
