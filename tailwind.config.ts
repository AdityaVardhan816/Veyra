import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#090A0F",
        panel: "#101320",
        panelSoft: "#161A29",
        accent: "#7C5CFF",
        accentSoft: "#A88CFF",
        text: "#E7E9F3",
        textMuted: "#9AA3B8",
      },
      boxShadow: {
        premium: "0 12px 40px rgba(10, 12, 22, 0.45)",
      },
      backgroundImage: {
        glow: "radial-gradient(80% 80% at 50% 0%, rgba(124, 92, 255, 0.35), rgba(9, 10, 15, 0) 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
