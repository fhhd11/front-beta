/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto-mono': ['Roboto Mono', 'monospace'],
      },
      colors: {
        'dark-bg': '#141414',
        'chat-bg': 'rgba(0,0,0,0.67)',
        'message-bg': 'rgba(11,11,11,0.4)',
        'input-bg': 'rgba(0,0,0,0.65)',
        'input-bg-to': 'rgba(25,25,25,0.475)',
      },
      backdropBlur: {
        '77': '77.2px',
        '7': '7.252px',
        '6': '6.279px',
      },
      boxShadow: {
        'chat': '0px 0px 36.3px -13px rgba(0,0,0,0.67)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      letterSpacing: {
        '1.5': '1.5px',
        '3.4': '3.445px',
      },
      lineHeight: {
        '16.871': '16.871px',
        '25.115': '25.115px',
        '29.007': '29.007px',
      },
    },
  },
  plugins: [],
}
