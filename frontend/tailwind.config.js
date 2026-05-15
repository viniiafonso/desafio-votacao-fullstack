/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        coop: {
          50:  '#f0faf4',
          100: '#d9f2e4',
          200: '#b3e4cb',
          300: '#7ecfaa',
          400: '#47b485',
          500: '#249a68',
          600: '#1a7d54',
          700: '#166445',
          800: '#145038',
          900: '#11422f',
          950: '#082518',
        },
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        earth: {
          50:  '#faf8f5',
          100: '#f2ede6',
          200: '#e4d9cb',
          300: '#cfc0a7',
          400: '#b89f82',
          500: '#a08364',
          600: '#8a6c50',
          700: '#725843',
          800: '#5e4939',
          900: '#4e3d30',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'coop-gradient': 'linear-gradient(135deg, #11422f 0%, #1a7d54 60%, #249a68 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-in': 'slide-in 0.25s ease-out both',
        'pulse2': 'pulse2 2s ease-in-out infinite',
      },
      boxShadow: {
        'coop': '0 4px 24px -4px rgba(26, 125, 84, 0.25)',
        'gold': '0 4px 16px -4px rgba(245, 158, 11, 0.35)',
      },
    },
  },
  plugins: [],
};
