import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        arabic: ["'Noto Naskh Arabic'", "'Amiri'", "serif"],
        quran: ["'Amiri'", "'Noto Naskh Arabic'", "serif"],
      },
      fontSize: {
        "quran-sm": ["1.25rem", { lineHeight: "2.2" }],
        "quran-base": ["1.5rem", { lineHeight: "2.2" }],
        "quran-lg": ["1.75rem", { lineHeight: "2.2" }],
        "quran-xl": ["2rem", { lineHeight: "2.2" }],
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease-in-out infinite",
        "float-slow": "float-slow 12s ease-in-out infinite",
        "float-slower": "float-slower 15s ease-in-out infinite",
        "pulse-slow": "pulse-slow 6s ease-in-out infinite",
        "shimmer-wave": "shimmer-wave 18s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, -15px) scale(1.05)" },
          "66%": { transform: "translate(-10px, 10px) scale(0.98)" },
        },
        "float-slower": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-25px, -20px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        "shimmer-wave": {
          "0%": { opacity: "0", transform: "translateY(-100%)" },
          "15%": { opacity: "0.03" },
          "50%": { opacity: "0.06" },
          "85%": { opacity: "0.03" },
          "100%": { opacity: "0", transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
