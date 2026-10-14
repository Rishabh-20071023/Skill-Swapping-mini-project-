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

    host.innerHTML = `
      <div class="gradient-navy h-24 sm:h-28 relative overflow-hidden" aria-hidden="true">
        <div class="absolute inset-0 opacity-40" style="background-image:radial-gradient(circle at 20% 30%, rgba(56,189,248,.5), transparent 45%), radial-gradient(circle at 80% 70%, rgba(99,102,241,.45), transparent 45%)"></div>
      </div>

      <div class="px-6 sm:px-8 pb-6 sm:pb-7 -mt-12 sm:-mt-14">
        <div class="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div class="shrink-0">${SL.ui.avatar(profile, "xl", { presence: true, className: "ring-4 ring-surface" })}</div>

          <div class="flex-1 min-w-0 pb-1">
            <div class="flex flex-wrap items-center gap-2.5">
              <h1 class="font-heading font-extrabold text-2xl sm:text-3xl text-heading tracking-tight">${esc(profile.name)}</h1>
              <span class="badge badge-accent">${esc(profile.level || "Member")}</span>
            </div>
            <p class="text-muted mt-1">${esc(profile.headline || "")}</p>
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
    host.innerHTML = isSelf
      ? `
        <h2 class="font-heading font-bold text-lg text-heading mb-2">Your profile</h2>
        <p class="text-sm text-muted leading-body mb-4">This is exactly what other members see when you request a swap.</p>
        <div class="flex flex-col gap-2.5">
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

    SL.modal.open({
      title: "Edit profile",
      subtitle: "Changes are stored in this browser only.",
      body: `
        <div class="flex flex-col gap-4 pb-2">
          <div>
            <label class="label" for="ep-name">Full name</label>
            <input class="input" id="ep-name" value="${esc(profile.name)}" />
          </div>
          <div>
            <label class="label" for="ep-headline">Headline</label>
            <input class="input" id="ep-headline" value="${esc(profile.headline || "")}" placeholder="e.g. Product designer & amateur pianist" />
          </div>
          <div>
            <label class="label" for="ep-location">Location</label>
            <input class="input" id="ep-location" value="${esc(profile.location || "")}" placeholder="City, country" />
          </div>
          <div>
            <label class="label" for="ep-bio">Bio</label>
            <textarea class="textarea" id="ep-bio" rows="4" placeholder="What do you teach, and what are you hoping to learn?">${esc(profile.bio || "")}</textarea>
          </div>
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
        </div>`,
      footer: `
        <button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" data-save-profile>Save changes</button>`,
      onMount(dialog, close) {
        const save = dialog.querySelector("[data-save-profile]");
        save.addEventListener("click", () => {
          const name = dialog.querySelector("#ep-name").value.trim();
          if (name.length < 2) {
            SL.toast("Please enter a name with at least two characters.", { type: "warning" });
            return;
          }
          save.disabled = true;
          save.innerHTML = `<span class="spinner"></span> Saving…`;

          const split = (v) => v.split(",").map((s) => s.trim()).filter(Boolean);
          SL.store.saveProfile({
            name,
            headline: dialog.querySelector("#ep-headline").value.trim(),
            location: dialog.querySelector("#ep-location").value.trim(),
            bio: dialog.querySelector("#ep-bio").value.trim(),
            skillsOffered: split(dialog.querySelector("#ep-offered").value),
            skillsWanted: split(dialog.querySelector("#ep-wanted").value),
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
