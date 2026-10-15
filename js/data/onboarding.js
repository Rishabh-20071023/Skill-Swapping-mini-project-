/* =============================================================================
   SkillLoom — Data: onboarding & profile customisation
   Everything the sign-up wizard asks about: who you are, what interests you,
   what you will teach, and the rule that decides whether you must show real
   work before other members can book you.

   Skills that live in the technology or design categories expect proof of
   work (a portfolio link). Skills like cooking or guitar do not — a great
   session speaks for itself.
   ========================================================================== */

window.SL = window.SL || {};
SL.data = SL.data || {};

(function (data) {
  "use strict";

  /* ---------- Step 1 — who is signing up ------------------------------------- */
  data.occupations = [
    {
      id: "professional",
      label: "Working professional",
      icon: "briefcase",
      hint: "Employed or self-employed — you can teach from real experience.",
      roleLabel: "Job title",
      rolePlaceholder: "e.g. Product designer",
      orgLabel: "Company or client",
      orgPlaceholder: "e.g. Freelance · ex-Fjord",
    },
    {
      id: "student",
      label: "Student",
      icon: "graduation-cap",
      hint: "School, college or university — learning and trading skills.",
      roleLabel: "Field of study",
      rolePlaceholder: "e.g. Computer science",
      orgLabel: "School or university",
      orgPlaceholder: "e.g. Bengaluru Institute of Technology",
    },
    {
      id: "other",
      label: "Other",
      icon: "user",
      hint: "Career break, retired, self-taught or just exploring — all welcome.",
      roleLabel: "What best describes you?",
      rolePlaceholder: "e.g. Self-taught designer",
      orgLabel: "Anything else (optional)",
      orgPlaceholder: "e.g. Parent, traveller, tinkerer",
    },
  ];

  data.occupationById = (id) => data.occupations.find((o) => o.id === id) || null;

  /* ---------- Step 2 — fields of interest ------------------------------------- */
  data.interests = [
    { label: "Technology", icon: "code" },
    { label: "Design", icon: "palette" },
    { label: "Music", icon: "music" },
    { label: "Languages", icon: "globe" },
    { label: "Cooking", icon: "utensils" },
    { label: "Fitness", icon: "dumbbell" },
    { label: "Business", icon: "briefcase" },
    { label: "Finance", icon: "bar-chart" },
    { label: "Writing", icon: "pen-line" },
    { label: "Photography", icon: "camera" },
    { label: "Arts & crafts", icon: "sparkles" },
    { label: "Wellbeing", icon: "heart" },
    { label: "Gaming", icon: "target" },
    { label: "Travel", icon: "map-pin" },
  ];

  data.interestByLabel = (label) =>
    data.interests.find((i) => i.label.toLowerCase() === String(label || "").toLowerCase()) || null;

  /* ---------- Step 2 — hobbies (presets; anyone can type their own) ----------- */
  data.hobbyPresets = [
    { label: "Coffee brewing", icon: "coffee" },
    { label: "Reading", icon: "book" },
    { label: "Chess", icon: "target" },
    { label: "Sketching", icon: "pen-line" },
    { label: "Playing guitar", icon: "music" },
    { label: "Baking", icon: "utensils" },
    { label: "Running", icon: "dumbbell" },
    { label: "Filmmaking", icon: "camera" },
    { label: "Gardening", icon: "heart" },
    { label: "Side projects", icon: "code" },
    { label: "Journaling", icon: "file-text" },
    { label: "Travelling", icon: "map-pin" },
  ];

  data.hobbyByLabel = (label) =>
    data.hobbyPresets.find((h) => h.label.toLowerCase() === String(label || "").toLowerCase()) || null;

  /* ---------- Step 3 — the skill catalogue ------------------------------------- */
  /* `category` decides the portfolio rule: tech & design need proof of work. */
  data.teachSkills = [
    // design — portfolio expected
    { label: "Graphic design", category: "design" },
    { label: "UI/UX design", category: "design" },
    { label: "Branding", category: "design" },
    { label: "Illustration", category: "design" },
    { label: "Video editing", category: "design" },
    { label: "Motion graphics", category: "design" },
    // tech — portfolio expected
    { label: "Web development", category: "tech" },
    { label: "JavaScript", category: "tech" },
    { label: "React", category: "tech" },
    { label: "CSS", category: "tech" },
    { label: "Python", category: "tech" },
    { label: "Data analysis", category: "tech" },
    { label: "Machine learning", category: "tech" },
    { label: "Mobile development", category: "tech" },
    { label: "Accessibility", category: "tech" },
    { label: "DevOps", category: "tech" },
    // everything else — no portfolio needed
    { label: "Guitar", category: "music" },
    { label: "Piano", category: "music" },
    { label: "Music theory", category: "music" },
    { label: "Singing", category: "music" },
    { label: "Cooking", category: "cooking" },
    { label: "Baking", category: "cooking" },
    { label: "Meal planning", category: "cooking" },
    { label: "Spanish", category: "languages" },
    { label: "Mandarin", category: "languages" },
    { label: "English", category: "languages" },
    { label: "French", category: "languages" },
    { label: "Arabic", category: "languages" },
    { label: "Yoga", category: "fitness" },
    { label: "Strength training", category: "fitness" },
    { label: "Nutrition", category: "fitness" },
    { label: "Photography", category: "photography" },
    { label: "Photo editing", category: "photography" },
    { label: "Copywriting", category: "writing" },
    { label: "Content writing", category: "writing" },
    { label: "Public speaking", category: "business" },
    { label: "Marketing", category: "business" },
    { label: "Financial modelling", category: "business" },
  ];

  /* The categories whose members must show real work before others book them. */
  data.portfolioCategories = ["tech", "design"];

  data.portfolioCategoryLabel = { tech: "technology", design: "design" };

  data.skillByLabel = (label) =>
    data.teachSkills.find((s) => s.label.toLowerCase() === String(label || "").toLowerCase()) || null;

  /** Case-insensitive category lookup for any offered skill label. */
  data.skillCategory = (label) => {
    const skill = data.skillByLabel(label);
    return skill ? skill.category : null;
  };

  /** True when any offered skill comes from a portfolio-expecting category. */
  data.portfolioRequired = function (labels) {
    return (labels || []).some(function (label) {
      const category = data.skillCategory(label);
      return !!category && data.portfolioCategories.indexOf(category) !== -1;
    });
  };

  /** The offending categories, for the wizard's explanation line. */
  data.portfolioReason = function (labels) {
    const found = [];
    (labels || []).forEach(function (label) {
      const category = data.skillCategory(label);
      if (category && data.portfolioCategories.indexOf(category) !== -1) {
        const name = data.portfolioCategoryLabel[category] || category;
        if (found.indexOf(name) === -1) found.push(name);
      }
    });
    return found;
  };

  /* ---------- Profile customisation: banners & avatar tones -------------------- */
  data.banners = [
    { id: "aurora", label: "Aurora", css: "linear-gradient(120deg,#0EA5E9,#6366F1)" },
    { id: "sunset", label: "Sunset", css: "linear-gradient(120deg,#F97316,#DB2777)" },
    { id: "ocean", label: "Ocean", css: "linear-gradient(120deg,#0369A1,#0F766E)" },
    { id: "forest", label: "Forest", css: "linear-gradient(120deg,#15803D,#84CC16)" },
    { id: "grape", label: "Grape", css: "linear-gradient(120deg,#7C3AED,#EC4899)" },
    { id: "midnight", label: "Midnight", css: "linear-gradient(120deg,#0F172A,#334155)" },
  ];

  data.bannerById = (id) => data.banners.find((b) => b.id === id) || null;

  /** CSS for a stored banner id — falls back to the classic navy header. */
  data.bannerCss = function (id) {
    const banner = data.bannerById(id);
    return banner ? banner.css : "";
  };
})(SL.data);
