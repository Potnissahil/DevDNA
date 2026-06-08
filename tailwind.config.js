/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf8ff",
          100: "#d7efff",
          200: "#b8e4ff",
          300: "#89d4ff",
          400: "#54bcff",
          500: "#2b9fff",
          600: "#117fe6",
          700: "#1364b6",
          800: "#185590",
          900: "#194874"
        }
      },
      boxShadow: {
        panel: "0 20px 45px rgba(15, 23, 42, 0.25)"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at top, rgba(43, 159, 255, 0.18), transparent 34%), linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px)"
      },
      backgroundSize: {
        "hero-grid": "auto, 32px 32px, 32px 32px"
      }
    }
  },
  plugins: []
};
