/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#14161A',
          panel: '#1C1F26',
        },
        accent: {
          DEFAULT: '#4C5FD5',
          hover: '#3A4BBD',
        },
        negative: {
          DEFAULT: '#C0574A',
          hover: '#A9483C',
        },
        surface: {
          DEFAULT: '#1C1F26',
          hover: '#23272F',
          border: '#2D323B',
        },
        content: {
          primary: '#E4E6EA',
          secondary: '#9CA1AA',
          muted: '#4A4F58',
        }
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};