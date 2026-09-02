/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#c9a84c', bright: '#f0d078', dim: '#8a7233', deep: '#6b5a2a' },
        violet: { DEFAULT: '#7c3aed', bright: '#a78bfa', deep: '#4c1d95', muted: '#5b21b6' },
        copper: '#e8a0bf',
        rose: { DEFAULT: '#f472b6', deep: '#be185d' },
        teal: { DEFAULT: '#2dd4bf', deep: '#0d9488' },
        void: '#06060c',
        deep: '#0a0a14',
        surface: '#111119',
        card: '#16161f',
        elevated: '#1c1c28',
        warm: '#f5f0e8',
        muted: '#9a9490',
        dim: '#5a5652',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 2s infinite',
        'shimmer': 'gold-shimmer 4s ease-in-out infinite',
        'pulse-soft': 'luxury-pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'gold-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'luxury-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(201,168,76,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(201,168,76,0.2), 0 0 80px rgba(201,168,76,0.05)' },
        },
      },
      boxShadow: {
        'luxury': '0 20px 60px -15px rgba(0,0,0,0.5)',
        'luxury-gold': '0 20px 60px -15px rgba(0,0,0,0.5), 0 0 40px -10px rgba(201,168,76,0.1)',
        'luxury-violet': '0 20px 60px -15px rgba(0,0,0,0.5), 0 0 40px -10px rgba(124,58,237,0.1)',
        'luxury-teal': '0 20px 60px -15px rgba(0,0,0,0.5), 0 0 40px -10px rgba(45,212,191,0.1)',
      },
    },
  },
  plugins: [],
};
