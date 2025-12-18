/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6fc',
          100: '#c9d1d9',
          200: '#b1bac4',
          300: '#8b949e',
          400: '#6e7681',
          500: '#484f58',
          600: '#30363d',
          700: '#21262d',
          800: '#161b22',
          900: '#0d1117',
        },
        accent: {
          light: '#58a6ff',
          DEFAULT: '#1f6feb',
          dark: '#0969da',
        },
        github: {
          canvas: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          text: '#c9d1d9',
          heading: '#f0f6fc',
          blue: '#58a6ff',
          green: '#3fb950',
        },
      },
      backgroundImage: {
        'github-gradient': 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        'github-shine': 'linear-gradient(135deg, rgba(88, 166, 255, 0.1) 0%, transparent 100%)',
      },
      boxShadow: {
        'github': '0 0 0 1px #30363d',
        'github-lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.6s ease-out',
        'slideIn': 'slideIn 0.6s ease-out',
        'scaleIn': 'scaleIn 0.5s ease-out',
        'slideInFromBottom': 'slideInFromBottom 0.8s ease-out',
        'fadeInScale': 'fadeInScale 0.7s ease-out',
      },
      animationDelay: {
        '100': '0.1s',
        '200': '0.2s',
        '300': '0.3s',
      },
    },
  },
  plugins: [],
}
