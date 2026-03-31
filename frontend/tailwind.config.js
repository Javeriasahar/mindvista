/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0D0D0D',
          soft: '#1A1A2E',
        },
        sage: {
          50:  '#f0faf4',
          100: '#d6f3e3',
          200: '#ace8c7',
          300: '#74d4a5',
          400: '#3DBA7F',
          500: '#28a066',
          DEFAULT: '#28a066',
          600: '#1e8052',
          700: '#1a6542',
        },
        slate: {
          850: '#1e2435',
          900: '#111827',
          950: '#080c14',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'pulse-dot': 'pulseDot 1.4s infinite ease-in-out',
        'slide-in': 'slideIn 0.3s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        pulseDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: 0.4 },
          '40%': { transform: 'scale(1)', opacity: 1 },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateX(-8px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        }
      },
    },
  },
  plugins: [],
}