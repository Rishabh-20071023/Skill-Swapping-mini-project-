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

  /* ===========================================================================
     Landing page content — stories, skill tabs, workshops, glossary, guides,
     credit tiers, community copy and milestones.
     Everything below is editorial placeholder copy: a backend would serve these
     from GET /api/content/landing (stories, workshops) and
     GET /api/credits/tiers, keeping the same shapes.
     ========================================================================= */

  /* ---------- Hero quote carousel ------------------------------------------- */
  data.quotes = [
    { text: "I traded six weeks of guitar lessons for a portfolio review. Both of us walked away with more than we arrived with.", who: "Sofia Almeida", role: "Designer & guitarist" },
    { text: "The best way to find out whether you understand something is to teach it to someone who wants to learn it.", who: "Daniel Okafor", role: "Statistics tutor" },
    { text: "No invoices, no hourly rates. I earn credits teaching Python and spend them on cooking classes.", who: "Mei-Ling Chen", role: "Backend engineer" },
    { text: "My first swap was terrifying for about ten minutes. Then it turned into the best hour of my week.", who: "Tomás Rivera", role: "Chef" },
    { text: "A community that answers within the hour beats a course that answers within a week.", who: "Amara Singh", role: "Community host" },
  ];

  /** Phrases for the looping ticker under the hero. */
  data.marquee = [
    "Learn",
    "Teach",
    "Trade",
    "Share a skill",
    "Earn credits",
    "Join a community",
  ];

  /* ---------- Stories (editorial cards) ------------------------------------- */
  data.stories = [
    {
      id: "coder-guitarist",
      category: "Cross-skill",
      readMin: 3,
      title: "A coder and a guitarist swapped hours for a season",
      excerpt:
        "One taught chord changes by video; the other explained debugging by screen share. Neither spent a rupee, and both kept the habit.",
    },
    {
      id: "credit-economy",
      category: "Credits",
      readMin: 4,
      title: "Why we priced every skill at one credit per hour",
      excerpt:
        "Flat pricing removes the haggling and the hierarchy. A pastry chef's Saturday morning is worth a staff engineer's Wednesday night.",
    },
    {
      id: "community-first",
      category: "Community",
      readMin: 5,
      title: "The study group that became a hiring pipeline",
      excerpt:
        "A languages community started with twelve members trading conversation practice. Two years on, they run interviews for each other.",
    },
  ];

  /* ---------- Skills section tabs ------------------------------------------- */
  /* Each tab lists four skills in priority order with a plain availability line;
     `skillIds` would come from GET /api/skills?category=… once the API exists. */
  data.skillTabs = [
    {
      id: "tech",
      label: "Tech",
      intro: "Ship something this week — with someone reading over your shoulder.",
      items: [
        { title: "JavaScript foundations", availability: "Evenings · 2 slots this week", body: "Scope, closures and the event loop, taught through small working demos rather than slides." },
        { title: "React & component thinking", availability: "Weekends · 1 slot this month", body: "State, effects and the mistakes everyone makes first. Bring a component you already struggle with." },
        { title: "Python for data work", availability: "Weekday mornings · 3 slots", body: "Pandas, plotting and the three statistics ideas that make dashboards honest." },
        { title: "Accessibility audits", availability: "Flexible · requests open", body: "Keyboard paths, focus order and contrast — a practical pass over a page you own." },
      ],
    },
    {
      id: "creative",
      label: "Creative",
      intro: "Craft is learned by making things next to someone who has made more of them.",
      items: [
        { title: "Design systems in Figma", availability: "Tuesdays · 2 slots", body: "Tokens, variants and a component library that survives contact with engineering." },
        { title: "Portfolio critique", availability: "Weekly · 4 slots", body: "A blunt, kind read of three projects, plus the story you tell around each one." },
        { title: "Photography: manual mode", availability: "Golden hour · Saturdays", body: "Aperture, shutter and light, practiced on a walk with one camera and no menus." },
        { title: "Songwriting & structure", availability: "Sunday afternoons", body: "Verse, chorus and the bridge that earns its place. Bring four lines you can't finish." },
      ],
    },
    {
      id: "languages",
      label: "Languages",
      intro: "Conversation first. Grammar arrives when you need it.",
      items: [
        { title: "Spanish conversation", availability: "Daily · 5 slots", body: "Forty minutes of speaking, twenty of correction, zero worksheets." },
        { title: "Mandarin pronunciation", availability: "Weekday evenings", body: "Tones drilled through short dialogues, with recordings you keep." },
        { title: "English for presentations", availability: "Monthly · 3 slots", body: "Rehearse a real talk, then cut a third of the words without losing the point." },
        { title: "Japanese reading", availability: "Sundays · requests open", body: "Kana to short articles, using material you actually want to read." },
      ],
    },
  ];

  /* ---------- Workshops (Voyager's "this season" list) ------------------------ */
  data.workshops = [
    { date: "Nov 12", title: "Portfolio night: three reviews, one hour", host: "Elena Rossi", body: "Bring one project. Leave with a written critique and two next steps." },
    { date: "Nov 19", title: "Credit literacy: pricing your first swap", host: "Daniel Okafor", body: "How credits are earned, spent and kept fair when the levels differ." },
    { date: "Dec 03", title: "Open mic for language learners", host: "Grace Kim", body: "Five-minute conversations across four languages, rotating every round." },
  ];

  /* ---------- SkillLoom 101 flip cards --------------------------------------- */
  data.glossary = [
    { term: "Skill credit", definition: "The platform's only currency. One hour of teaching earns one credit; one hour of learning spends one." },
    { term: "Swap", definition: "A two-way exchange: you teach something, you learn something. Direct swaps settle without credits changing hands." },
    { term: "Match score", definition: "A percentage showing how well two members' offers, goals and availability line up — with the reasons listed." },
    { term: "Streak", definition: "Consecutive weeks with at least one session, teaching or learning. It resets quietly; nothing is taken away." },
    { term: "Badge", definition: "A small record of consistency — first swap, fifty sessions, mentorship, community contribution." },
    { term: "Session", definition: "One booked meeting, usually an hour, in person or by video. Both sides review afterwards." },
  ];

  /* ---------- Guides (numbered accordions) ----------------------------------- */
  data.guides = [
    {
      title: "Your first swap",
      tips: [
        "Pick a skill you can teach at a beginner's level without preparing a deck.",
        "Write one sentence about who the session is for — clarity beats credentials.",
        "Offer two time windows instead of asking when they are free.",
        "End the session by agreeing what the next hour would cover.",
      ],
    },
    {
      title: "Pricing your skill in credits",
      tips: [
        "Start at the standard rate: one hour taught equals one credit.",
        "Raise it only when you bring preparation — materials, recordings, follow-up notes.",
        "Keep the first session flat-rate; negotiate the repeat visits.",
        "Never price below one credit; free sessions train people to undervalue the exchange.",
      ],
    },
    {
      title: "Running a great session",
      tips: [
        "Open with the learner's goal in their words, then agree on one outcome.",
        "Work on something real for at least half the time — no pure lecture.",
        "Leave five minutes for the learner to explain the idea back to you.",
        "Send one paragraph of notes within a day; it is the cheapest reputation you can build.",
      ],
    },
  ];

  /* ---------- Credit system: how it works + tiers ----------------------------- */
  data.creditFlow = [
    { title: "Earn by teaching", body: "Every hour you teach adds one credit to your wallet. Preparation adds up to half a credit more." },
    { title: "Spend by learning", body: "Every hour you learn costs one credit. Direct swaps settle both sides at once, so nothing leaves the wallet." },
    { title: "Community rewards", body: "Hosting workshops, answering questions and mentoring earn bonus credits — the platform pays for generosity." },
  ];

  data.creditTiers = [
    {
      id: "starter",
      name: "Starter",
      range: "0 – 99 credits",
      at: 0,
      blurb: "Everything you need to make a first fair trade.",
      perks: ["Book and host sessions", "Community access", "Standard match score"],
    },
    {
      id: "weaver",
      name: "Weaver",
      range: "100 – 499 credits",
      at: 100,
      blurb: "For members who keep the loom moving.",
      perks: ["Priority match suggestions", "Workshop hosting tools", "+10% teaching credits"],
    },
    {
      id: "master",
      name: "Master",
      range: "500+ credits",
      at: 500,
      blurb: "Trusted hands: you set the pace for a field.",
      perks: ["Mentor badge and listing", "Community spotlight", "+20% teaching credits"],
    },
  ];

  /* ---------- Community section --------------------------------------------- */
  data.communityBenefits = [
    { title: "Peer feedback", body: "Post work in progress; get a straight answer from people doing the same job." },
    { title: "Shared resources", body: "Reading lists, templates and recordings kept in one place per field." },
    { title: "Local meetups", body: "Monthly in-person sessions wherever enough members live near each other." },
  ];

  /* ---------- About ---------------------------------------------------------- */
  data.about = {
    story:
      "SkillLoom started with a spreadsheet. Six friends traded guitar lessons, tax help and cover-letter edits, and the spreadsheet kept track of who owed whom. It worked because nobody was selling anything — they were just keeping the ledger fair. That spreadsheet is now this platform.",
    values: [
      { title: "Learn", body: "Curiosity is the entry ticket. Every member is a beginner at something." },
      { title: "Teach", body: "You already know enough to save someone a week of guessing." },
      { title: "Trade", body: "Fair exchange, flat rates, no cash — the ledger stays honest." },
    ],
    milestones: [
      { date: "2022", title: "A spreadsheet and six friends", body: "The first thirty swaps happened over one shared sheet and a group chat." },
      { date: "2024", title: "Credits and communities", body: "The ledger became skill credits; field communities opened with 140 groups." },
      { date: "2026", title: "9,200 members, still no cash", body: "Sessions in 34 countries, and the same rule as day one: teaching buys learning." },
    ],
  };
})(SL.data);
