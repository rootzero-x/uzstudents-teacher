/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "system-ui", "sans-serif"],
      },
      colors: {
        uz: {
          bg: "#020617", // slate-950 ga yaqin
          card: "#0b1224", // premium card
          primary: "#6366f1", // indigo
          accent: "#60a5fa", // blue
        },
      },
    },
  },
  plugins: [],
};
