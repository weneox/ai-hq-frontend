/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"], // ✅ html.dark
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 6px)",
      },
      colors: {
        // ✅ Use your CSS tokens everywhere via hsl(var(--token))
        bg: "hsl(var(--bg))",
        fg: "hsl(var(--fg))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        surface: "hsl(var(--surface))",
        brand: "hsl(var(--brand))",
        "brand-fg": "hsl(var(--brand-foreground))",
        ring: "hsl(var(--ring))",
      },
      boxShadow: {
        // ✅ Premium shadow presets (consistent across components)
        "elite-xs": "0 1px 0 rgba(15,23,42,0.06)",
        "elite-sm":
          "0 1px 0 rgba(15,23,42,0.06), 0 16px 44px -46px rgba(2,6,23,0.28)",
        "elite-md":
          "0 1px 0 rgba(15,23,42,0.08), 0 28px 86px -62px rgba(2,6,23,0.52)",
        "elite-lg":
          "0 1px 0 rgba(15,23,42,0.08), 0 40px 140px -88px rgba(2,6,23,0.62)",
        "elite-dark-sm":
          "0 1px 0 rgba(255,255,255,0.06), 0 18px 54px -52px rgba(0,0,0,0.78)",
        "elite-dark-md":
          "0 1px 0 rgba(255,255,255,0.06), 0 30px 96px -66px rgba(0,0,0,0.92)",
        "elite-dark-lg":
          "0 1px 0 rgba(255,255,255,0.06), 0 42px 150px -92px rgba(0,0,0,0.98)",
      },
    },
  },
  plugins: [],
};