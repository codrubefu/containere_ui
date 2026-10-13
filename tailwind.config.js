/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: 'var(--base-950)',
          900: 'var(--base-900)',
          800: 'var(--base-800)',
          700: 'var(--base-700)',
          600: 'var(--base-600)',
        },
        paper: 'var(--paper)',
        muted: 'var(--muted)',
        ink: '#15181A',
        amber: {
          DEFAULT: '#F5A623',
          dim: '#8A5E17',
        },
        steel: {
          DEFAULT: '#4A90A4',
          dim: '#2E5A67',
        },
        signal: {
          DEFAULT: '#3FA34D',
          dim: '#25592D',
        },
        alert: {
          DEFAULT: '#C1443C',
          dim: '#6E2622',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
