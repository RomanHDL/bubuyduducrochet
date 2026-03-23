/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: { 50: '#FFFDF7', 100: '#FFF9E8', 200: '#FFF3D1', 300: '#FFECB3', 400: '#FFE082' },
        blush: { 50: '#FFF5F5', 100: '#FFE8E8', 200: '#FFCCD2', 300: '#FFB3BD', 400: '#FF8FA3', 500: '#FF6B81' },
        lavender: { 50: '#F8F5FF', 100: '#EDE5FF', 200: '#D9C8FF', 300: '#C4ABFF', 400: '#A78BFA' },
        mint: { 50: '#F0FFF4', 100: '#D4F5E0', 200: '#A8E6CF', 300: '#7DD3A8', 400: '#4ADE80' },
        sky: { 50: '#F0F9FF', 100: '#E0F2FE', 200: '#B3E0FF', 300: '#7CC4F5' },
        cocoa: { 50: '#FDF8F5', 100: '#F5E6DA', 200: '#E8C9B0', 300: '#D4A574', 400: '#B8845A', 500: '#8B6543', 600: '#6B4A30', 700: '#4A3320', 800: '#2D1F14' },
      },
      fontFamily: {
        display: ['Quicksand', 'Nunito', 'sans-serif'],
        body: ['Nunito', 'Quicksand', 'sans-serif'],
      },
      borderRadius: {
        'cute': '1.25rem',
        'bubble': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(139, 101, 67, 0.08)',
        'warm': '0 4px 24px rgba(139, 101, 67, 0.12)',
        'glow': '0 0 20px rgba(255, 182, 193, 0.3)',
      },
    },
  },
  plugins: [],
};
