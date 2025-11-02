/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        tiger: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        dark: {
          DEFAULT: '#121212',
          lighter: '#181818',
          card: '#282828',
          hover: '#3E3E3E',
        }
      },
      backgroundColor: {
        'dark-base': '#121212',
        'dark-elevated': '#181818',
        'dark-highlight': '#282828',
        'dark-press': '#3E3E3E',
      },
      textColor: {
        'primary': '#FFFFFF',
        'secondary': '#B3B3B3',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
