/* =============================================================================
   SkillLoom — Dashboard controller
   Requires a (fake) session: unauthenticated visitors are redirected to the
   login page and returned here afterwards via ?next=dashboard.html.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { qs, esc, formatNumber, formatDate } = SL.h;

  /* ---------- Credit balance card ------------------------------------------------ */
  function renderBalance(profile) {
    const host = document.getElementById("balance-card");
    const summary = SL.data.walletSummary;
    const credits = SL.store.getCredits();

    host.innerHTML = `
      <div class="gradient-navy rounded-card p-6 sm:p-7 text-white shadow-lift relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none" style="background:radial-gradient(closest-side, rgba(56,189,248,.35), transparent)" aria-hidden="true"></div>
        <div class="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <p class="text-[0.7rem] uppercase tracking-[0.16em] text-white/60 font-semibold" id="balance-title">Skill credit balance</p>
            <p class="mt-2 font-heading font-extrabold text-4xl sm:text-5xl leading-none">
              ${formatNumber(credits)}
              <span class="text-base font-semibold text-white/70 align-middle">credits</span>
            </p>
            <p class="text-xs text-white/60 mt-2">Credits are earned by teaching and spent on learning.</p>
          </div>
          <span class="badge shrink-0" style="background:rgba(255,255,255,.14);color:#E0F2FE">
            ${SL.icon("trending-up", "w-3.5 h-3.5")} +${summary.earnedMonth} earned this month
          </span>
        </div>

        <div class="relative grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/15">
          <div>
            <p class="text-[0.68rem] uppercase tracking-[0.12em] text-white/55 font-semibold">Earned (30d)</p>
            <p class="font-heading font-bold text-lg mt-0.5" style="color:#7DD3FC">+${summary.earnedMonth}</p>
          </div>
          <div>
            <p class="text-[0.68rem] uppercase tracking-[0.12em] text-white/55 font-semibold">Spent (30d)</p>
            <p class="font-heading font-bold text-lg mt-0.5 text-white/85">−${summary.spentMonth}</p>
          </div>
          <div>
            <p class="text-[0.68rem] uppercase tracking-[0.12em] text-white/55 font-semibold">Pending</p>
            <p class="font-heading font-bold text-lg mt-0.5 text-white/85">${summary.pending}</p>
          </div>
        </div>

        <div class="relative flex flex-wrap gap-3 mt-6">
          <a href="wallet.html" class="btn btn-primary btn-sm">Open wallet</a>
          <a href="browse.html" class="btn btn-quiet btn-sm">Earn more credits</a>
        </div>
      </div>`;
  }

  /* ---------- Level & progress ------------------------------------------------------ */
  function renderLevel(profile) {
    const host = document.getElementById("level-card");
    const levels = SL.data.levels;
    const credits = SL.store.getCredits();
    const currentIdx = Math.max(0, levels.findIndex((l) => l.name === profile.level));
    const current = levels[currentIdx] || levels[0];
    const next = levels[currentIdx + 1] || null;
    const span = next ? next.min - current.min : 1;
    const progress = next ? Math.min(100, Math.round(((credits - current.min) / span) * 100)) : 100;

    host.innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-4">
        <h2 id="level-title" class="font-heading font-bold text-lg text-heading">Your level</h2>
        <span class="badge badge-accent">${esc(current.name)}</span>
      </div>
      <div class="flex items-baseline justify-between text-sm mb-2">
        <span class="text-muted">${formatNumber(credits)} credits</span>
        <span class="text-muted">${next ? `${formatNumber(next.min)} for ${esc(next.name)}` : "Top level reached"}</span>
      </div>
      <div class="progress">
        <div class="progress-bar" data-value="${progress}"></div>
      </div>
      <p class="text-xs text-muted mt-3 leading-body">
        ${next
          ? `Teach ${formatNumber(Math.max(0, next.min - credits))} more credits' worth of sessions to reach ${esc(next.name)}.`
          : "You've reached the highest level — thank you for mentoring others."}
      </p>`;
  }

  /* ---------- Sessions ------------------------------------------------------------------ */
  function renderSessions() {
    const host = document.getElementById("sessions-list");
    const merged = SL.store.getBookings().concat(SL.data.sessions);

    if (!merged.length) {
      host.innerHTML = `<li>${SL.ui.emptyState({
        icon: "calendar",
        title: "No sessions booked yet",
        body: "Pick a slot from the schedule and your next swap will appear here.",
        action: `<a href="schedule.html" class="btn btn-primary btn-sm mt-1">Book a session</a>`,
      })}</li>`;
      return;
    }

    host.innerHTML = merged.slice(0, 4).map((s) => SL.cards.sessionRow(s)).join("");
  }

  /* ---------- Matches, activity, badges, quick actions ------------------------------------ */
  function renderMatches() {
    document.getElementById("matches-grid").innerHTML = SL.data.matches
      .map((m) => SL.cards.matchCard(m))
      .join("");
  }

  function renderActivity() {
    document.getElementById("activity-list").innerHTML = SL.data.activity
      .map((a, i, arr) => {
        const html = SL.cards.activityItem(a);
        // Hide the connector line on the final item.
        return i === arr.length - 1 ? html.replace('<span class="w-px flex-1 bg-line mt-2"></span>', "") : html;
      })
      .join("");
  }

  function renderBadges() {
    document.getElementById("badges-grid").innerHTML = SL.data.badges
      .map((b) => SL.cards.badgeCard(b))
      .join("");
    const earned = SL.data.badges.filter((b) => b.earned).length;
    document.getElementById("badge-count").textContent = `${earned} of ${SL.data.badges.length} earned`;
  }

  function renderQuickActions() {
    document.getElementById("quick-actions").innerHTML = SL.data.quickActions
      .map(
        (a) => `
        <a href="${a.href}" class="rounded-soft border border-line bg-surface-2 hover:border-primary hover:bg-surface p-4 flex flex-col gap-1.5 transition-colors group">
          <span class="text-link group-hover:scale-110 transition-transform">${SL.icon(a.icon, "w-5 h-5")}</span>
          <span class="text-sm font-semibold text-heading">${esc(a.label)}</span>
          <span class="text-xs text-muted leading-snug">${esc(a.body)}</span>
        </a>`
      )
      .join("");
  }

  /* ---------- Header --------------------------------------------------------------------- */
  function renderHeader(profile) {
    const hour = new Date().getHours();
    const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const first = String(profile.name || "there").split(" ")[0];
    document.getElementById("dash-greeting").textContent = `${part}, ${first}.`;

    const sessions = SL.store.getBookings().length + SL.data.sessions.length;
    document.getElementById("dash-subline").textContent =
      `${formatDate(new Date().toISOString(), { weekday: "long", day: "numeric", month: "long" })} · ` +
      `${sessions} sessions ahead · ${formatNumber(SL.store.getCredits())} credits available`;
  }

  /* ---------- Boot -------------------------------------------------------------------------- */
  function init() {
    if (!SL.store.isAuthenticated()) {
      window.location.replace("login.html?next=dashboard.html");
      return;
    }

    SL.navbar.render();
    SL.footer.render();

    const profile = SL.store.getProfile();
    renderHeader(profile);
    renderBalance(profile);
    renderLevel(profile);
    renderSessions();
    renderMatches();
    renderActivity();
    renderBadges();
    renderQuickActions();

    SL.motion.initAll();

    // Swap requests from match cards.
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-request-swap]");
      if (!btn) return;
      const key = btn.dataset.requestSwap;
      const match = SL.data.matches.find((m) => m.id === key || m.userId === key);
      const user = match ? SL.data.userById(match.userId) : SL.data.userById(key);
      btn.disabled = true;
      btn.innerHTML = `${SL.icon("check", "w-4 h-4")} Requested`;
      SL.toast(`Swap request sent to ${user ? user.name : "your match"}.`, { type: "success" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
