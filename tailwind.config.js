/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
          light: '#60A5FA'
        },
        secondary: {
          DEFAULT: '#6B7280',
          dark: '#4B5563',
          light: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['Noto Sans TC', 'sans-serif'],
      }
    },
  },
  plugins: [],
} 