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
          '0%, 100%': { transform: 'rotate(2deg)' },
          '50%': { transform: 'rotate(6deg)' },
        },
        flash: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        draw: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-1.5deg)' },
          '50%': { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        scan: {
          '0%': { transform: 'translateY(-15%)', opacity: 0 },
          '6%': { opacity: 0.85 },
          '40%': { transform: 'translateY(115%)', opacity: 0.85 },
          '45%, 100%': { transform: 'translateY(115%)', opacity: 0 },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212, 255, 0, 0)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212, 255, 0, 0.25)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        wiggle: 'wiggle 2.4s ease-in-out infinite',
        flash: 'flash 1.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        draw: 'draw 0.85s cubic-bezier(0.83, 0, 0.17, 1) both',
        float: 'float 6s ease-in-out infinite',
        scan: 'scan 4.5s ease-in-out infinite',
        blob: 'blob 14s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
