/* =============================================================================
   SkillLoom — Landing page controller
   Fills the editorial sections of index.html (hero quotes, stories, skills
   tabs, workshops, learn, credits, community, about) and keeps the existing
   swap planner working exactly as before.

   Section markup comes from js/components/sections.js so the same patterns can
   be reused on app pages. Data comes from js/data/marketing.js — the comment on
   each block names the endpoint a backend would serve it from.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, formatNumber } = SL.h;
  const S = SL.sections;

  /* ---------- Hero: letter-by-letter headline --------------------------------- */
  /**
   * Wraps each character in a span with a small stagger. The CSS animation runs
   * once; with prefers-reduced-motion the global rule collapses it to instant.
   *
   * Letters are grouped into words: an inline-block per character would let the
   * browser break a line between any two letters ("Tra / de."), so each word is
   * wrapped in a no-wrap .hero-word and lines can only break at real spaces.
   */
  function initHeroLetters() {
    const h1 = document.getElementById("hero-title");
    if (!h1 || h1.dataset.lettersReady) return;
    h1.dataset.lettersReady = "1";

    const text = h1.textContent.replace(/\s+/g, " ").trim();
    let delay = 0;

    h1.innerHTML = text
      .split(" ")
      .map((word) => {
        const letters = word
          .split("")
          .map((ch) => {
            const html = `<span class="hero-letter" aria-hidden="true" style="animation-delay:${delay}ms">${esc(ch)}</span>`;
            delay += 34;
            return html;
          })
          .join("");
        return `<span class="hero-word">${letters}</span>`;
      })
      // A plain space (not a fixed-width span) so a line break never leaves an
      // indent at the start of the next line.
      .join(" ");

    // Keep the real sentence available to screen readers and search engines.
    h1.setAttribute("aria-label", text);
  }

  /* ---------- Hero: quote carousel -------------------------------------------- */
  function renderQuotes() {
    const host = document.getElementById("hero-quotes");
    if (!host) return;
    host.innerHTML = S.quoteCarousel(SL.data.quotes || []);
  }

  /* ---------- Hero: social proof ---------------------------------------------- */
  function renderProof() {
    const host = document.getElementById("hero-proof");
    if (!host) return;
    const faces = ["u1", "u2", "u4", "u9"].map((id) => SL.data.userById(id)).filter(Boolean);
    host.innerHTML = `
      <div class="flex -space-x-2.5" aria-hidden="true">
        ${faces.map((u) => SL.ui.avatar(u, "sm", { className: "ring-2 ring-page" })).join("")}
      </div>
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          ${SL.rating.display(5, "w-4 h-4")}
          <span class="text-sm font-semibold text-heading">${SL.data.ratingAverage.average}/5</span>
        </div>
        <p class="text-xs text-muted mt-0.5">Trusted by ${formatNumber(9200)} members worldwide</p>
      </div>`;
  }

  /* ---------- Marquee --------------------------------------------------------- */
  function renderMarquee() {
    const host = document.getElementById("marquee-host");
    if (host) host.innerHTML = S.marquee(SL.data.marquee || []);
  }

  /* ---------- Stats strip ----------------------------------------------------- */
  function renderStats() {
    const host = document.getElementById("stats-grid");
    if (!host) return;
    host.innerHTML = SL.data.stats
      .map(
        (s) => `
        <div class="text-center lg:text-left lg:border-l lg:border-line lg:first:border-l-0 lg:pl-6 first:pl-0" data-reveal>
          <p class="stat-number text-3xl sm:text-4xl" data-count="${s.value}" data-count-suffix="${esc(s.suffix || "")}">0</p>
          <p class="mt-1.5 text-sm text-muted">${esc(s.label)}</p>
        </div>`
      )
      .join("");
  }

  /* ---------- Stories --------------------------------------------------------- */
  function renderStories() {
    const head = document.getElementById("stories-head");
    const grid = document.getElementById("stories-grid");
    if (!head || !grid) return;
    head.innerHTML = S.sectionHeader({
      id: "stories-title",
      eyebrow: "Stories",
      title: "Skills in motion",
      intro: "Three exchanges, written up plainly: what was taught, what was learned, what stuck.",
    });
    grid.innerHTML = (SL.data.stories || []).map(S.storyCard).join("");
  }

  /* ---------- Skills: tabs, workshops, matching notes -------------------------- */
  function renderSkills() {
    const head = document.getElementById("skills-head");
    const tabsHost = document.getElementById("skills-tabs");
    if (!head || !tabsHost) return;

    head.innerHTML = S.sectionHeader({
      id: "skills-title",
      eyebrow: "Skills",
      title: "What will you learn today?",
      intro: "Four featured skills per field, each taught by a member who has done the work — swap in credits, not cash.",
    });

    const tabs = (SL.data.skillTabs || []).map((tab) => ({
      id: tab.id,
      label: tab.label,
      panel: `
        <p class="text-sm text-muted mt-4 max-w-xl">${esc(tab.intro)}</p>
        <ol class="num-list mt-6">
          ${tab.items
            .map((item, i) =>
              S.listRow({
                n: String(i + 1).padStart(2, "0"),
                title: esc(item.title),
                meta: item.availability,
                body: item.body,
                action: `<button type="button" class="btn btn-outline btn-sm" data-skill-request="${esc(item.title)}">
                  Request swap
                </button>`,
                delay: i * 60,
              })
            )
            .join("")}
        </ol>`,
    }));

    tabsHost.innerHTML = S.tabs({
      id: "skills",
      label: "Skill categories",
      tabs,
    });

    renderWorkshops();
    renderMatchingNotes();
  }

  function renderWorkshops() {
    const host = document.getElementById("workshops-list");
    if (!host) return;
    // Backend: GET /api/workshops?month=current
    host.innerHTML = (SL.data.workshops || [])
      .map((w, i) =>
        S.listRow({
          n: String(i + 1).padStart(2, "0"),
          title: esc(w.title),
          meta: `${w.date} · ${w.host}`,
          body: w.body,
          action: `<button type="button" class="btn btn-outline btn-sm" data-rsvp="${esc(w.title)}">RSVP</button>`,
          delay: i * 70,
        })
      )
      .join("");
  }

  /** Existing AI copy, rendered as the numbered transparency list. */
  function renderMatchingNotes() {
    const host = document.getElementById("matching-notes");
    if (!host) return;
    host.innerHTML = (SL.data.aiFeatures || [])
      .map((f, i) =>
        S.listRow({
          n: String(i + 1).padStart(2, "0"),
          title: esc(f.title),
          meta: (f.points || []).slice(0, 2).join(" · "),
          body: f.body,
        })
      )
      .join("");
  }

  /* ---------- Learn: flip cards + guides --------------------------------------- */
  function renderLearn() {
    const head = document.getElementById("learn-head");
    const grid = document.getElementById("glossary-grid");
    const guides = document.getElementById("guides-host");
    if (!head || !grid || !guides) return;

    head.innerHTML = S.sectionHeader({
      id: "learn-title",
      eyebrow: "Learn",
      title: "SkillLoom 101",
      intro: "Six terms, one line each. Flip a card to see how the exchange actually works.",
    });

    grid.innerHTML = (SL.data.glossary || []).map(S.flipCard).join("");

    guides.innerHTML = S.accordion({
      id: "guides",
      items: SL.data.guides || [],
    });

    // The four-step explainer from the original landing page, in the numbered
    // row style (data.howItWorks is unchanged).
    const steps = document.getElementById("swap-steps");
    if (steps) {
      steps.innerHTML = (SL.data.howItWorks || [])
        .map((s, i) =>
          S.listRow({ n: String(i + 1).padStart(2, "0"), title: esc(s.title), body: s.body, delay: i * 60 })
        )
        .join("");
    }
  }

  /* ---------- Credits ---------------------------------------------------------- */
  function renderCredits() {
    const head = document.getElementById("credits-head");
    const flow = document.getElementById("credit-flow");
    const tiers = document.getElementById("tier-grid");
    if (!head || !flow || !tiers) return;

    head.innerHTML = S.sectionHeader({
      id: "credits-title",
      eyebrow: "Credits",
      title: "No money. Only credits.",
      intro: "One hour taught earns one credit; one hour learned spends one. Everything else is bookkeeping.",
    });

    flow.innerHTML = (SL.data.creditFlow || [])
      .map((f, i) =>
        S.listRow({
          n: String(i + 1).padStart(2, "0"),
          title: esc(f.title),
          body: f.body,
          delay: i * 70,
        })
      )
      .join("");

    const credits = SL.store.getCredits();
    const tiersData = SL.data.creditTiers || [];
    const current = tiersData.filter((t) => credits >= t.at).pop() || tiersData[0];
    const next = tiersData.find((t) => t.at > credits) || null;

    tiers.innerHTML = tiersData
      .map((t, i) => S.tierCard(t, i, current && t.id === current.id))
      .join("");

    // Credit meter — the bar is filled by motion.initProgressBars via data-value.
    const balanceEl = document.getElementById("credit-balance");
    const fillEl = document.getElementById("credit-fill");
    const nextEl = document.getElementById("credit-next");
    const tierEl = document.getElementById("credit-tier");
    const meterEl = document.getElementById("credit-meter");

    if (balanceEl) balanceEl.textContent = formatNumber(credits);
    const pct = next
      ? Math.max(4, Math.min(100, Math.round(((credits - current.at) / (next.at - current.at)) * 100)))
      : 100;
    if (fillEl) {
      // data-value keeps the shared progress-bar helper in sync; the direct
      // width below means the meter animates even before it is scrolled into
      // view (the wallet page reuses the same pattern on scroll).
      fillEl.dataset.value = String(pct);
      requestAnimationFrame(() => {
        fillEl.style.width = `${pct}%`;
      });
    }
    if (nextEl) nextEl.innerHTML = next ? `${formatNumber(next.at - credits)} to <strong>${esc(next.name)}</strong>` : "Top tier reached";
    if (tierEl) tierEl.innerHTML = `<strong>${esc(current ? current.name : "Starter")}</strong>`;
    if (meterEl) {
      meterEl.setAttribute(
        "aria-label",
        next
          ? `${credits} credits: ${pct}% of the way from ${current.name} to ${next.name}`
          : `${credits} credits: top tier reached`
      );
    }
  }

  /* ---------- Community --------------------------------------------------------- */
  function renderCommunity() {
    const head = document.getElementById("community-head");
    const grid = document.getElementById("community-grid");
    const benefits = document.getElementById("community-benefits");
    if (!head || !grid || !benefits) return;

    head.innerHTML = S.sectionHeader({
      id: "community-title",
      eyebrow: "Community",
      title: "Join your field's community",
      intro: "Field groups for the work you actually do — resources, events and people who answer the same day.",
    });

    const featured = ["web-development", "ui-ux-design", "music-instruments", "languages-culture"]
      .map((id) => SL.data.communityById(id))
      .filter(Boolean);

    grid.innerHTML = featured
      .map((c, i) => {
        const joined = SL.store.isJoined(c.id);
        return `
        <article class="card p-5 flex flex-col gap-3" data-reveal data-reveal-delay="${i * 70}">
          <div class="flex items-start justify-between gap-3">
            ${SL.ui.iconTile(c.icon, c.tone, "w-10 h-10 rounded-soft")}
            <span class="text-xs text-muted flex items-center gap-1.5">${SL.icon("users", "w-4 h-4")} ${formatNumber(c.members + (joined ? 1 : 0))}</span>
          </div>
          <h3 class="font-heading font-bold text-heading text-base leading-snug">
            <a href="community.html?id=${esc(c.id)}" class="hover:text-link transition-colors">${esc(c.name)}</a>
          </h3>
          <p class="text-sm text-muted leading-body line-clamp-2">${esc(c.tagline)}</p>
          <button type="button" class="btn ${joined ? "btn-ghost" : "btn-outline"} btn-sm mt-auto w-full" data-join-community="${esc(c.id)}" aria-pressed="${joined}">
            ${joined ? SL.icon("check", "w-4 h-4") + " Joined" : "Join"}
          </button>
        </article>`;
      })
      .join("");

    benefits.innerHTML = (SL.data.communityBenefits || [])
      .map((b, i) =>
        S.listRow({
          n: String(i + 1).padStart(2, "0"),
          title: esc(b.title),
          body: b.body,
          delay: i * 70,
        })
      )
      .join("");
  }

  /* ---------- About -------------------------------------------------------------- */
  function renderAbout() {
    const head = document.getElementById("about-head");
    const story = document.getElementById("about-story");
    const values = document.getElementById("about-values");
    const timeline = document.getElementById("about-timeline");
    if (!head || !story || !values || !timeline) return;

    head.innerHTML = S.sectionHeader({
      id: "about-title",
      eyebrow: "About us",
      title: "Still learning",
      intro: "A ledger, a group chat, and a rule that has not changed since day one.",
    });

    const about = SL.data.about || { story: "", values: [], milestones: [] };
    story.textContent = about.story;

    values.innerHTML = about.values
      .map((v, i) =>
        S.listRow({
          n: String(i + 1).padStart(2, "0"),
          title: esc(v.title),
          body: v.body,
          delay: i * 70,
        })
      )
      .join("");

    timeline.innerHTML = about.milestones
      .map(
        (m) => `<li class="tl-item">
          <span class="tl-date">${esc(m.date)}</span>
          <p class="tl-title">${esc(m.title)}</p>
          <p class="tl-body">${esc(m.body)}</p>
        </li>`
      )
      .join("");
  }

  /* =============================================================================
     Swap planner (existing functionality, unchanged flow)
     ========================================================================== */

  /* #swap-teach / #swap-learn drive the planner and the orb chips in the hero. */
  const getTeach = () => document.getElementById("swap-teach").value;
  const getLearn = () => document.getElementById("swap-learn").value;

  function setSelections(teachId, learnId) {
    const teach = document.getElementById("swap-teach");
    const learn = document.getElementById("swap-learn");
    if (teach) teach.value = teachId;
    if (learn) learn.value = learnId;
    syncHeroChips();
  }

  /** Category icon shown on each floating orb chip. */
  function categoryIcon(label) {
    const cat = (SL.data.categories || []).find((c) => c.label === label);
    return cat ? cat.icon : "sparkles";
  }

  /** Echo the current picks onto the two chips in the 3D scene. */
  function syncHeroChips() {
    const topics = SL.data.swapTopics || [];
    const teach = topics.find((t) => t.id === getTeach());
    const learn = topics.find((t) => t.id === getLearn());

    const chipA = document.getElementById("hero-chip-text-a");
    const chipB = document.getElementById("hero-chip-text-b");
    const iconA = document.getElementById("hero-chip-icon-a");
    const iconB = document.getElementById("hero-chip-icon-b");

    if (chipA && teach) chipA.textContent = teach.label;
    if (chipB && learn) chipB.textContent = learn.label;
    if (iconA) iconA.innerHTML = SL.icon(teach ? categoryIcon(teach.category) : "code", "w-3.5 h-3.5");
    if (iconB) iconB.innerHTML = SL.icon(learn ? categoryIcon(learn.category) : "music", "w-3.5 h-3.5");
  }

  /** Short human line under the planner once a plan resolves. */
  function setSwapHint(count) {
    const hint = document.getElementById("swap-hint");
    if (!hint || count === undefined) return;
    const teach = (SL.data.swapTopics || []).find((t) => t.id === getTeach());
    const learn = (SL.data.swapTopics || []).find((t) => t.id === getLearn());
    if (!teach || !learn) return;
    hint.innerHTML =
      count > 0
        ? `${count} member${count === 1 ? "" : "s"} teach ${esc(learn.label)} and want ${esc(teach.label)}.`
        : `No exact matches for ${esc(teach.label)} ⇄ ${esc(learn.label)} yet — try another pair.`;
  }

  /** Populate the planner selects from data.swapTopics, grouped by category. */
  function renderSwapSelects() {
    const targets = ["swap-teach", "swap-learn"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!targets.length) return;

    const topics = SL.data.swapTopics || [];
    const byCategory = topics.reduce((acc, t) => {
      (acc[t.category] = acc[t.category] || []).push(t);
      return acc;
    }, {});

    const placeholder = '<option value="">Choose a skill…</option>';
    const groups = Object.keys(byCategory)
      .map(
        (cat) =>
          `<optgroup label="${esc(cat)}">` +
          byCategory[cat].map((t) => `<option value="${esc(t.id)}">${esc(t.label)}</option>`).join("") +
          `</optgroup>`
      )
      .join("");

    targets.forEach((sel) => {
      sel.innerHTML = placeholder + groups;
    });

    // Sensible demo defaults: the platform's canonical example (trade guitar
    // lessons for coding lessons) — and it lands on a direct barter.
    setSelections("guitar", "javascript");
  }

  function setSwapError(msg) {
    const el = document.getElementById("swap-error");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-visible", Boolean(msg));
  }

  /** Compact match row rendered inside #swap-results. */
  function swapMatchRow(m, i) {
    const s = m.skill;
    const user = SL.data.userById(s.userId) || { name: "Member", tone: 0 };
    return `
      <li class="rounded-soft border border-line bg-surface p-4 flex flex-col sm:flex-row sm:items-center gap-4 fade-up" style="animation-delay:${i * 70}ms">
        <a href="profile.html?id=${esc(s.userId)}" class="flex items-center gap-3 min-w-0 flex-1 group">
          ${SL.ui.avatar(user, "md", { presence: true })}
          <span class="min-w-0">
            <span class="flex items-center gap-2">
              <span class="text-sm font-semibold text-heading truncate group-hover:text-link transition-colors">${esc(user.name)}</span>
              ${m.direct ? SL.ui.badge("Direct barter", "success", "check") : ""}
            </span>
            <span class="block text-xs text-muted truncate">${esc(s.teaches)} → wants ${esc(s.wants)}</span>
            <span class="flex flex-wrap gap-1.5 mt-1.5">
              ${m.reasons.map((r) => SL.ui.tag(r)).join("")}
            </span>
          </span>
        </a>
        <span class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span class="flex items-center gap-2">
            <span class="badge badge-accent">${m.score}% match</span>
            <span class="text-xs font-semibold text-heading hidden sm:inline">${s.rating.toFixed(1)}★</span>
          </span>
          <button type="button" class="btn btn-primary btn-sm" data-request-swap="${esc(s.id)}">Request Swap</button>
        </span>
      </li>`;
  }

  function swapSkeletons() {
    let out = "";
    for (let i = 0; i < 3; i++) {
      out += `<div class="rounded-soft border border-line bg-surface p-4 flex items-center gap-4" aria-hidden="true">
        <div class="skeleton w-11 h-11 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-3 w-1/3"></div>
          <div class="skeleton h-3 w-1/2"></div>
        </div>
        <div class="skeleton h-8 w-24 rounded-xl"></div>
      </div>`;
    }
    return out;
  }

  function swapEmptyState() {
    return SL.ui.emptyState({
      icon: "search",
      title: "No matches for that pair yet",
      body: "Nobody in the demo marketplace teaches that while wanting your skill. Try a different combination, or browse the full catalogue.",
      action: '<a href="browse.html" class="btn btn-outline btn-sm mt-1">Browse all skills</a>',
    });
  }

  async function runSwapPlan() {
    const teachId = getTeach();
    const learnId = getLearn();
    const results = document.getElementById("swap-results");
    const idle = document.getElementById("swap-idle");

    if (!teachId || !learnId) {
      setSwapError("Choose a skill for both sides to see your matches.");
      return null;
    }
    if (teachId === learnId) {
      setSwapError("Pick two different skills — the point of a barter is trading what you know for what you don't.");
      return null;
    }
    setSwapError("");

    const submit = document.getElementById("swap-submit");
    submit.disabled = true;
    submit.innerHTML = '<span class="spinner"></span> Matching…';
    results.setAttribute("aria-busy", "true");
    if (idle) idle.hidden = true;

    // Show skeletons above any previous results while the placeholder resolves.
    let list = document.getElementById("swap-match-list");
    if (!list) {
      results.insertAdjacentHTML("beforeend", '<ul id="swap-match-list" class="flex flex-col gap-3 list-reset mt-4" hidden></ul>');
      list = document.getElementById("swap-match-list");
    }
    const prev = document.getElementById("swap-skeletons");
    if (prev) prev.remove();
    results.insertAdjacentHTML("beforeend", `<div id="swap-skeletons" class="flex flex-col gap-3 mt-4">${swapSkeletons()}</div>`);

    const matches = await SL.api.matchmaking.plan({ teachId, learnId });

    const skel = document.getElementById("swap-skeletons");
    if (skel) skel.remove();
    results.setAttribute("aria-busy", "false");
    submit.disabled = false;
    submit.innerHTML = 'Find my matches <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

    if (!matches.length) {
      list.hidden = true;
      list.innerHTML = "";
      let empty = document.getElementById("swap-empty");
      if (!empty) {
        results.insertAdjacentHTML("beforeend", `<div id="swap-empty" class="mt-4"></div>`);
        empty = document.getElementById("swap-empty");
      }
      empty.hidden = false;
      empty.innerHTML = swapEmptyState();
      return 0;
    }

    const empty = document.getElementById("swap-empty");
    if (empty) empty.hidden = true;
    list.hidden = false;
    list.innerHTML = matches.map(swapMatchRow).join("");
    return matches.length;
  }

  function initSwapBuilder() {
    const form = document.getElementById("swap-form");
    if (!form) return;

    renderSwapSelects();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      runSwapPlan().then((n) => setSwapHint(n === null ? undefined : n));
    });

    // Any change mirrors into the orb chips and re-runs the plan.
    ["swap-teach", "swap-learn"].forEach((id) => {
      const el = document.getElementById(id);
      if (el)
        el.addEventListener("change", () => {
          setSwapError("");
          syncHeroChips();
          runSwapPlan().then((n) => setSwapHint(n === null ? undefined : n));
        });
    });

    const flip = () => {
      const t = getTeach();
      setSelections(getLearn(), t);
      setSwapError("");
      runSwapPlan().then((n) => setSwapHint(n === null ? undefined : n));
    };
    document.getElementById("swap-flip").addEventListener("click", flip);

    // First-run plan so the hint and suggestions are populated on load.
    runSwapPlan().then((n) => setSwapHint(n === null ? undefined : n));

    // Request Swap from a match row (auth-gated, placeholder behaviour).
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-request-swap]");
      const results = document.getElementById("swap-results");
      if (!btn || !results || !results.contains(btn)) return;
      const skill = SL.data.skills.find((s) => s.id === btn.dataset.requestSwap);
      if (!skill) return;
      const owner = SL.data.userById(skill.userId) || { name: "this member" };

      if (!SL.store.isAuthenticated()) {
        SL.toast("Please sign in to request a swap.", { type: "warning", title: "Sign in required" });
        setTimeout(() => {
          window.location.href = "login.html?next=index.html";
        }, 900);
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `${SL.icon("check", "w-4 h-4")} Requested`;
      SL.toast(`Swap request sent to ${owner.name}.`, { type: "success" });
    });
  }

  /* =============================================================================
     Landing-only interactions
     ========================================================================== */

  /** Skills list + workshops: placeholder actions until the API exists. */
  function initLandingActions() {
    document.addEventListener("click", (e) => {
      const request = e.target.closest("[data-skill-request]");
      if (request) {
        if (!SL.store.isAuthenticated()) {
          SL.toast("Sign in to request a swap.", { type: "warning", title: "Sign in required" });
          setTimeout(() => {
            window.location.href = "login.html?next=index.html";
          }, 900);
          return;
        }
        request.disabled = true;
        request.innerHTML = `${SL.icon("check", "w-4 h-4")} Requested`;
        SL.toast(`Request sent for “${request.dataset.skillRequest}”.`, { type: "success" });
        return;
      }

      const rsvp = e.target.closest("[data-rsvp]");
      if (rsvp) {
        rsvp.disabled = true;
        rsvp.innerHTML = `${SL.icon("check", "w-4 h-4")} Going`;
        SL.toast(`You're on the list for “${rsvp.dataset.rsvp}”.`, { type: "success" });
        return;
      }

      const join = e.target.closest("[data-join-community]");
      if (join) {
        const id = join.dataset.joinCommunity;
        const joinedNow = !SL.store.isJoined(id);
        joinedNow ? SL.store.join(id) : SL.store.leave(id);
        join.setAttribute("aria-pressed", String(joinedNow));
        join.className = `btn ${joinedNow ? "btn-ghost" : "btn-outline"} btn-sm mt-auto w-full`;
        join.innerHTML = joinedNow ? `${SL.icon("check", "w-4 h-4")} Joined` : "Join";
        SL.toast(joinedNow ? "Joined — see you in the feed." : "Left the community.", {
          type: joinedNow ? "success" : "info",
        });
      }
    });

    const form = document.getElementById("newsletter-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("newsletter-email");
        const error = document.getElementById("newsletter-error");
        const email = (input.value || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          if (error) {
            error.textContent = "That email doesn't look right — try name@example.com.";
            error.classList.add("is-visible");
          }
          input.focus();
          return;
        }
        if (error) {
          error.textContent = "";
          error.classList.remove("is-visible");
        }
        // Backend: POST /api/newsletter { email }
        input.value = "";
        SL.toast("You're in. One email a month, no spam.", { type: "success" });
      });
    }
  }

  /* ---------- Boot ------------------------------------------------------------------ */
  function init() {
    SL.navbar.render();
    SL.footer.render();

    initHeroLetters();
    renderQuotes();
    renderProof();
    renderMarquee();
    renderStats();
    renderStories();
    renderSkills();
    renderLearn();
    renderCredits();
    renderCommunity();
    renderAbout();

    initSwapBuilder();
    initLandingActions();
    syncHeroChips();

    // Section behaviour: tabs, flips, accordions, carousel (delegated).
    S.init();
    SL.motion.initAll();
    SL.motion.initHeroParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
