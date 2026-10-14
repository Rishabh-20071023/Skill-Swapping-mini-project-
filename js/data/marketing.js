/* =============================================================================
   SkillLoom — Data: landing page content
   Stats, feature grid, AI section copy. Pure presentation data; the numbers
   are placeholders until a real analytics endpoint exists.
   ========================================================================== */

window.SL = window.SL || {};
SL.data = SL.data || {};

(function (data) {
  "use strict";

  data.stats = [
    { id: "skills", label: "Skills listed", value: 12480, suffix: "" },
    { id: "swaps", label: "Swaps completed", value: 38600, suffix: "" },
    { id: "communities", label: "Active communities", value: 140, suffix: "" },
    { id: "members", label: "Members worldwide", value: 9200, suffix: "" },
  ];

  data.features = [
    {
      icon: "swap",
      title: "Smart Skill Matching",
      body: "Tell us what you can teach and what you want to learn. We surface members whose needs and offerings line up, with a match score you can actually inspect.",
    },
    {
      icon: "user",
      title: "Rich User Profiles",
      body: "Skills offered, skills wanted, availability, ratings and badges — one page that explains exactly what you bring to a swap.",
    },
    {
      icon: "message-circle",
      title: "Chat & Scheduling",
      body: "Agree on the details in chat, then book a slot from a shared calendar. Everything about the exchange stays in one thread.",
    },
    {
      icon: "wallet",
      title: "Skill Credit System",
      body: "Teaching earns credits, learning spends them. No money changes hands, and every session keeps the exchange fair for both sides.",
    },
    {
      icon: "star",
      title: "Ratings & Reviews",
      body: "Both sides review after every session. Reputation accumulates visibly, so you know who delivers before you commit.",
    },
    {
      icon: "video",
      title: "Video Call Integration",
      body: "Sessions run in the browser with screen share and a shared whiteboard — no third-party tool to install or pay for.",
    },
    {
      icon: "search",
      title: "Search & Filter",
      body: "Filter by category, level, availability and credit cost. Find the right teacher in seconds instead of scrolling a directory.",
    },
    {
      icon: "users",
      title: "Community Groups",
      body: "Field-based communities for the work you actually do — shared resources, events and peers who answer within the hour.",
    },
    {
      icon: "award",
      title: "Gamified Badges",
      body: "Consistency is recognised: badges for first swap, fifty sessions, mentorship and community contribution.",
    },
  ];

  data.aiFeatures = [
    {
      icon: "target",
      title: "Context-aware matching",
      body:
        "Matching looks beyond skill keywords. It weighs your stated goals, current level, weekly availability and past successful swaps, then explains why each suggestion made the list.",
      points: ["Goal and level alignment", "Availability overlap", "Explanation on every match"],
    },
    {
      icon: "shield",
      title: "Review sentiment & trust",
      body:
        "Reviews are summarised into plain themes — clarity, preparation, reliability — so you can see the pattern behind an average before you book a first session.",
      points: ["Themes pulled from real reviews", "Reliability signals over time", "No black-box scores"],
    },
  ];

  /* ---------- Swap builder (landing page planner) ------------------------------ */
  /* Topic vocabulary for the "I can teach ⇄ I want to learn" planner. Each
     topic carries keyword probes (`keys`) that the placeholder matcher in
     api.matchmaking.findSwap() tests against a listing's teaches/wants text. */
  data.swapTopics = [
    { id: "javascript", label: "JavaScript", category: "Tech", keys: ["javascript", "node", "react", "typescript", "frontend"] },
    { id: "react", label: "React", category: "Tech", keys: ["react", "hooks", "frontend"] },
    { id: "css", label: "CSS & layout", category: "Tech", keys: ["css", "layout", "accessibility"] },
    { id: "node", label: "Node.js & deployment", category: "Tech", keys: ["node", "deployment", "backend"] },
    { id: "python", label: "Python & statistics", category: "Tech", keys: ["python", "statistics", "data"] },
    { id: "ui-ux", label: "UI/UX design", category: "Design", keys: ["design", "ux", "ui ", "portfolio"] },
    { id: "branding", label: "Branding & identity", category: "Design", keys: ["brand", "typography", "identity"] },
    { id: "research", label: "User research", category: "Design", keys: ["research", "interview", "user"] },
    { id: "guitar", label: "Guitar", category: "Music", keys: ["guitar", "chord"] },
    { id: "piano", label: "Piano & theory", category: "Music", keys: ["piano", "theory", "sight", "ear training"] },
    { id: "spanish", label: "Spanish conversation", category: "Languages", keys: ["spanish"] },
    { id: "mandarin", label: "Mandarin", category: "Languages", keys: ["mandarin", "pronunciation"] },
    { id: "english", label: "English & presentations", category: "Languages", keys: ["english", "presentation", "speaking"] },
    { id: "cooking", label: "Cooking & meal prep", category: "Cooking", keys: ["cooking", "meal", "knife", "sauce"] },
    { id: "fitness", label: "Strength & mobility", category: "Fitness", keys: ["strength", "mobility", "training"] },
    { id: "writing", label: "Content writing", category: "Writing", keys: ["writing", "editing", "copy"] },
    { id: "marketing", label: "Growth marketing", category: "Business", keys: ["marketing", "growth", "funnel"] },
    { id: "finance", label: "Financial modelling", category: "Business", keys: ["financial", "fundraising", "modelling"] },
    { id: "photography", label: "Photography", category: "Arts", keys: ["photography", "composition", "lightroom"] },
  ];

  data.howItWorks = [
    { step: "01", title: "List what you teach", body: "Add the skill you're confident sharing and the one you want to learn." },
    { step: "02", title: "Get matched", body: "We suggest members whose offer and request fit yours, with a transparent score." },
    { step: "03", title: "Book a session", body: "Pick a time, meet by video or in person, and keep it all in one thread." },
    { step: "04", title: "Rate and earn", body: "Review each other, settle in credits, and build a reputation that compounds." },
  ];
})(SL.data);
