/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: "true",
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        white: "#ffffff",
        "dodger-blue": "#33393f",
        "isbjorn-blue": "#29b1c7",
        "isbjorn-dark": "#1f4492",
        black: "#1b1f22",
        silver: "#bbb",
        light: "#b3e7f0",
      },
      screens: {
        xs: "480px",
      },
      fontFamily: {
        adellesans: ["Adellesansbasic", "sans-serif"],
        mono: ["Menlo", "Monaco", "Courier New", "monospace"],
      },
      fontSize: {
        xxs: "0.625rem",
        xxxs: "0.5rem",
        xxxxs: "0.375rem",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        flash: {
          "0%, 100%": {
            color: "#ff0000",
          },
          "50%": {
            color: "#ffffff",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        flash: "flash 1s ease-in-out 3",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
