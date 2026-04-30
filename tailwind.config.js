/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: '#0A0A0A',
        bone: '#F5F2E8',
        paper: '#FAFAF7',
        acid: '#D4FF00',
        blood: '#FF2D20',
        cash: '#0CCE6B',
        sky: '#3D5AFE',
      },
      boxShadow: {
        'brutal-sm': '3px 3px 0 0 #0A0A0A',
        'brutal': '6px 6px 0 0 #0A0A0A',
        'brutal-lg': '10px 10px 0 0 #0A0A0A',
        'brutal-xl': '14px 14px 0 0 #0A0A0A',
        'brutal-acid': '6px 6px 0 0 #D4FF00',
        'brutal-blood': '6px 6px 0 0 #FF2D20',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        flash: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        wiggle: 'wiggle 0.6s ease-in-out infinite',
        flash: 'flash 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
