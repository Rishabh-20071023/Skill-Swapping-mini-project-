/* =============================================================================
   SkillLoom — Tailwind configuration
   Loaded immediately after the Tailwind Play CDN script in every page's <head>.
   Colour tokens reference the CSS custom properties defined in css/styles.css,
   so a single class (e.g. bg-surface) automatically flips between the light
   and dark themes when <html class="dark"> changes.
   ========================================================================== */

tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0EA5E9",
          hover: "#38BDF8",
          strong: "#0284C7",
        },
        accent: "#6366F1",
        navy: "#0C4A6E",
        page: "var(--c-page)",
        surface: {
          DEFAULT: "var(--c-surface)",
          2: "var(--c-surface-2)",
          3: "var(--c-surface-3)",
        },
        heading: "var(--c-heading)",
        body: "var(--c-body)",
        muted: "var(--c-muted)",
        line: "var(--c-border)",
        "line-strong": "var(--c-border-strong)",
        link: "var(--c-link)",
        success: "var(--c-success)",
        danger: "var(--c-danger)",
      },
      borderColor: {
        DEFAULT: "var(--c-border)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        heading: ['"Plus Jakarta Sans"', "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        soft: "12px",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
      maxWidth: {
        prose: "68ch",
      },
    },
  },
};
