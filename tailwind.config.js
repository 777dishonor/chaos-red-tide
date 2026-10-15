/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ── 语义色（对应 globals.css 中的 CSS 变量，供 shadcn/ui 使用）──
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },

        // ── 品牌色：深邃墨黑 ──
        ink: {
          950: "hsl(var(--page-bg) / <alpha-value>)",
          900: "hsl(var(--surface) / <alpha-value>)",
          850: "hsl(var(--surface) / <alpha-value>)",
          800: "hsl(var(--surface-2) / <alpha-value>)",
          700: "hsl(var(--surface-3) / <alpha-value>)",
          600: "hsl(var(--surface-3) / <alpha-value>)",
          DEFAULT: "hsl(var(--page-bg) / <alpha-value>)",
        },

        // ── 品牌色：暗金 / 黄铜 ──
        brass: {
          50: "hsl(var(--brass-soft) / <alpha-value>)",
          100: "hsl(var(--brass-soft) / <alpha-value>)",
          200: "hsl(var(--brass-soft) / <alpha-value>)",
          300: "hsl(var(--brass-soft) / <alpha-value>)",
          400: "hsl(var(--brass) / <alpha-value>)",
          500: "hsl(var(--brass-soft) / <alpha-value>)",
          600: "hsl(var(--brass-strong) / <alpha-value>)",
          700: "hsl(var(--brass-strong) / <alpha-value>)",
          800: "hsl(var(--brass-strong) / <alpha-value>)",
          900: "hsl(var(--brass-strong) / <alpha-value>)",
          DEFAULT: "hsl(var(--brass) / <alpha-value>)",
        },

        // ── 纸感中性色（正文 / 弱化文字）──
        parchment: {
          50: "hsl(var(--text-strong) / <alpha-value>)",
          100: "hsl(var(--text-strong) / <alpha-value>)",
          200: "hsl(var(--text-body) / <alpha-value>)",
          300: "hsl(var(--text-body) / <alpha-value>)",
          400: "hsl(var(--text-muted) / <alpha-value>)",
          500: "hsl(var(--text-muted) / <alpha-value>)",
          600: "hsl(var(--text-muted) / <alpha-value>)",
          700: "hsl(var(--text-muted) / <alpha-value>)",
          800: "hsl(var(--text-muted) / <alpha-value>)",
          900: "hsl(var(--text-muted) / <alpha-value>)",
          DEFAULT: "hsl(var(--text-strong) / <alpha-value>)",
        },

        // ── 点缀色：深酒红（会员专属 / 特惠）──
        oxblood: {
          light: "#8A2B38",
          DEFAULT: "#6B1F2A",
          dark: "#4A131C",
        },
      },

      // ── 字体 ──
      // display 的 CSS 变量由 app/layout.tsx 中的 next/font 注入，
      // 默认加载 Cormorant Garamond；如需使用 New Roma，
      // 将字体文件放入 public/fonts 并用 next/font/local 覆盖 --font-display。
      // 中文标题依赖系统衬线回退：字体栈按 macOS / Windows / Linux 常见中文衬线依次兜底，
      // 保证「古典衬线」的调性在中英文上都成立，而不是各平台各显示一套。
      fontFamily: {
        display: [
          "var(--font-display)",
          "New Roma",
          "Cormorant Garamond",
          "Playfair Display",
          "Noto Serif SC",
          "Source Han Serif SC",
          "Source Han Serif CN",
          "Noto Serif CJK SC",
          "Songti SC",
          "STSong",
          "STZhongsong",
          "SimSun",
          "serif",
        ],
        sans: [
          "var(--font-sans)",
          "Inter",
          "Noto Sans SC",
          "Source Han Sans SC",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
        serif: [
          "Georgia",
          "Noto Serif SC",
          "Source Han Serif SC",
          "Source Han Serif CN",
          "Songti SC",
          "STSong",
          "SimSun",
          "serif",
        ],
      },

      letterSpacing: {
        widest2: "0.2em",
        widest3: "0.28em",
      },

      borderRadius: {
        DEFAULT: "0.25rem", // 硬朗的学院派直角
      },

      boxShadow: {
        "glow-brass": "0 0 30px rgba(212, 175, 55, 0.18)",
        "glow-brass-sm": "0 0 14px rgba(212, 175, 55, 0.14)",
        "inset-line": "inset 0 1px 0 rgba(234, 228, 213, 0.05)",
      },

      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
