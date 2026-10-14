/* =============================================================================
   SkillLoom — Data: communities
   Field-based groups members can join. `members` is the displayed count and
   is incremented locally when someone joins (persisted in localStorage).
   ========================================================================== */

window.SL = window.SL || {};
SL.data = SL.data || {};

(function (data) {
  "use strict";

  data.communities = [
    {
      id: "web-development",
      name: "Web Development",
      category: "Tech",
      icon: "code",
      tagline: "Front-end, back-end and everything in between.",
      description:
        "A working group for people building for the web — from first CSS grid to distributed systems. Weekly code reviews, shared debugging threads and swap-friendly office hours.",
      members: 4820,
      tone: 0,
      cover: "web",
      rules: [
        "Share what you tried before asking others to debug it for you.",
        "No unsolicited job posts or course promotions.",
        "Credit sources when you share tutorials or snippets.",
        "Keep code reviews kind and specific.",
      ],
      related: ["data-science", "ui-ux-design", "content-writing"],
    },
    {
      id: "ui-ux-design",
      name: "UI/UX Design",
      category: "Design",
      icon: "palette",
      tagline: "Craft, critique and case studies.",
      description:
        "Designers reviewing each other's work with honesty and care. Portfolio clinics, component-library debates, and a standing invite to post your work-in-progress.",
      members: 3140,
      tone: 1,
      cover: "design",
      rules: [
        "Critique the work, never the person.",
        "Post context with every critique request.",
        "One self-promo thread per member per month.",
      ],
      related: ["web-development", "photography", "content-writing"],
    },
    {
      id: "data-science",
      name: "Data Science",
      category: "Tech",
      icon: "bar-chart",
      tagline: "Statistics, models and honest measurement.",
      description:
        "From first regression to production models. Members share notebooks, run methodology checks, and swap analysis skills for engineering or domain expertise.",
      members: 2680,
      tone: 2,
      cover: "data",
      rules: [
        "Anonymise every dataset you share.",
        "State your assumptions before your conclusions.",
        "No gatekeeping — beginners were all beginners once.",
      ],
      related: ["web-development", "entrepreneurship"],
    },
    {
      id: "music-instruments",
      name: "Music & Instruments",
      category: "Music",
      icon: "music",
      tagline: "Practice logs, gear talk and swap sessions.",
      description:
        "Players of every level comparing practice routines, troubleshooting technique, and finding teachers for the instrument they've been neglecting.",
      members: 3960,
      tone: 3,
      cover: "music",
      rules: [
        "Recordings welcome — feedback must be constructive.",
        "Keep gear sales to the pinned thread.",
        "Respect hearing: keep playback at reasonable volumes.",
      ],
      related: ["photography", "content-writing", "ui-ux-design"],
    },
    {
      id: "languages-culture",
      name: "Languages & Culture",
      category: "Languages",
      icon: "globe",
      tagline: "Conversation partners for twenty languages.",
      description:
        "Find a language partner, join a weekly conversation circle, and trade lessons in the language you speak for one you're learning.",
      members: 5210,
      tone: 4,
      cover: "languages",
      rules: [
        "Correct gently; fluency is not the same as accuracy.",
        "Label your post with the language you're practising.",
        "No paid tutoring solicitations.",
      ],
      related: ["content-writing", "music-instruments"],
    },
    {
      id: "photography",
      name: "Photography",
      category: "Creative",
      icon: "camera",
      tagline: "Light, composition and honest critique.",
      description:
        "Street, portrait and product photographers sharing frames, settings and feedback. Monthly photo walks organised across member cities.",
      members: 2970,
      tone: 5,
      cover: "photo",
      rules: [
        "Ask permission before photographing people for shares here.",
        "Post settings with critique requests.",
        "No AI-generated images presented as photography.",
      ],
      related: ["ui-ux-design", "music-instruments", "entrepreneurship"],
    },
    {
      id: "culinary-arts",
      name: "Cooking",
      category: "Lifestyle",
      icon: "utensils",
      tagline: "Technique, budgets and weeknight reality.",
      description:
        "Home cooks and chefs trading recipes that work on a Tuesday. Knife-skills threads, pantry challenges and seasonal swap sessions.",
      members: 3420,
      tone: 3,
      cover: "food",
      rules: [
        "Flag allergens in every recipe you post.",
        "Measure by weight where you can.",
        "Be generous with beginners asking 'stupid' questions.",
      ],
      related: ["fitness-wellness", "entrepreneurship"],
    },
    {
      id: "fitness-wellness",
      name: "Fitness & Wellness",
      category: "Lifestyle",
      icon: "dumbbell",
      tagline: "Programmes that survive real life.",
      description:
        "Coaches and enthusiasts comparing programmes, mobility work and recovery. Swap training knowledge for nutrition, physio or even language practice.",
      members: 4110,
      tone: 0,
      cover: "fitness",
      rules: [
        "No medical advice — refer to professionals.",
        "Progress photos require clear consent context.",
        "Fad programmes and supplement sales are removed.",
      ],
      related: ["culinary-arts", "entrepreneurship"],
    },
    {
      id: "entrepreneurship",
      name: "Entrepreneurship",
      category: "Business",
      icon: "briefcase",
      tagline: "Founders comparing notes, honestly.",
      description:
        "Early-stage founders sharing pricing experiments, fundraising drafts and hard lessons. Monthly AMA sessions with operators who've done it before.",
      members: 2240,
      tone: 1,
      cover: "business",
      rules: [
        "Revenue claims need context or they're removed.",
        "No cold DMs to other members.",
        "Feedback requests beat pitch decks.",
      ],
      related: ["data-science", "content-writing", "ui-ux-design"],
    },
    {
      id: "content-writing",
      name: "Content Writing",
      category: "Writing",
      icon: "pen-line",
      tagline: "Editing circles and publication threads.",
      description:
        "Writers editing each other's work line by line — essays, product copy, newsletters. Weekly prompts and a directory of members open to swaps.",
      members: 2530,
      tone: 4,
      cover: "writing",
      rules: [
        "Mark drafts as drafts.",
        "Edit generously; plagiarism ends membership.",
        "One promotion per week, in the pinned thread only.",
      ],
      related: ["ui-ux-design", "entrepreneurship", "languages-culture"],
    },
  ];

  data.communityById = (id) => data.communities.find((c) => c.id === id) || null;

  /** Distinct category pills for the directory filter. */
  data.communityCategories = (() => {
    const set = [];
    data.communities.forEach((c) => { if (!set.includes(c.category)) set.push(c.category); });
    return ["All", ...set];
  })();
})(SL.data);
