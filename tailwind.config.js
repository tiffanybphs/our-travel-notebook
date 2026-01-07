/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 妳的專屬配色
        'jp-cream': '#FFF9E3',
        'jp-pink': '#FFD1DC',
        'jp-brown': '#8D775F',
        'jp-blue': '#E0F2FE',
      },
      fontFamily: {
        // 設定日系圓體
        maru: ['"Zen Maru Gothic"', 'sans-serif'],
      },
      borderRadius: {
        'jp': '30px', // 妳喜歡的那種圓潤感
      }
    },
  },
  plugins: [],
}
