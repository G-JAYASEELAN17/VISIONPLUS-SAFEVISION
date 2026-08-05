/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
   extend: {
  colors: {

    primary: {
      DEFAULT: "#6366F1",
      light: "#818CF8",
      dark: "#4338CA",
    },

    secondary: {
      DEFAULT: "#06B6D4",
      dark: "#0891B2",
    },

    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#38BDF8",

    surface: {
      DEFAULT: "#0B1120",
      card: "#111827",
      elevated: "#1F2937",
      border: "#334155",
    },

    sidebar: "#0F172A",

    text: {
      primary: "#F8FAFC",
      secondary: "#CBD5E1",
      muted: "#94A3B8",
    },

    accent: {
      purple: "#8B5CF6",
      cyan: "#06B6D4",
      emerald: "#10B981",
      rose: "#F43F5E",
    },

    status: {
      online: "#22C55E",
      offline: "#64748B",
      warning: "#F59E0B",
      critical: "#EF4444",
    },
  },

  fontFamily: {
    sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui"],
  },

  borderRadius: {
    lg: "14px",
    xl: "18px",
    "2xl": "24px",
    "3xl": "30px",
  },

  boxShadow: {

    card:
      "0 10px 30px rgba(0,0,0,.45)",

    glow:
      "0 0 25px rgba(99,102,241,.30)",

    success:
      "0 0 20px rgba(34,197,94,.25)",

    danger:
      "0 0 20px rgba(239,68,68,.25)",

    xl:
      "0 25px 50px rgba(0,0,0,.50)",

  },

  backgroundImage: {

    hero:
      "radial-gradient(circle at top right,#4338CA 0%,transparent 40%), radial-gradient(circle at bottom left,#0891B2 0%,transparent 40%)",

    glass:
      "linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.02))",

  },

  animation: {

    float: "float 5s ease-in-out infinite",

    pulseSlow: "pulse 3s infinite",

    glow: "glow 2s infinite",

  },

  keyframes: {

    float: {
      "0%,100%": {
        transform: "translateY(0px)",
      },
      "50%": {
        transform: "translateY(-10px)",
      },
    },

    glow: {
      "0%,100%": {
        boxShadow:
          "0 0 0 rgba(99,102,241,.2)",
      },
      "50%": {
        boxShadow:
          "0 0 25px rgba(99,102,241,.6)",
      },
    },

  },

},
  },
  plugins: [],
}
