/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        floralPink: "#FAD0C4",
        floralPeach: "#FFD1BA",
        floralGreen: "#C5E4D5",
        floralLilac: "#E5D4EF",
        floralText: "#2F2A3A"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)"
      }
    }
  },
  plugins: []
};

