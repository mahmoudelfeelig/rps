module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: ['bg-dark'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#B145A1',
          100: '#B145A1',
          500: '#B145A1',
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