import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./stories/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 按钮颜色
        "button-primary-background": "var(--color-button-primary-background)",
        "button-primary-background-hover": "var(--color-button-primary-background-hover)",
        "button-primary-foreground": "var(--color-button-primary-foreground)",
        "button-primary-foreground-hover": "var(--color-button-primary-foreground-hover)",
        "button-shadow": "var(--color-button-shadow)",
        "button-shadow-hover": "var(--color-button-shadow-hover)",
        // 图标颜色
        "icon-primary": "var(--color-icon-primary)",
        "icon-primary-hover": "var(--color-icon-primary-hover)",
        "icon-primary-disabled": "var(--color-icon-primary-disabled)",

        user: "var(--color-user)",
        "original-text": "var(--color-original-text)",
        "translated-text": "var(--color-translated-text)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
