/* =============================================================================
   SkillLoom — Landing page controller
   Fills the data-driven sections of index.html and boots shared behaviour
   (navbar, footer, reveals, count-ups, 3D hero parallax).
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, formatNumber } = SL.h;

  /* ---------- Stats strip --------------------------------------------------- */
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

  /* ---------- Feature grid (3D tilt cards) ---------------------------------- */
  function renderFeatures() {
    const host = document.getElementById("feature-grid");
    if (!host) return;
    host.innerHTML = SL.data.features.map((f, i) => SL.cards.featureCard(f, i)).join("");
  }

  /* ---------- How it works ---------------------------------------------------- */
  function renderSteps() {
    const host = document.getElementById("steps-grid");
    if (!host) return;
    host.innerHTML = SL.data.howItWorks
      .map(
        (step, i) => `
        <li class="card p-6 flex flex-col gap-3 h-full card-hover" data-reveal data-reveal-delay="${i * 90}">
          <span class="font-heading font-extrabold text-2xl text-primary/90">${esc(step.step)}</span>
          <h3 class="font-heading font-bold text-lg text-heading">${esc(step.title)}</h3>
          <p class="text-sm text-muted leading-body">${esc(step.body)}</p>
        </li>`
      )
      .join("");
  }

  /* ---------- AI section copy --------------------------------------------------- */
  function renderAi() {
    const host = document.getElementById("ai-list");
    if (!host) return;
    host.innerHTML = SL.data.aiFeatures
      .map(
        (f, i) => `
        <div class="rounded-card border border-line bg-surface p-5 shadow-soft" data-reveal data-reveal-delay="${i * 100}">
          <div class="flex items-start gap-4">
            <span class="grid place-items-center w-11 h-11 rounded-soft shrink-0 bg-surface-3 text-link border border-line">
              ${SL.icon(f.icon, "w-5 h-5")}
            </span>
            <div class="min-w-0">
              <h3 class="font-heading font-bold text-lg text-heading">${esc(f.title)}</h3>
              <p class="text-sm text-muted leading-body mt-1.5">${esc(f.body)}</p>
              <ul class="mt-3 flex flex-wrap gap-2 list-reset">
                ${f.points.map((p) => `<li class="tag">${SL.icon("check", "w-3.5 h-3.5")}${esc(p)}</li>`).join("")}
              </ul>
            </div>
          </div>
        </div>`
      )
      .join("");
  }

  /* ---------- Community preview -------------------------------------------------- */
  function renderCommunityPreview() {
    const host = document.getElementById("community-preview");
    if (!host) return;
    const featured = ["web-development", "ui-ux-design", "music-instruments", "languages-culture"]
      .map((id) => SL.data.communityById(id))
      .filter(Boolean);

    host.innerHTML = featured
      .map((c, i) => {
        const joined = SL.store.isJoined(c.id);
        return `
        <a href="community.html?id=${esc(c.id)}"
           class="card card-hover p-6 flex flex-col gap-3.5 group"
           data-reveal data-reveal-delay="${i * 80}">
          <div class="flex items-center justify-between">
            ${SL.ui.iconTile(c.icon, c.tone, "w-11 h-11 rounded-soft")}
            ${joined ? SL.ui.badge("Joined", "success", "check") : SL.ui.badge(c.category, "neutral")}
          </div>
          <h3 class="font-heading font-bold text-heading text-base group-hover:text-link transition-colors">${esc(c.name)}</h3>
          <p class="text-sm text-muted leading-body line-clamp-3">${esc(c.tagline)}</p>
          <span class="mt-auto pt-3 flex items-center justify-between text-xs text-muted border-t border-line">
            <span class="flex items-center gap-1.5">${SL.icon("users", "w-4 h-4")} ${formatNumber(c.members + (joined ? 1 : 0))} members</span>
            <span class="text-link font-semibold flex items-center gap-1">View
              <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </span>
        </a>`;
      })
      .join("");
  }

  /* ---------- Hero proof row -------------------------------------------------------- */
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

  /* ---------- Swap builder (plan your exchange) -------------------------------------- */

  /* The hero picker (#hero-teach/#hero-learn) and the planner card
     (#swap-teach/#swap-learn) are two views of one selection pair — every
     change mirrors across and re-runs the match plan. */
  const TEACH_IDS = ["hero-teach", "swap-teach"];
  const LEARN_IDS = ["hero-learn", "swap-learn"];

  const getTeach = () => document.getElementById("swap-teach").value;
  const getLearn = () => document.getElementById("swap-learn").value;

  function setSelections(teachId, learnId) {
    TEACH_IDS.forEach((id) => { const el = document.getElementById(id); if (el) el.value = teachId; });
    LEARN_IDS.forEach((id) => { const el = document.getElementById(id); if (el) el.value = learnId; });
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

  /** Short human line under the hero picker once a plan resolves. */
  function setHeroHint(count) {
    const hint = document.getElementById("hero-picker-hint");
    if (!hint) return;
    if (count === null) return; // validation error already shown in the planner
    const teach = (SL.data.swapTopics || []).find((t) => t.id === getTeach());
    const learn = (SL.data.swapTopics || []).find((t) => t.id === getLearn());
    if (!teach || !learn) return;
    hint.innerHTML = count > 0
      ? `${count} member${count === 1 ? "" : "s"} teach ${esc(learn.label)} and want ${esc(teach.label)} — <a href="#plan">see your suggestions</a>.`
      : `No exact matches for ${esc(teach.label)} ⇄ ${esc(learn.label)} yet — <a href="#plan">try another pair</a>.`;
  }

  /** Populate all four selects from data.swapTopics, grouped by category. */
  function renderSwapSelects() {
    const targets = ["swap-teach", "swap-learn", "hero-teach", "hero-learn"]
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

    targets.forEach((sel) => { sel.innerHTML = placeholder + groups; });

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
      runSwapPlan().then((n) => setHeroHint(n === null ? undefined : n));
    });

    // Any change on either side mirrors to the other view, re-runs the plan
    // and refreshes the hero hint + orb chips.
    const onPick = () => {
      setSwapError("");
      syncHeroChips();
      runSwapPlan().then((n) => setHeroHint(n === null ? undefined : n));
    };
    [...TEACH_IDS, ...LEARN_IDS].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", () => {
        const changed = el.value; // read from the select the user actually touched
        // Mirror the field that changed into its twin.
        if (TEACH_IDS.indexOf(id) !== -1) TEACH_IDS.forEach((t) => { const e2 = document.getElementById(t); if (e2) e2.value = changed; });
        else LEARN_IDS.forEach((t) => { const e2 = document.getElementById(t); if (e2) e2.value = changed; });
        onPick();
      });
    });

    const flip = () => {
      const t = getTeach();
      setSelections(getLearn(), t);
      setSwapError("");
      runSwapPlan().then((n) => setHeroHint(n === null ? undefined : n));
    };
    document.getElementById("swap-flip").addEventListener("click", flip);
    const heroFlip = document.getElementById("hero-flip");
    if (heroFlip) heroFlip.addEventListener("click", flip);

    // First-run plan so the hero hint and suggestions are populated on load.
    runSwapPlan().then((n) => setHeroHint(n === null ? undefined : n));

    // Request Swap from a match row (auth-gated, placeholder behaviour).
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-request-swap]");
      if (!btn || !document.getElementById("swap-results").contains(btn)) return;
      const skill = SL.data.skills.find((s) => s.id === btn.dataset.requestSwap);
      if (!skill) return;
      const owner = SL.data.userById(skill.userId) || { name: "this member" };

      if (!SL.store.isAuthenticated()) {
        SL.toast("Please sign in to request a swap.", { type: "warning", title: "Sign in required" });
        setTimeout(() => { window.location.href = "login.html?next=index.html"; }, 900);
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `${SL.icon("check", "w-4 h-4")} Requested`;
      SL.toast(`Swap request sent to ${owner.name}.`, { type: "success" });
    });
  }

  /* ---------- Boot ------------------------------------------------------------------ */
  function init() {
    SL.navbar.render();
    SL.footer.render();

    renderStats();
    renderFeatures();
    renderSteps();
    renderAi();
    renderCommunityPreview();
    renderProof();
    initSwapBuilder();
    syncHeroChips();

    SL.motion.initAll();
    SL.motion.initHeroParallax();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
