/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Sora", "system-ui", "sans-serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
      },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-strong": "var(--surface-strong)",
        "surface-soft": "var(--surface-soft)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        line: "var(--line)",
        "success-text": "var(--success-text)",
        "error-text": "var(--error-text)",
        "blue-500": "var(--blue-500)",
        "blue-600": "var(--blue-600)",
        "blue-100": "var(--blue-100)",
        "navy-700": "var(--navy-700)",
        "navy-800": "var(--navy-800)",
        "navy-900": "var(--navy-900)"
      },
      boxShadow: {
        lg: "var(--shadow-lg)",
        md: "var(--shadow-md)"
      }
    }
  },
  plugins: []
};
