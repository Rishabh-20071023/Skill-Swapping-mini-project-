/* =============================================================================
   SkillLoom — API facade (placeholder)
   Every call the UI makes to "the backend" goes through SL.api. Today each
   method resolves from local dummy data after a short delay so the UI can
   exercise real loading states; tomorrow each body becomes a fetch().

   To plug in a real backend later:
     1. Replace the body of one method with e.g.
          const res = await fetch('/api/skills?' + params, { credentials:'include' });
          if (!res.ok) throw new Error('Request failed');
          return res.json();
     2. Keep the resolved shapes documented below — the components don't change.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const { sleep } = SL.h;
  const data = SL.data;

  /** Simulated network latency so skeletons and spinners are visible. */
  const latency = (min = 260, max = 560) =>
    sleep(Math.round(min + Math.random() * (max - min)));

  /* ---------- Auth -------------------------------------------------------------- */
  const auth = {
    /** @returns {Promise<{user:{name:string,email:string}}>} */
    async login({ email, password }) {
      await latency(500, 850);
      if (!email || !password) throw new Error("Email and password are required.");
      // BACKEND HOOK: POST /api/auth/login → { user, token }
      const known = SL.store.getProfile();
      const name = known && email.toLowerCase() === String(known.email).toLowerCase()
        ? known.name
        : email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return { user: { name, email } };
    },

    async signup({ name, email, password }) {
      await latency(550, 900);
      // BACKEND HOOK: POST /api/auth/register → { user, token }
      return { user: { name, email } };
    },

    async logout() {
      await latency(150, 300);
      // BACKEND HOOK: POST /api/auth/logout
      return { ok: true };
    },
  };

  /* ---------- Catalogue ----------------------------------------------------------- */
  const catalog = {
    /**
     * Filtered skill listings.
     * @param {{q?:string, category?:string, level?:string, sort?:string}} filters
     * @returns {Promise<Array>} listings (see data/skills.js for the shape)
     */
    async listSkills(filters = {}) {
      await latency();
      // BACKEND HOOK: GET /api/skills?category=&level=&q=&sort=
      const q = (filters.q || "").trim().toLowerCase();
      const cat = filters.category || "all";
      const level = filters.level || "all";
      const sort = filters.sort || "relevance";

      let rows = data.skills.filter((s) => {
        const user = data.userById(s.userId);
        const haystack = [
          s.title, s.teaches, s.wants, s.blurb, s.category, s.level,
          user ? user.name : "", (s.tags || []).join(" "),
        ].join(" ").toLowerCase();
        return (
          (!q || haystack.indexOf(q) !== -1) &&
          (cat === "all" || s.category === cat) &&
          (level === "all" || s.level === level)
        );
      });

      const sorters = {
        relevance: (a, b) => b.postedAt.localeCompare(a.postedAt),
        rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
        "credits-low": (a, b) => a.credits - b.credits,
        "credits-high": (a, b) => b.credits - a.credits,
        newest: (a, b) => b.postedAt.localeCompare(a.postedAt),
      };
      rows = rows.slice().sort(sorters[sort] || sorters.relevance);
      return rows;
    },

    /** @returns {Promise<Array>} community records with joined flags resolved */
    async listCommunities({ q = "", category = "All" } = {}) {
      await latency(220, 460);
      // BACKEND HOOK: GET /api/communities?q=&category=
      const term = q.trim().toLowerCase();
      return data.communities.filter((c) => {
        const haystack = [c.name, c.category, c.tagline, c.description].join(" ").toLowerCase();
        return (
          (category === "All" || c.category === category) &&
          (!term || haystack.indexOf(term) !== -1)
        );
      });
    },
  };

  /* ---------- Social -------------------------------------------------------------- */
  const social = {
    /** BACKEND HOOK: POST /api/posts */
    async createPost(payload) {
      await latency(350, 650);
      return Object.assign({ id: SL.h.uid("p"), createdAt: new Date().toISOString(), likes: 0, liked: false, shares: 0, comments: [] }, payload);
    },

    /** BACKEND HOOK: POST /api/resources */
    async addResource(payload) {
      await latency(300, 600);
      return Object.assign({ id: SL.h.uid("r"), createdAt: new Date().toISOString(), saves: 0 }, payload);
    },

    /** BACKEND HOOK: POST /api/events/:id/rsvp */
    async rsvp(eventId, attending) {
      await latency(240, 480);
      return { eventId, attending };
    },
  };

  /* ---------- Sessions & money ------------------------------------------------------ */
  const bookings = {
    /** BACKEND HOOK: POST /api/sessions */
    async book(payload) {
      await latency(500, 900);
      return Object.assign({ id: SL.h.uid("sl"), status: "confirmed" }, payload);
    },

    /** BACKEND HOOK: GET /api/wallet */
    async wallet() {
      await latency();
      return {
        transactions: data.transactions,
        series: data.walletSeries,
        summary: data.walletSummary,
      };
    },
  };

  /* ---------- Messaging -------------------------------------------------------------- */
  const messages = {
    /** BACKEND HOOK: POST /api/messages (or a WebSocket send) */
    async send(payload) {
      await latency(180, 360);
      return Object.assign({ id: SL.h.uid("m"), at: new Date().toISOString() }, payload);
    },

    /** Simulated partner reply — a backend would push this instead. */
    async reply() {
      await latency(1400, 2600);
      const pool = (SL.data && SL.data.cannedReplies) || ["Thank you!"];
      return pool[Math.floor(Math.random() * pool.length)];
    },
  };

  /* ---------- Matchmaking -------------------------------------------------------- */
  const matchmaking = {
    /**
     * Rank listings for a "I teach X ⇄ I want to learn Y" plan.
     * A listing scores on two axes: it teaches what you want to learn, and it
     * wants what you can teach. Listings satisfying both are a direct barter.
     *
     * BACKEND HOOK: POST /api/matchmaking/plan { teachId, learnId }
     *               → [{ skillId, score, reasons[] }] — same resolved shape.
     *
     * @param {{teachId: string, learnId: string}} plan topic ids from data.swapTopics
     * @returns {Promise<Array<{skill: object, score: number, reasons: string[], direct: boolean}>>}
     */
    async plan({ teachId, learnId }) {
      await latency(450, 850);
      const topics = data.swapTopics || [];
      const teach = topics.find((t) => t.id === teachId);
      const learn = topics.find((t) => t.id === learnId);
      if (!teach || !learn) return [];

      const hits = (text, keys) => keys.some((k) => text.indexOf(k) !== -1);

      const scored = data.skills
        .map((s) => {
          // "Teaches" side: their offer text + title + tags (descriptive).
          const teachesText = (s.teaches + " " + s.title + " " + (s.tags || []).join(" ")).toLowerCase();
          // "Wants" side: only the stated want — a title mentioning the topic
          // says nothing about what they're asking for.
          const wantsText = s.wants.toLowerCase();
          const teachesYouWant = hits(teachesText, learn.keys);   // they teach your goal
          const wantsYouCanTeach = hits(wantsText, teach.keys);   // they want your skill

          if (!teachesYouWant && !wantsYouCanTeach) return null;

          const reasons = [];
          if (teachesYouWant) reasons.push(`Teaches ${learn.label}`);
          if (wantsYouCanTeach) reasons.push(`Wants ${teach.label}`);
          // Base 62 for one-sided, 94 for a direct barter; rating nudges a few points.
          const score = Math.min(99, (teachesYouWant && wantsYouCanTeach ? 94 : 62) + Math.round((s.rating - 4.5) * 8));

          return { skill: s, score, reasons, direct: teachesYouWant && wantsYouCanTeach };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score || b.skill.rating - a.skill.rating);

      return scored.slice(0, 4);
    },
  };

  /* ---------- Reputation ------------------------------------------------------------ */
  const reviews = {
    /** BACKEND HOOK: POST /api/reviews */
    async create(payload) {
      await latency(400, 700);
      return Object.assign({ id: SL.h.uid("rv"), createdAt: new Date().toISOString(), helpful: 0 }, payload);
    },
  };

  SL.api = { latency, auth, catalog, matchmaking, social, bookings, messages, reviews };
})(window.SL);
