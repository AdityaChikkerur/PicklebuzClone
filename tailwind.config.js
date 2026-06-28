/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neon: {
          DEFAULT: "var(--neon)",
          dim: "var(--neon-dim)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary-rgb) / <alpha-value>)",
          foreground: "var(--secondary-foreground)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
          foreground: "var(--accent-foreground)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted-rgb) / <alpha-value>)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "rgb(var(--danger-rgb) / <alpha-value>)",
        "green-brand": "rgb(var(--green-brand-rgb) / <alpha-value>)",
        "green-light": "var(--green-light)",
        "green-dark": "var(--green-dark)",
        "sky-brand": "var(--sky-brand)",
        "sky-light": "var(--sky-light)",
        "amber-brand": "var(--amber-brand)",
        "amber-light": "var(--amber-light)",
        "red-brand": "rgb(var(--red-brand-rgb) / <alpha-value>)",
        "red-light": "var(--red-light)",
        arena: {
          bg: "var(--arena-bg)",
          surface: "var(--arena-surface)",
          border: "var(--arena-border)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius)",
        "2xl": "calc(var(--radius) + 4px)",
        "3xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        "card-hover":
          "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(200, 255, 0, 0.06)",
        score: "0 0 40px rgba(200, 255, 0, 0.25), 0 8px 32px rgba(0, 0, 0, 0.5)",
        neon: "0 0 20px rgba(200, 255, 0, 0.3), 0 0 40px rgba(200, 255, 0, 0.1)",
        "neon-sm": "0 0 12px rgba(200, 255, 0, 0.2)",
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
