/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00ff41',
        'neon-red': '#ff006e',
        'neon-purple': '#9d4edd',
        'neon-blue': '#00d9ff',
        'dark-bg': '#0a0e27',
        'dark-surface': '#1a1f3a',
        'dark-card': '#252d48',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'money-flow': 'money-flow 3s ease-in-out infinite',
        'growth-curve': 'growth-curve 4s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'neon-flicker': 'neon-flicker 0.15s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 255, 65, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(0, 255, 65, 0)' },
        },
        'money-flow': {
          '0%': { transform: 'translateY(100%)', opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { transform: 'translateY(-100%)', opacity: 0 },
        },
        'growth-curve': {
          '0%': { transform: 'scaleY(0)', opacity: 0 },
          '100%': { transform: 'scaleY(1)', opacity: 1 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'neon-flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': { opacity: 1 },
          '20%, 24%, 55%': { opacity: 0.5 },
        },
      },
      boxShadow: {
        'neon-glow': '0 0 10px rgba(0, 255, 65, 0.5)',
        'neon-glow-red': '0 0 10px rgba(255, 0, 110, 0.5)',
        'neon-glow-blue': '0 0 10px rgba(0, 217, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
