/** @type {import('tailwindcss').Config} */
// Colours and fonts point at the CSS variables in src/index.css — tweak them there.
// ponytail: plain var() colours don't support Tailwind's /opacity modifiers; use opacity-* instead.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rail: {
          maroon: 'var(--rail-maroon)',
          yellow: 'var(--rail-yellow)',
          cream: 'var(--rail-cream)',
          ink: 'var(--rail-ink)',
          soft: 'var(--rail-ink-soft)',
          brass: 'var(--rail-brass)',
          'lhb-red': 'var(--rail-lhb-red)',
          teal: 'var(--rail-teal)',
          green: 'var(--rail-green)',
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        sign: 'var(--font-sign)',
        sans: 'var(--font-body)',
      },
    },
  },
  plugins: [],
}
