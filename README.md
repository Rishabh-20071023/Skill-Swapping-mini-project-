# SkillLoom

**Learn. Teach. Trade.**

SkillLoom is a peer-to-peer platform where skills are the currency — no money involved. Know how to code? Trade it for guitar lessons. Good at cooking? Swap it for a language partner. Everyone teaches something, everyone learns something.

> "The future of learning is not solo. It's shared."

## What it does

- **Smart matching** — suggests members based on what you want to learn, what you can teach, and when you're free
- **Profiles** — list what you offer and what you're looking for
- **Chat & scheduling** — message and book sessions without leaving the app
- **Skill credits** — earn credits by teaching, spend them to learn
- **Ratings & reviews** — reputation that's actually earned
- **Search & filters** — find people by skill, level, category or credit cost
- **Communities** — field-based groups with feeds, resources, events and member directories
- **Badges** — small rewards for consistency and contribution

There's also an **AI layer in the UI copy** (presentation only, no models): smarter matching that reads context, goals and availability, plus review-sentiment themes to surface teachers people genuinely trust.

## How to run it

The site is plain HTML, Tailwind (via CDN) and vanilla JavaScript — there is no build step.

```bash
# Option A — zero-dependency dev server (recommended)
node serve.js            # → http://localhost:4173
node serve.js 8080       # → http://localhost:8080

# Option B — any static server
npx serve .
python3 -m http.server 4173

# Option C — just open it
open index.html          # works from file:// as well
```

Then walk the demo end to end: **Home → Sign up (use "Use demo credentials") → Dashboard → Browse skills → Request a swap → Schedule a session → Credit wallet → Community → post in a feed (+5 credits) → Chat → Reviews**.

Everything is front-end only:

- No backend, no API calls, no database.
- `localStorage` persists only what the product promises: fake login state, theme choice and joined communities (plus demo credits/bookings so the prototype feels continuous).
- All interactions (login, booking, posting, RSVP, reviews) are placeholder functions with simulated latency.

## Folder structure

```
index.html            Landing page (3D hero, stats, swap planner, features, AI, community, CTA)
login.html            Log in / sign up (tabbed, validated)
dashboard.html        Member dashboard (balance, sessions, matches, badges)
browse.html           Skill marketplace with search, filters and sorting
profile.html          Member profile (?id=u1 to view another member)
chat.html             Two-pane messenger (list + thread, mobile single-screen)
schedule.html         Weekly slot picker, booking form, confirmation modal
wallet.html           Credit balance, SVG trend chart, transaction history
reviews.html          Rating breakdown, received/given reviews, leave-a-review modal
community.html        Community directory — and detail view via ?id=web-development
404.html              Custom not-found page (served by serve.js)
serve.js              Zero-dependency local dev server

css/
  styles.css          Design tokens (Fresh Sky palette + dark navy), component
                      classes, and every CSS animation incl. the 3D hero scene

js/
  config/tailwind.js  Tailwind config mapped onto the CSS design tokens
  data/               ALL dummy data lives here (nothing else hard-codes content)
    users.js  skills.js  communities.js  social.js  marketing.js
    dashboard.js  wallet.js  reviews.js  chat.js
  services/
    store.js          The only file that touches localStorage
    api.js            Async placeholder functions — the backend plug-in point
  components/
    navbar.js footer.js ui.js toast.js modal.js rating.js cards.js
  pages/
    home.js auth.js dashboard.js browse.js profile.js chat.js
    schedule.js wallet.js reviews.js community.js notfound.js
  utils/
    helpers.js icons.js animations.js
```

Design notes: **Plus Jakarta Sans** (600–800) for headings and **Inter** (400–600) for body/UI — nothing else. Primary `#0EA5E9`, dark navy `#0C4A6E`, page `#F0F9FF`, cards white, indigo `#6366F1` used sparingly; dark mode runs on `#082F49`/`#0C4A6E`. The layout is responsive down to mobile (hamburger menu, single-screen chat), keyboard accessible (Esc closes modals/menus, focus rings, ARIA roles) and honours `prefers-reduced-motion`.

## Where to plug in a backend later

The UI never touches storage or network directly, so the swap is contained:

1. **API** — every "server" call goes through `js/services/api.js`. Replace method bodies with `fetch()` while keeping the resolved shapes documented in that file:
   - `api.auth.login / signup / logout` → session cookie or token
   - `api.catalog.listSkills / listCommunities` → `GET /api/…` with the same filters
   - `api.social.createPost / addResource / rsvp`
   - `api.bookings.book`, `api.messages.send / reply`, `api.reviews.create`
   Loading states, skeletons and error handling already exist around these calls.
2. **Persistence** — `js/services/store.js` is the single localStorage wrapper (`get/set` + typed accessors for theme, auth, joined communities, credits, bookings). Re-point it at an API-backed cache without touching a page.
3. **Data** — `js/data/*` holds fixture data with the exact shapes the components expect. Point them at server responses (or replace with generated fixtures) and nothing in the UI changes.
4. **Auth guard** — `dashboard.html` already redirects through `login.html?next=…`; move the check into a real session lookup inside `store.isAuthenticated()`.

## Team

- Ayush Kumar
- Samir Kumar Mishra
- Rishabh Kumar Sharma

---

Got questions or want to collaborate? Reach out — we'd love to hear from you.
