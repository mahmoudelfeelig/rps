module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: ['bg-dark'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF00FF',
          100: '#FFEEFF',
          500: '#FF00FF',
          900: '#880088'
        },
        dark: {
          DEFAULT: '#0A0A0A',
          100: '#1A1A1A',
          200: '#2D2D2D',
          300: '#404040'
        }
      }
    },
  },
  plugins: [],
}