/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F8F4EC",
        paper: "#fffaf2",
        ink: "#171513",
        eventx: "#d71920",
        "eventx-dark": "#a90f17",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["Barlow Condensed", "sans-serif"],
      },
      boxShadow: {
        soft: "0 16px 40px rgba(48, 30, 19, .10)",
      },
    },
  },
  plugins: [],
};
