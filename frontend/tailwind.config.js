/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        "background-secondary": "#0A0A0A",
        surface: "#111111",
        "surface-elevated": "#171717",
        eventx: {
          DEFAULT: "#ED1C24",
          hover: "#FF3038",
          dark: "#B80E14",
          light: "#FF5C62",
        },
        border: {
          DEFAULT: "#292929",
          subtle: "#1F1F1F",
          active: "#ED1C24",
        },
        primary: "#FFFFFF",
        secondary: "#BDBDBD",
        muted: "#777777",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Barlow Condensed", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(237, 28, 36, 0.35)",
        card: "0 8px 30px rgba(0, 0, 0, 0.7)",
      },
    },
  },
  plugins: [],
};
