/* =============================================================================
   SkillLoom — Card components
   The site's repeating units. Each builder returns an HTML string and keeps
   its own data-attributes so pages can delegate events in one place.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const { esc, timeAgo, formatDate } = SL.h;
  const { avatar, badge, creditPill, iconTile, tag } = SL.ui;

  /* ---------- Landing: feature card (3D tilt) ---------------------------------- */
  function featureCard(feature, index) {
    return `
      <article class="card tilt relative overflow-hidden h-full" data-tilt data-reveal data-reveal-delay="${(index % 3) * 90}">
        <span class="tilt-gloss"></span>
        <div class="card-pad flex flex-col gap-4 h-full">
          ${iconTile(feature.icon, index, "w-12 h-12 rounded-soft")}
          <h3 class="font-heading font-bold text-lg text-heading">${esc(feature.title)}</h3>
          <p class="text-sm text-muted leading-body">${esc(feature.body)}</p>
        </div>
      </article>`;
  }

  /* ---------- Browse: skill listing card ---------------------------------------- */
  function skillCard(skill) {
    const user = SL.data.userById(skill.userId) || { name: "Member", tone: 0 };
    const category = SL.data.categoryById(skill.category);
    return `
      <article class="card tilt relative overflow-hidden h-full flex flex-col" data-tilt data-skill="${esc(skill.id)}">
        <span class="tilt-gloss"></span>
        <div class="card-pad flex flex-col gap-4 flex-1">
          <header class="flex items-start justify-between gap-3">
            <a href="profile.html?id=${esc(skill.userId)}" class="flex items-center gap-3 min-w-0 group">
              ${avatar(user, "md", { presence: true })}
              <span class="min-w-0">
                <span class="block text-sm font-semibold text-heading truncate group-hover:text-link transition-colors">${esc(user.name)}</span>
                <span class="block text-xs text-muted truncate">${esc(user.headline || "SkillLoom member")}</span>
              </span>
            </a>
            <span class="flex items-center gap-1 text-xs font-semibold text-heading shrink-0">
              <span class="text-amber-500">${SL.icon("star", "w-4 h-4", { fill: true })}</span>
              ${skill.rating.toFixed(1)}
            </span>
          </header>

          <div class="flex flex-wrap items-center gap-2">
            ${category ? badge(category.label, "primary", category.icon) : ""}
            ${badge(skill.level, "neutral")}
            ${skill.demand ? badge(skill.demand, "accent") : ""}
          </div>

          <div>
            <h3 class="font-heading font-bold text-[1.02rem] leading-snug text-heading">${esc(skill.title)}</h3>
            <p class="text-sm text-muted leading-body mt-1.5 line-clamp-2">${esc(skill.blurb)}</p>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div class="rounded-soft bg-surface-2 border border-line p-3">
              <span class="text-[0.7rem] uppercase tracking-[0.1em] text-muted font-semibold">Offers</span>
              <p class="text-[0.82rem] font-semibold text-heading leading-snug mt-0.5 line-clamp-2">${esc(skill.teaches)}</p>
            </div>
            <div class="rounded-soft bg-surface-2 border border-line p-3">
              <span class="text-[0.7rem] uppercase tracking-[0.1em] text-muted font-semibold">Wants</span>
              <p class="text-[0.82rem] font-semibold text-heading leading-snug mt-0.5 line-clamp-2">${esc(skill.wants)}</p>
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5">${(skill.tags || []).slice(0, 3).map((t) => tag(t)).join("")}</div>

          <footer class="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
            <span class="flex items-center gap-2">
              ${creditPill(skill.credits)}
              <span class="text-xs text-muted hidden sm:inline">${esc(skill.duration)}</span>
            </span>
            <button type="button" class="btn btn-primary btn-sm" data-request-swap="${esc(skill.id)}">Request Swap</button>
          </footer>
        </div>
      </article>`;
  }

  /* ---------- Community directory card -------------------------------------------- */
  function communityCard(community, isJoined) {
    const memberCount = community.members + (isJoined ? 1 : 0);
    return `
      <article class="card card-hover p-6 flex flex-col gap-4 h-full" data-community-card="${esc(community.id)}">
        <div class="flex items-start justify-between gap-3">
          ${iconTile(community.icon, community.tone, "w-12 h-12 rounded-soft")}
          <span class="badge badge-neutral">${esc(community.category)}</span>
        </div>
        <div class="flex-1">
          <h3 class="font-heading font-bold text-lg text-heading">
            <a href="community.html?id=${esc(community.id)}" class="hover:text-link transition-colors">${esc(community.name)}</a>
          </h3>
          <p class="text-sm text-muted leading-body mt-1.5 line-clamp-3">${esc(community.description)}</p>
        </div>
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-line">
          <span class="flex items-center gap-1.5 text-xs font-medium text-muted">
            ${SL.icon("users", "w-4 h-4")}
            <span data-member-count>${SL.h.formatNumber(memberCount)}</span> members
          </span>
          <button type="button" class="btn ${isJoined ? "btn-outline" : "btn-primary"} btn-sm" data-toggle-join="${esc(community.id)}" aria-pressed="${isJoined}">
            ${isJoined ? `${SL.icon("check", "w-4 h-4")} Joined` : "Join"}
          </button>
        </div>
      </article>`;
  }

  /* ---------- Dashboard: suggested match -------------------------------------------- */
  function matchCard(match) {
    const user = SL.data.userById(match.userId) || { name: "Member", tone: 0 };
    return `
      <article class="card card-hover p-5 flex flex-col gap-4 h-full" data-match="${esc(match.id)}">
        <div class="flex items-center gap-3">
          ${avatar(user, "md", { presence: true })}
          <div class="min-w-0 flex-1">
            <a href="profile.html?id=${esc(match.userId)}" class="block text-sm font-semibold text-heading truncate hover:text-link transition-colors">${esc(user.name)}</a>
            <span class="block text-xs text-muted truncate">${esc(user.headline || "")}</span>
          </div>
          <span class="shrink-0 text-right">
            <span class="block font-heading font-extrabold text-lg leading-none text-link">${match.matchPercent}%</span>
            <span class="block text-[0.65rem] uppercase tracking-[0.12em] text-muted mt-1">match</span>
          </span>
        </div>

        <div class="progress" title="Match score">
          <div class="progress-bar" data-value="${match.matchPercent}"></div>
        </div>

        <dl class="grid grid-cols-2 gap-2.5 text-xs">
          <div class="rounded-soft bg-surface-2 border border-line p-3">
            <dt class="text-muted font-semibold uppercase tracking-[0.08em] text-[0.65rem]">They teach</dt>
            <dd class="text-heading font-semibold mt-0.5 leading-snug line-clamp-2">${esc(match.offered)}</dd>
          </div>
          <div class="rounded-soft bg-surface-2 border border-line p-3">
            <dt class="text-muted font-semibold uppercase tracking-[0.08em] text-[0.65rem]">They want</dt>
            <dd class="text-heading font-semibold mt-0.5 leading-snug line-clamp-2">${esc(match.wanted)}</dd>
          </div>
        </dl>

        <p class="text-xs text-muted leading-body flex gap-2">
          <span class="text-link shrink-0 mt-0.5">${SL.icon("sparkles", "w-4 h-4")}</span>
          <span>${esc(match.reason)}</span>
        </p>

        <div class="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-line">
          ${creditPill(match.credits)}
          <button type="button" class="btn btn-primary btn-sm" data-request-swap="${esc(match.userId)}">Request Swap</button>
        </div>
      </article>`;
  }

  /* ---------- Dashboard: session row ------------------------------------------------- */
  function sessionRow(session) {
    const user = SL.data.userById(session.withUserId) || { name: "Member", tone: 0 };
    const confirmed = session.status === "confirmed";
    return `
      <li class="flex items-center gap-4 rounded-soft border border-line bg-surface p-4" data-session="${esc(session.id)}">
        <span class="shrink-0 grid place-items-center w-12 h-12 rounded-soft bg-surface-2 border border-line text-link">
          ${SL.icon("calendar", "w-5 h-5")}
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-heading truncate">${esc(session.title)}</p>
          <p class="text-xs text-muted truncate">${esc(user.name)} · ${esc(session.format)}</p>
        </div>
        <div class="text-right shrink-0 hidden sm:block">
          <p class="text-xs font-semibold text-heading">${formatDate(session.startsAt, { weekday: "short", day: "numeric", month: "short" })}</p>
          <p class="text-xs text-muted">${new Date(session.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · ${esc(session.duration)}</p>
        </div>
        <span class="shrink-0">${confirmed ? badge("Confirmed", "success") : badge("Pending", "primary")}</span>
      </li>`;
  }

  /* ---------- Dashboard: activity item ------------------------------------------------ */
  function activityItem(item) {
    return `
      <li class="flex gap-4">
        <div class="flex flex-col items-center">
          <span class="grid place-items-center w-9 h-9 rounded-full ${item.badge ? "bg-indigo-50 text-indigo-500" : "bg-surface-2 text-link"} border border-line">
            ${SL.icon(item.icon, "w-4 h-4")}
          </span>
          <span class="w-px flex-1 bg-line mt-2"></span>
        </div>
        <div class="pb-5 min-w-0">
          <p class="text-sm font-semibold text-heading leading-snug">${esc(item.title)}</p>
          <p class="text-xs text-muted mt-0.5">${esc(item.meta)}</p>
          <p class="text-[0.7rem] text-muted/80 mt-1">${timeAgo(item.at)}</p>
        </div>
      </li>`;
  }

  /* ---------- Reviews: review card ------------------------------------------------------ */
  function reviewCard(review) {
    const from = SL.data.userById(review.fromUserId) || { name: "Member", tone: 0 };
    return `
      <article class="card p-6 flex flex-col gap-4" data-review="${esc(review.id)}">
        <header class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            ${avatar(from, "md")}
            <div>
              <p class="text-sm font-semibold text-heading">${esc(from.name)}</p>
              <p class="text-xs text-muted">${esc(review.skill)} · ${esc(review.sessionType)}</p>
            </div>
          </div>
          <div class="text-right shrink-0">
            ${SL.rating.display(review.rating, "w-4 h-4")}
            <p class="text-xs text-muted mt-1">${review.rating.toFixed(1)}</p>
          </div>
        </header>
        <p class="text-sm text-body leading-body">${esc(review.body)}</p>
        <footer class="flex items-center justify-between gap-3 pt-3 border-t border-line">
          <span class="text-xs text-muted">${formatDate(review.createdAt)}</span>
          <button type="button" class="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-link transition-colors" data-helpful="${esc(review.id)}">
            ${SL.icon("thumbs-up", "w-4 h-4")} Helpful · <span data-helpful-count>${review.helpful}</span>
          </button>
        </footer>
      </article>`;
  }

  /* ---------- Profile: badge tile --------------------------------------------------------- */
  function badgeCard(b) {
    const earned = b.earned;
    return `
      <div class="rounded-soft border p-4 flex items-start gap-3 h-full ${earned ? "border-line bg-surface" : "border-dashed border-line bg-surface-2"}"
           title="${esc(b.desc)}">
        <span class="grid place-items-center w-10 h-10 rounded-soft shrink-0 ${earned ? "bg-surface-3 text-link border border-line" : "bg-surface text-muted border border-line"}">
          ${SL.icon(b.icon, "w-5 h-5")}
        </span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-heading flex items-center gap-1.5">
            ${esc(b.name)}
            ${earned ? SL.icon("check-circle", "w-4 h-4 text-emerald-500") : ""}
          </p>
          <p class="text-xs text-muted mt-0.5 leading-snug">${esc(b.desc)}</p>
          ${earned
            ? `<p class="text-[0.7rem] text-muted mt-1">Earned ${esc(b.earnedAt || "")}</p>`
            : `<div class="mt-2"><div class="progress h-1.5"><div class="progress-bar" data-value="${b.progress || 0}"></div></div>
               <p class="text-[0.7rem] text-muted mt-1">${b.progress || 0}% to unlock</p></div>`}
        </div>
      </div>`;
  }

  SL.cards = { featureCard, skillCard, communityCard, matchCard, sessionRow, activityItem, reviewCard, badgeCard };
})(window.SL);
