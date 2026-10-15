/* =============================================================================
   SkillLoom — Profile controller
   Reads ?id=<member> to show another member, or falls back to the signed-in
   member's own profile. Editing is a UI-only modal that writes to localStorage.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, getParam, formatDate, formatNumber } = SL.h;

  let profile = null;
  let isSelf = false;

  /* ---------- Identity header ---------------------------------------------------- */
  function renderHeader() {
    const host = document.getElementById("profile-header");
    const badges = isSelf
      ? SL.data.badges.filter((b) => b.earned).map((b) => b.name)
      : profile.badges || [];

    const bannerCss = SL.data.bannerCss ? SL.data.bannerCss(profile.banner) : "";
    const occ = profile.occupation ? SL.data.occupationById(profile.occupation) : null;
    const roleLine = [profile.role, profile.org].filter(Boolean).map(esc).join(" · ");

    host.innerHTML = `
      <div class="${bannerCss ? "" : "gradient-navy"} h-24 sm:h-28 relative overflow-hidden" ${bannerCss ? `style="background:${bannerCss}"` : ""} aria-hidden="true">
        <div class="absolute inset-0 opacity-40" style="background-image:radial-gradient(circle at 20% 30%, rgba(255,255,255,.28), transparent 45%), radial-gradient(circle at 80% 70%, rgba(255,255,255,.20), transparent 45%)"></div>
      </div>

      <div class="px-6 sm:px-8 pb-6 sm:pb-7 relative z-10">
        <div class="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div class="shrink-0 self-start -mt-12 sm:-mt-14 relative z-10">${SL.ui.avatar(profile, "xl", { presence: true, className: "ring-4 ring-surface" })}</div>

          <div class="flex-1 min-w-0 pb-1 sm:pt-2">
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="font-heading font-extrabold text-2xl sm:text-3xl text-heading tracking-tight">${esc(profile.name)}</h1>
              <span class="badge badge-accent">${esc(profile.level || "Member")}</span>
              ${occ ? `<span class="badge badge-primary" title="${esc(profile.role || occ.label)}">${SL.icon(occ.icon, "w-3.5 h-3.5")} ${esc(profile.role || occ.label)}</span>` : ""}
            </div>
            ${profile.headline ? `<p class="text-muted mt-1">${esc(profile.headline)}</p>` : ""}
            ${roleLine ? `<p class="text-sm text-heading font-medium mt-1">${roleLine}</p>` : ""}
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-sm text-muted">
              ${profile.location ? `<span class="inline-flex items-center gap-1.5">${SL.icon("map-pin", "w-4 h-4")}${esc(profile.location)}</span>` : ""}
              <span class="inline-flex items-center gap-1.5">${SL.icon("star", "w-4 h-4 text-amber-500", { fill: true })}<strong class="text-heading">${(profile.rating || 5).toFixed(1)}</strong> · ${formatNumber(profile.reviewCount || 0)} reviews</span>
              <span class="inline-flex items-center gap-1.5">${SL.icon("calendar", "w-4 h-4")}Member since ${profile.joined ? formatDate(profile.joined, { month: "short", year: "numeric" }) : "2024"}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2.5 sm:pb-1">
            ${isSelf
              ? `<button type="button" class="btn btn-primary btn-sm" data-edit-profile>${SL.icon("pencil", "w-4 h-4")} Edit profile</button>`
              : `<button type="button" class="btn btn-primary btn-sm" data-request-swap="${esc(profile.id)}">Request swap</button>
                 <a href="chat.html" class="btn btn-outline btn-sm">${SL.icon("message-circle", "w-4 h-4")} Message</a>`}
          </div>
        </div>

        ${badges.length
          ? `<div class="flex flex-wrap gap-2 mt-5 pt-4 border-t border-line">
               ${badges.map((b) => SL.ui.badge(b, "primary", "award")).join("")}
             </div>`
          : ""}
      </div>`;
  }

  /* ---------- About & skills ------------------------------------------------------- */
  function renderAbout() {
    document.getElementById("profile-about").innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-3">
        <h2 id="about-title" class="font-heading font-bold text-lg text-heading">About</h2>
        ${isSelf ? `<button type="button" class="text-sm font-semibold text-link hover:underline" data-edit-profile>Edit</button>` : ""}
      </div>
      <p class="text-body leading-body text-[0.95rem]">${esc(profile.bio || "This member hasn't written a bio yet.")}</p>`;
  }

  function renderSkills() {
    const offered = profile.skillsOffered || [];
    const wanted = profile.skillsWanted || [];
    const chipRow = (items, tone) =>
      items.length
        ? `<div class="flex flex-wrap gap-2">${items.map((s) => `<span class="tag" style="${tone}">${esc(s)}</span>`).join("")}</div>`
        : `<p class="text-sm text-muted">Nothing listed yet.</p>`;

    document.getElementById("profile-skills").innerHTML = `
      <h2 id="skills-title" class="font-heading font-bold text-lg text-heading mb-4">Skills</h2>
      <div class="grid sm:grid-cols-2 gap-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-2.5 flex items-center gap-1.5">
            ${SL.icon("arrow-up-right", "w-4 h-4 text-link")} Offers
          </p>
          ${chipRow(offered, "background:rgba(14,165,233,.10);border-color:rgba(14,165,233,.35);color:var(--c-link);font-weight:600")}
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-2.5 flex items-center gap-1.5">
            ${SL.icon("arrow-left", "w-4 h-4 text-link")} Wants
          </p>
          ${chipRow(wanted, "background:rgba(99,102,241,.10);border-color:rgba(99,102,241,.35);color:var(--c-accent-strong);font-weight:600")}
        </div>
      </div>`;
  }

  /* ---------- Portfolio & interests --------------------------------------------------- */
  function hostOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      return url;
    }
  }

  function renderPortfolio() {
    const host = document.getElementById("profile-portfolio");
    const links = profile.portfolio || [];
    const required = SL.data.portfolioRequired(profile.skillsOffered || []);

    const rows = links
      .map(
        (l) => `
        <a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"
           class="flex items-center gap-3 rounded-soft border border-line bg-surface-2 p-3.5 hover:border-sky-400/60 hover:bg-surface transition-colors group">
          <span class="grid place-items-center w-10 h-10 rounded-soft bg-surface border border-line text-link shrink-0">
            ${SL.icon("external-link", "w-4 h-4")}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-semibold text-heading truncate">${esc(l.label)}</span>
            <span class="block text-xs text-muted truncate">${esc(hostOf(l.url))}</span>
          </span>
          <span class="text-link opacity-0 group-hover:opacity-100 transition-opacity">${SL.icon("arrow-up-right", "w-4 h-4")}</span>
        </a>`
      )
      .join("");

    const empty = isSelf
      ? `${SL.ui.alertBox(
          required
            ? "Members who teach technology or design skills need at least one link to their work — add one so others can check it out before booking."
            : "Share a portfolio or work sample to build trust with members — it's optional for your skills.",
          required ? "warning" : "info"
        )}
        <button type="button" class="btn btn-outline btn-sm mt-4" data-edit-profile>${SL.icon("plus", "w-4 h-4")} Add work links</button>`
      : `<p class="text-sm text-muted">This member hasn't shared any work yet.</p>`;

    host.innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-4">
        <h2 id="portfolio-title" class="font-heading font-bold text-lg text-heading">Portfolio & work</h2>
        ${required ? `<span class="badge badge-primary">${SL.icon("shield", "w-3.5 h-3.5")} Verified work expected</span>` : ""}
      </div>
      ${links.length ? `<div class="grid sm:grid-cols-2 gap-3">${rows}</div>` : empty}`;
  }

  function renderDetails() {
    const host = document.getElementById("profile-details");
    const interests = profile.interests || [];
    const hobbies = profile.hobbies || [];

    const chip = (list, kind) =>
      list.length
        ? `<div class="flex flex-wrap gap-2">${list
            .map((label) => {
              const item =
                kind === "interest"
                  ? SL.data.interestByLabel(label)
                  : SL.data.hobbyByLabel(label);
              const icon = item ? item.icon : kind === "interest" ? "target" : "sparkles";
              return `<span class="tag" style="${
                kind === "interest"
                  ? "background:rgba(14,165,233,.10);border-color:rgba(14,165,233,.35);color:var(--c-link);font-weight:600"
                  : "background:rgba(99,102,241,.10);border-color:rgba(99,102,241,.35);color:var(--c-accent-strong);font-weight:600"
              }">${SL.icon(icon, "w-3.5 h-3.5")} ${esc(label)}</span>`;
            })
            .join("")}</div>`
        : `<p class="text-sm text-muted">Nothing listed yet.</p>`;

    host.innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-4">
        <h2 id="interests-title" class="font-heading font-bold text-lg text-heading">Interests & hobbies</h2>
        ${isSelf ? `<button type="button" class="text-sm font-semibold text-link hover:underline" data-edit-profile>Edit</button>` : ""}
      </div>
      <div class="grid sm:grid-cols-2 gap-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-2.5 flex items-center gap-1.5">
            ${SL.icon("target", "w-4 h-4 text-link")} Fields of interest
          </p>
          ${chip(interests, "interest")}
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-2.5 flex items-center gap-1.5">
            ${SL.icon("sparkles", "w-4 h-4 text-link")} Hobbies
          </p>
          ${chip(hobbies, "hobby")}
        </div>
      </div>`;
  }

  /* ---------- Reviews ------------------------------------------------------------------ */
  function renderReviews() {
    const host = document.getElementById("profile-reviews");
    const reviews = isSelf ? SL.data.reviews : SL.data.memberReviews;
    const summary = SL.data.ratingAverage;
    const avg = isSelf ? summary.average : profile.rating || 5;
    const total = isSelf ? summary.total : profile.reviewCount || 0;
    const maxCount = Math.max.apply(null, SL.data.ratingBreakdown.map((r) => r.count)) || 1;

    host.innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-5">
        <h2 id="reviews-title" class="font-heading font-bold text-lg text-heading">Ratings & reviews</h2>
        ${isSelf ? `<a href="reviews.html" class="text-sm font-semibold text-link hover:underline">Manage reviews</a>` : ""}
      </div>

      <div class="grid sm:grid-cols-3 gap-6 pb-6 mb-6 border-b border-line">
        <div class="sm:col-span-1 text-center sm:text-left">
          <p class="font-heading font-extrabold text-5xl text-heading leading-none">${avg.toFixed(1)}</p>
          <div class="mt-2 flex justify-center sm:justify-start">${SL.rating.display(avg, "w-5 h-5")}</div>
          <p class="text-xs text-muted mt-2">${formatNumber(total)} reviews</p>
        </div>
        <div class="sm:col-span-2 flex flex-col gap-2">
          ${SL.data.ratingBreakdown
            .map(
              (r) => `
            <div class="breakdown-row">
              <span class="text-muted">${r.stars} star${r.stars > 1 ? "s" : ""}</span>
              <span class="breakdown-track"><span class="breakdown-fill" data-value="${Math.round((r.count / maxCount) * 100)}"></span></span>
              <span class="text-right text-muted">${r.count}</span>
            </div>`
            )
            .join("")}
        </div>
      </div>

      <div class="flex flex-col gap-4">
        ${reviews.map((r) => SL.cards.reviewCard(r)).join("")}
      </div>`;
  }

  /* ---------- Sidebar ------------------------------------------------------------------ */
  function renderStats() {
    const profileStats = [
      { label: "Sessions completed", value: isSelf ? 38 : 52, icon: "calendar-check" },
      { label: "Response rate", value: "98%", icon: "clock" },
      { label: "Swap success rate", value: "96%", icon: "swap" },
      { label: "Credits earned", value: formatNumber(isSelf ? SL.store.getCredits() : profile.credits || 0), icon: "zap" },
    ];

    document.getElementById("profile-stats").innerHTML = `
      <h2 class="font-heading font-bold text-lg text-heading mb-4">Track record</h2>
      <ul class="grid grid-cols-2 gap-3 list-reset">
        ${profileStats
          .map(
            (s) => `
          <li class="rounded-soft border border-line bg-surface-2 p-3.5">
            <span class="text-link">${SL.icon(s.icon, "w-4 h-4")}</span>
            <p class="font-heading font-extrabold text-xl text-heading mt-1.5 leading-none">${esc(String(s.value))}</p>
            <p class="text-xs text-muted mt-1 leading-snug">${esc(s.label)}</p>
          </li>`
          )
          .join("")}
      </ul>`;
  }

  function renderBadges() {
    const list = SL.data.badges;
    document.getElementById("profile-badges").innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-4">
        <h2 id="badges-title" class="font-heading font-bold text-lg text-heading">Badges</h2>
        <span class="badge badge-accent">${list.filter((b) => b.earned).length}/${list.length}</span>
      </div>
      <ul class="flex flex-col gap-3 list-reset">
        ${list
          .map(
            (b) => `
          <li class="flex items-center gap-3 ${b.earned ? "" : "opacity-60"}">
            <span class="grid place-items-center w-9 h-9 rounded-soft shrink-0 border border-line ${b.earned ? "bg-surface-3 text-link" : "bg-surface-2 text-muted"}">
              ${SL.icon(b.icon, "w-4 h-4")}
            </span>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-heading truncate">${esc(b.name)}</p>
              <p class="text-xs text-muted truncate">${b.earned ? esc(b.earnedAt || "Earned") : "Locked"}</p>
            </div>
          </li>`
          )
          .join("")}
      </ul>`;
  }

  function renderCta() {
    const host = document.getElementById("profile-cta");
    const needsSetup = isSelf && profile.onboardingComplete === false;
    host.innerHTML = isSelf
      ? `
        <h2 class="font-heading font-bold text-lg text-heading mb-2">Your profile</h2>
        <p class="text-sm text-muted leading-body mb-4">This is exactly what other members see when you request a swap.</p>
        ${needsSetup
          ? `${SL.ui.alertBox("Finish setting up your profile — interests, skills and portfolio links.", "info")}
             <a href="onboarding.html" class="btn btn-primary btn-sm mt-4">Finish setup</a>`
          : ""}
        <div class="flex flex-col gap-2.5 ${needsSetup ? "mt-2.5" : ""}">
          <a href="dashboard.html" class="btn btn-outline btn-sm">Go to dashboard</a>
          <button type="button" class="btn btn-primary btn-sm" data-edit-profile>Edit profile</button>
        </div>`
      : `
        <h2 class="font-heading font-bold text-lg text-heading mb-2">Start an exchange</h2>
        <p class="text-sm text-muted leading-body mb-4">Send a swap request and settle the session in skill credits.</p>
        <div class="flex flex-col gap-2.5">
          <button type="button" class="btn btn-primary btn-sm" data-request-swap="${esc(profile.id)}">Request swap</button>
          <a href="chat.html" class="btn btn-outline btn-sm">Open a conversation</a>
        </div>
        <p class="text-xs text-muted mt-3">Usually replies within ${esc(String((profile.name || "").length % 5 || 4))} hours.</p>`;
  }

  /* ---------- Edit modal ---------------------------------------------------------------- */
  function openEditModal() {
    const offered = (profile.skillsOffered || []).join(", ");
    const wanted = (profile.skillsWanted || []).join(", ");

    /* Live local state so chips, links and colours can re-render inside the dialog. */
    let occ = profile.occupation || "";
    let interests = (profile.interests || []).slice();
    let hobbies = (profile.hobbies || []).slice();
    let links = (profile.portfolio || []).map((l) => ({ label: l.label || "", url: l.url || "" }));
    let tone = Number.isFinite(profile.tone) ? profile.tone : 0;
    let banner = profile.banner || "aurora";

    const LINK_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;
    const normalise = (raw) => {
      const v = String(raw || "").trim();
      if (!v || !LINK_RE.test(v)) return "";
      return /^https?:\/\//i.test(v) ? v : `https://${v}`;
    };

    SL.modal.open({
      title: "Edit profile",
      subtitle: "Changes are stored in this browser only.",
      size: "lg",
      body: `
        <div class="flex flex-col gap-5 pb-2">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label" for="ep-name">Full name</label>
              <input class="input" id="ep-name" value="${esc(profile.name)}" />
            </div>
            <div>
              <label class="label" for="ep-location">Location</label>
              <input class="input" id="ep-location" value="${esc(profile.location || "")}" placeholder="City, country" />
            </div>
          </div>
          <div>
            <label class="label" for="ep-headline">Headline</label>
            <input class="input" id="ep-headline" value="${esc(profile.headline || "")}" placeholder="e.g. Product designer & amateur pianist" />
          </div>
          <div>
            <label class="label" for="ep-bio">Bio</label>
            <textarea class="textarea" id="ep-bio" rows="3" placeholder="What do you teach, and what are you hoping to learn?">${esc(profile.bio || "")}</textarea>
          </div>

          <div class="pt-4 border-t border-line">
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-3">About you</p>
            <div class="grid sm:grid-cols-3 gap-4">
              <div>
                <label class="label" for="ep-occupation">I am a…</label>
                <select class="input" id="ep-occupation">
                  <option value="" ${!occ ? "selected" : ""}>Prefer not to say</option>
                  ${SL.data.occupations.map((o) => `<option value="${o.id}" ${occ === o.id ? "selected" : ""}>${esc(o.label)}</option>`).join("")}
                </select>
              </div>
              <div>
                <label class="label" for="ep-role" id="ep-role-label">Role</label>
                <input class="input" id="ep-role" value="${esc(profile.role || "")}" placeholder="e.g. Product designer" />
              </div>
              <div>
                <label class="label" for="ep-org" id="ep-org-label">Company / school</label>
                <input class="input" id="ep-org" value="${esc(profile.org || "")}" placeholder="e.g. Freelance" />
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-line">
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-3">Interests & hobbies</p>
            <div id="ep-interests"></div>
            <div id="ep-hobbies" class="mt-4"></div>
            <div class="flex items-end gap-2 mt-3">
              <div class="flex-1">
                <label class="label" for="ep-hobby">Add a hobby</label>
                <input class="input" id="ep-hobby" placeholder="e.g. Pottery" />
              </div>
              <button type="button" class="btn btn-outline btn-sm h-11 px-3" id="ep-hobby-add">${SL.icon("plus", "w-4 h-4")} Add</button>
            </div>
          </div>

          <div class="pt-4 border-t border-line">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="label" for="ep-offered">Skills offered</label>
                <input class="input" id="ep-offered" value="${esc(offered)}" placeholder="Comma separated" />
                <p class="hint">Shown as chips on your profile.</p>
              </div>
              <div>
                <label class="label" for="ep-wanted">Skills wanted</label>
                <input class="input" id="ep-wanted" value="${esc(wanted)}" placeholder="Comma separated" />
                <p class="hint">Used to improve your matches.</p>
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-line">
            <div class="flex items-center justify-between gap-3 mb-3">
              <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Portfolio & work links</p>
              <button type="button" class="text-sm font-semibold text-link hover:underline" id="ep-link-add">${SL.icon("plus", "w-4 h-4")} Add link</button>
            </div>
            <div id="ep-links"></div>
            <div id="ep-link-note" class="mt-1"></div>
          </div>

          <div class="pt-4 border-t border-line">
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-3">Make it yours</p>
            <div id="ep-appearance"></div>
          </div>
        </div>`,
      footer: `
        <button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" data-save-profile>Save changes</button>`,
      onMount(dialog, close) {
        /* ---------- sub-renderers ---------- */
        function chipsFor(hostId, items, selected, attr, iconLookup) {
          const host = dialog.querySelector(hostId);
          host.innerHTML = `<div class="flex flex-wrap gap-2">${items
            .map((item) => {
              const label = typeof item === "string" ? item : item.label;
              const on = selected.indexOf(label) !== -1;
              const icon = iconLookup ? iconLookup(label) : null;
              return `<button type="button" class="chip ${on ? "is-active" : ""}" aria-pressed="${on}" data-${attr}="${esc(label)}">
                ${icon ? SL.icon(icon, "w-4 h-4") : ""}${esc(label)}
              </button>`;
            })
            .join("")}</div>`;
        }

        function renderInterests() {
          chipsFor("#ep-interests", SL.data.interests, interests, "ep-interest",
            (label) => (SL.data.interestByLabel(label) || {}).icon);
          hostQueryAll("[data-ep-interest]").forEach((btn) =>
            btn.addEventListener("click", () => {
              const label = btn.dataset.epInterest;
              const i = interests.indexOf(label);
              if (i === -1) interests.push(label);
              else interests.splice(i, 1);
              renderInterests();
            })
          );
        }

        function renderHobbies() {
          const custom = hobbies.filter((h) => !SL.data.hobbyByLabel(h));
          chipsFor("#ep-hobbies", SL.data.hobbyPresets.concat(custom.map((label) => ({ label }))), hobbies, "ep-hobby-chip",
            (label) => (SL.data.hobbyByLabel(label) || {}).icon || "sparkles");
          hostQueryAll("[data-ep-hobby-chip]").forEach((btn) =>
            btn.addEventListener("click", () => {
              const label = btn.dataset.epHobbyChip;
              const i = hobbies.indexOf(label);
              if (i === -1) hobbies.push(label);
              else hobbies.splice(i, 1);
              renderHobbies();
            })
          );
        }

        function renderLinks() {
          const host = dialog.querySelector("#ep-links");
          host.innerHTML = links.length
            ? links
                .map(
                  (l, i) => `
            <div class="flex items-end gap-2 mb-3">
              <div class="flex-1 min-w-0">
                <input class="input" data-ep-link-label="${i}" value="${esc(l.label)}" placeholder="Label — e.g. Portfolio" aria-label="Link label ${i + 1}" />
              </div>
              <div class="flex-[2] min-w-0">
                <input class="input" data-ep-link-url="${i}" value="${esc(l.url)}" placeholder="https://…" aria-label="Link URL ${i + 1}" />
              </div>
              <button type="button" class="btn btn-outline btn-sm h-11 px-3" data-ep-link-remove="${i}" aria-label="Remove link">${SL.icon("x", "w-4 h-4")}</button>
            </div>`
                )
                .join("")
            : `<p class="text-sm text-muted">No links yet.</p>`;

          hostQueryAll("[data-ep-link-remove]").forEach((btn) =>
            btn.addEventListener("click", () => {
              readLinks();
              links.splice(Number(btn.dataset.epLinkRemove), 1);
              renderLinks();
              renderLinkNote();
            })
          );
        }

        function renderLinkNote() {
          const note = dialog.querySelector("#ep-link-note");
          const offeredNow = split(dialog.querySelector("#ep-offered").value);
          const required = SL.data.portfolioRequired(offeredNow);
          note.innerHTML = required
            ? SL.ui.alertBox(
                "Technology and design skills need at least one link to your work so members can check it before booking.",
                "warning"
              )
            : "";
        }

        function renderAppearance() {
          const host = dialog.querySelector("#ep-appearance");
          host.innerHTML = `
            <div class="flex flex-wrap gap-2.5">
              ${SL.ui.TONES.map(
                (t, i) => `
                <button type="button" data-ep-tone="${i}" aria-label="Colour ${i + 1}"
                  class="w-9 h-9 rounded-full grid place-items-center ${tone === i ? "ring-2 ring-offset-2 ring-sky-400" : ""}"
                  style="background:${t.bg};color:${t.fg}">${SL.icon("check", "w-4 h-4")}</button>`
              ).join("")}
            </div>
            <div class="flex flex-wrap gap-3 mt-4">
              ${SL.data.banners.map(
                (b) => `
                <button type="button" data-ep-banner="${b.id}" aria-label="${esc(b.label)} banner"
                  class="h-12 w-20 rounded-soft ${banner === b.id ? "ring-2 ring-offset-2 ring-sky-400" : ""}"
                  style="background:${b.css}"></button>`
              ).join("")}
            </div>`;

          hostQueryAll("[data-ep-tone]").forEach((btn) =>
            btn.addEventListener("click", () => {
              tone = Number(btn.dataset.epTone);
              renderAppearance();
            })
          );
          hostQueryAll("[data-ep-banner]").forEach((btn) =>
            btn.addEventListener("click", () => {
              banner = btn.dataset.epBanner;
              renderAppearance();
            })
          );
        }

        function readLinks() {
          hostQueryAll("[data-ep-link-label]").forEach((input) => {
            const i = Number(input.dataset.epLinkLabel);
            if (links[i]) links[i].label = input.value;
          });
          hostQueryAll("[data-ep-link-url]").forEach((input) => {
            const i = Number(input.dataset.epLinkUrl);
            if (links[i]) links[i].url = input.value;
          });
        }

        function hostQueryAll(sel) {
          return Array.from(dialog.querySelectorAll(sel));
        }

        const split = (v) => String(v || "").split(",").map((s) => s.trim()).filter(Boolean);

        renderInterests();
        renderHobbies();
        renderLinks();
        renderLinkNote();
        renderAppearance();

        const occSelect = dialog.querySelector("#ep-occupation");
        occSelect.addEventListener("change", () => {
          occ = occSelect.value;
          const conf = SL.data.occupationById(occ);
          dialog.querySelector("#ep-role-label").textContent = conf ? conf.roleLabel : "Role";
          dialog.querySelector("#ep-org-label").textContent = conf ? conf.orgLabel : "Company / school";
          dialog.querySelector("#ep-role").placeholder = conf ? conf.rolePlaceholder : "e.g. Product designer";
          dialog.querySelector("#ep-org").placeholder = conf ? conf.orgPlaceholder : "e.g. Freelance";
        });

        dialog.querySelector("#ep-offered").addEventListener("input", renderLinkNote);

        dialog.querySelector("#ep-link-add").addEventListener("click", () => {
          readLinks();
          links.push({ label: "", url: "" });
          renderLinks();
        });

        dialog.querySelector("#ep-hobby-add").addEventListener("click", () => {
          const input = dialog.querySelector("#ep-hobby");
          const value = input.value.trim();
          if (!value) return;
          if (hobbies.map((h) => h.toLowerCase()).indexOf(value.toLowerCase()) === -1) hobbies.push(value);
          input.value = "";
          renderHobbies();
        });

        /* ---------- save ---------- */
        const save = dialog.querySelector("[data-save-profile]");
        save.addEventListener("click", () => {
          const name = dialog.querySelector("#ep-name").value.trim();
          if (name.length < 2) {
            SL.toast("Please enter a name with at least two characters.", { type: "warning" });
            return;
          }

          readLinks();
          const rows = links.filter((l) => (l.label || l.url));
          const complete = rows.filter((l) => l.label.trim() && normalise(l.url));
          const skillsOffered = split(dialog.querySelector("#ep-offered").value);

          if (complete.length !== rows.length) {
            SL.toast("Each portfolio link needs both a label and a valid URL.", { type: "warning" });
            return;
          }
          if (SL.data.portfolioRequired(skillsOffered) && !complete.length) {
            SL.toast("Add at least one work link — it's required for the tech and design skills you offer.", { type: "warning" });
            return;
          }

          save.disabled = true;
          save.innerHTML = `<span class="spinner"></span> Saving…`;

          SL.store.saveProfile({
            name,
            headline: dialog.querySelector("#ep-headline").value.trim(),
            location: dialog.querySelector("#ep-location").value.trim(),
            bio: dialog.querySelector("#ep-bio").value.trim(),
            skillsOffered,
            skillsWanted: split(dialog.querySelector("#ep-wanted").value),
            occupation: occ,
            role: dialog.querySelector("#ep-role").value.trim(),
            org: dialog.querySelector("#ep-org").value.trim(),
            interests,
            hobbies,
            portfolio: complete.map((l) => ({ label: l.label.trim(), url: normalise(l.url) })),
            tone,
            banner,
            onboardingComplete: true,
          });
          const user = SL.store.getUser();
          if (user) SL.store.setUser(Object.assign({}, user, { name }));

          setTimeout(() => {
            close();
            profile = SL.store.getProfile();
            renderAll();
            SL.navbar.refreshAuth();
            SL.toast("Profile updated.", { type: "success" });
          }, 450);
        });
      },
    });
  }

  /* ---------- Boot ------------------------------------------------------------------------- */
  function renderAll() {
    renderHeader();
    renderAbout();
    renderPortfolio();
    renderDetails();
    renderSkills();
    renderReviews();
    renderStats();
    renderBadges();
    renderCta();
  }

  function init() {
    SL.navbar.render();
    SL.footer.render();

    const id = getParam("id");
    const me = SL.store.getProfile();

    if (id && id !== "me") {
      const member = SL.data.userById(id);
      if (member) {
        profile = member;
        isSelf = false;
      } else {
        window.location.replace("404.html");
        return;
      }
    } else if (me) {
      profile = me;
      isSelf = true;
    } else {
      // Signed out: show a public member profile as the default view.
      profile = SL.data.userById("u1");
      isSelf = false;
    }

    renderAll();
    SL.motion.initAll();

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-edit-profile]")) {
        if (!SL.store.isAuthenticated()) {
          SL.toast("Sign in to edit your profile.", { type: "warning" });
          window.location.href = "login.html?next=profile.html";
          return;
        }
        openEditModal();
      }

      const swapBtn = e.target.closest("[data-request-swap]");
      if (swapBtn && swapBtn.tagName === "BUTTON") {
        if (!SL.store.isAuthenticated()) {
          SL.toast("Sign in to request a swap.", { type: "warning" });
          window.location.href = "login.html?next=profile.html";
          return;
        }
        swapBtn.disabled = true;
        swapBtn.innerHTML = `${SL.icon("check", "w-4 h-4")} Requested`;
        SL.toast(`Swap request sent to ${profile.name}.`, { type: "success" });
      }

      const helpful = e.target.closest("[data-helpful]");
      if (helpful) {
        const count = helpful.querySelector("[data-helpful-count]");
        if (count && !helpful.dataset.done) {
          helpful.dataset.done = "1";
          count.textContent = Number(count.textContent) + 1;
          helpful.classList.add("text-link");
          SL.toast("Marked as helpful.", { type: "info", duration: 2000 });
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
