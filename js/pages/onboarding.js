/* =============================================================================
   SkillLoom — Onboarding controller (onboarding.html)
   A four-step wizard shown right after sign-up:
     1. Who you are        — professional / student / other (+ role & org)
     2. Interests+hobbies  — what you want to browse and trade
     3. Skills             — what you'll teach (drives the portfolio rule) and learn
     4. Proof of work      — portfolio links (required for tech & design teachers)
                             plus avatar colour and banner customisation

   Every step validates before advancing; "Finish later" saves what's filled in
   without marking the profile complete, so the flow re-opens on the next login.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, qs } = SL.h;

  const TOTAL_STEPS = 4;
  const STEP_TITLES = [
    "Who you are",
    "Interests & hobbies",
    "Skills to trade",
    "Your work & style",
  ];

  const LINK_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;

  /* ---------- Wizard state ---------------------------------------------------- */
  const state = {
    step: 0,
    occupation: "",
    role: "",
    org: "",
    interests: [],
    hobbies: [],
    customHobby: "",
    skillsOffered: [],
    skillsWanted: [],
    portfolio: [],
    banner: "aurora",
    tone: 0,
  };

  const els = {};

  /* ---------- Helpers ------------------------------------------------------------ */
  function cacheEls() {
    els.progress = qs("#ob-progress");
    els.host = qs("#ob-step-host");
    els.error = qs("#ob-error");
    els.back = qs("#ob-back");
    els.next = qs("#ob-next");
    els.later = qs("#ob-later");
  }

  function showError(message) {
    els.error.hidden = false;
    els.error.innerHTML = SL.ui.alertBox(message, "error");
  }

  function clearError() {
    els.error.hidden = true;
    els.error.innerHTML = "";
  }

  /** Normalise a pasted link to a full https:// URL, or return "" when invalid. */
  function normaliseUrl(raw) {
    const value = String(raw || "").trim();
    if (!value || !LINK_RE.test(value)) return "";
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }

  /* ---------- Progress ------------------------------------------------------------- */
  function renderProgress() {
    els.progress.innerHTML = `
      <div class="flex items-center gap-3">
        ${STEP_TITLES.map((title, i) => {
          const done = i < state.step;
          const active = i === state.step;
          return `
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="grid place-items-center w-7 h-7 rounded-full shrink-0 text-xs font-bold
                  ${done ? "bg-sky-500 text-white" : active ? "bg-sky-500/15 text-link border border-sky-400/50" : "bg-surface-3 text-muted border border-line"}">
                  ${done ? SL.icon("check", "w-3.5 h-3.5") : i + 1}
                </span>
                <span class="hidden sm:block text-xs font-semibold truncate ${active ? "text-heading" : "text-muted"}">${esc(title)}</span>
              </div>
              <span class="block h-1 mt-2 rounded-full ${i <= state.step ? "bg-sky-500" : "bg-surface-3"}"></span>
            </div>`;
        }).join("")}
      </div>`;
  }

  /* ---------- Step 1 — occupation ---------------------------------------------------- */
  function renderStep1() {
    const occ = SL.data.occupationById(state.occupation);
    return `
      <h2 class="font-heading font-bold text-xl text-heading">Which best describes you?</h2>
      <p class="text-sm text-muted mt-1 leading-body">This shows on your profile so members know where you're coming from.</p>

      <div class="grid sm:grid-cols-3 gap-3 mt-5" role="radiogroup" aria-label="Occupation">
        ${SL.data.occupations.map((o) => `
          <button type="button" role="radio" aria-checked="${state.occupation === o.id}"
            data-occ="${o.id}"
            class="text-left rounded-soft border p-4 transition-colors
              ${state.occupation === o.id ? "border-sky-400 bg-sky-500/10" : "border-line bg-surface hover:bg-surface-2"}">
            <span class="grid place-items-center w-10 h-10 rounded-soft border border-line
              ${state.occupation === o.id ? "bg-surface text-link" : "bg-surface-2 text-muted"}">${SL.icon(o.icon, "w-5 h-5")}</span>
            <p class="font-semibold text-heading mt-3">${esc(o.label)}</p>
            <p class="text-xs text-muted mt-1 leading-snug">${esc(o.hint)}</p>
          </button>`).join("")}
      </div>

      ${occ ? `
        <div class="grid sm:grid-cols-2 gap-4 mt-6">
          <div>
            <label class="label" for="ob-role">${esc(occ.roleLabel)}</label>
            <input class="input" id="ob-role" value="${esc(state.role)}" placeholder="${esc(occ.rolePlaceholder)}" />
          </div>
          <div>
            <label class="label" for="ob-org">${esc(occ.orgLabel)}</label>
            <input class="input" id="ob-org" value="${esc(state.org)}" placeholder="${esc(occ.orgPlaceholder)}" />
          </div>
        </div>` : ""}`;
  }

  /* ---------- Step 2 — interests & hobbies ---------------------------------------------- */
  function chipRow(items, selected, attr) {
    return `<div class="flex flex-wrap gap-2">${items.map((item) => {
      const on = selected.indexOf(item.label) !== -1;
      return `<button type="button" class="chip ${on ? "is-active" : ""}" aria-pressed="${on}" data-${attr}="${esc(item.label)}">
        ${item.icon ? SL.icon(item.icon, "w-4 h-4") : ""}${esc(item.label)}
      </button>`;
    }).join("")}</div>`;
  }

  function renderStep2() {
    return `
      <h2 class="font-heading font-bold text-xl text-heading">What are you into?</h2>
      <p class="text-sm text-muted mt-1 leading-body">Pick a few fields you'd like to explore. Members teaching these skills will be surfaced to you first.</p>

      <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mt-6 mb-2.5">Fields of interest</p>
      ${chipRow(SL.data.interests, state.interests, "interest")}

      <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mt-6 mb-2.5">Hobbies</p>
      ${chipRow(SL.data.hobbyPresets, state.hobbies, "hobby")}

      <div class="flex items-end gap-2 mt-4">
        <div class="flex-1">
          <label class="label" for="ob-hobby">Add your own</label>
          <input class="input" id="ob-hobby" value="${esc(state.customHobby)}" placeholder="e.g. Pottery, Chess, Marathon running" />
        </div>
        <button type="button" class="btn btn-outline btn-sm" id="ob-hobby-add">${SL.icon("plus", "w-4 h-4")} Add</button>
      </div>

      ${state.hobbies.filter((h) => !SL.data.hobbyByLabel(h)).length
        ? `<div class="flex flex-wrap gap-2 mt-3">${state.hobbies.filter((h) => !SL.data.hobbyByLabel(h)).map((h) => `
            <span class="tag" style="background:rgba(99,102,241,.10);border-color:rgba(99,102,241,.35);color:var(--c-accent-strong);font-weight:600">
              ${esc(h)}
              <button type="button" class="hover:text-danger transition-colors" data-hobby-remove="${esc(h)}" aria-label="Remove ${esc(h)}">${SL.icon("x", "w-3.5 h-3.5")}</button>
            </span>`).join("")}</div>`
        : ""}`;
  }

  /* ---------- Step 3 — skills -------------------------------------------------------------- */
  function skillGroups() {
    const groups = {};
    SL.data.teachSkills.forEach((s) => {
      (groups[s.category] = groups[s.category] || []).push(s);
    });
    return groups;
  }

  function renderStep3() {
    const groups = skillGroups();
    return `
      <h2 class="font-heading font-bold text-xl text-heading">What will you trade?</h2>
      <p class="text-sm text-muted mt-1 leading-body">Choose the skills you can teach and the ones you want to learn.</p>

      <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mt-6 mb-2.5">I can teach</p>
      ${Object.keys(groups).map((cat) => `
        <div class="mb-3">
          <p class="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">${esc(cat)}</p>
          ${chipRow(groups[cat], state.skillsOffered, "teach")}
        </div>`).join("")}

      <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mt-6 mb-2.5">I want to learn</p>
      ${chipRow(SL.data.teachSkills, state.skillsWanted, "learn")}

      ${SL.data.portfolioRequired(state.skillsOffered)
        ? `<div class="mt-5">${SL.ui.alertBox(
            "Because you chose technology or design skills, you'll add a link to your work in the next step so members can check it out.",
            "info")}</div>`
        : ""}`;
  }

  /* ---------- Step 4 — portfolio & customisation -------------------------------------------- */
  function linkRow(link, i) {
    return `
      <div class="flex items-end gap-2 mb-3" data-link-row="${i}">
        <div class="flex-1 min-w-0">
          <label class="label" for="ob-link-label-${i}">Link label</label>
          <input class="input" id="ob-link-label-${i}" data-link-label="${i}" value="${esc(link.label)}" placeholder="e.g. Portfolio site, Behance, GitHub" />
        </div>
        <div class="flex-[2] min-w-0">
          <label class="label" for="ob-link-url-${i}">URL</label>
          <input class="input" id="ob-link-url-${i}" data-link-url="${i}" value="${esc(link.url)}" placeholder="https://…" />
        </div>
        <button type="button" class="btn btn-outline btn-sm h-11 px-3" data-link-remove="${i}" aria-label="Remove link">${SL.icon("x", "w-4 h-4")}</button>
      </div>`;
  }

  function renderStep4() {
    const required = SL.data.portfolioRequired(state.skillsOffered);
    const reasons = SL.data.portfolioReason(state.skillsOffered);
    const banners = SL.data.banners;
    const tones = SL.ui.TONES;

    return `
      <h2 class="font-heading font-bold text-xl text-heading">Your work & profile style</h2>
      <p class="text-sm text-muted mt-1 leading-body">
        ${required
          ? `Skills like ${reasons.map((r) => esc(r)).join(" and ")} need proof of work — add at least one link so others can see what you do before they book you.`
          : "Sharing a portfolio is optional for your skills, but it helps build trust with members who want to learn from you."}
      </p>

      <div class="mt-6">
        <div class="flex items-center justify-between gap-3 mb-3">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Portfolio & work links</p>
          <button type="button" class="text-sm font-semibold text-link hover:underline" id="ob-link-add">${SL.icon("plus", "w-4 h-4")} Add link</button>
        </div>
        <div id="ob-links">${state.portfolio.map((l, i) => linkRow(l, i)).join("")}</div>
        ${state.portfolio.length === 0
          ? `<p class="text-sm text-muted" id="ob-no-links">No links yet.${required ? " Add at least one to continue." : ""}</p>`
          : ""}
      </div>

      <div class="mt-8 pt-6 border-t border-line">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-3">Profile colour</p>
        <div class="flex flex-wrap gap-2.5">
          ${tones.map((t, i) => `
            <button type="button" data-tone="${i}" aria-label="Colour ${i + 1}"
              class="w-9 h-9 rounded-full grid place-items-center transition-transform ${state.tone === i ? "ring-2 ring-offset-2 ring-sky-400" : "hover:scale-110"}"
              style="background:${t.bg};color:${t.fg}">
              ${SL.icon("check", "w-4 h-4")}
            </button>`).join("")}
        </div>

        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-muted mt-6 mb-3">Profile banner</p>
        <div class="flex flex-wrap gap-3">
          ${banners.map((b) => `
            <button type="button" data-banner="${b.id}" aria-label="${esc(b.label)} banner"
              class="h-14 w-24 rounded-soft transition-transform ${state.banner === b.id ? "ring-2 ring-offset-2 ring-sky-400" : "hover:scale-105"}"
              style="background:${b.css}"></button>`).join("")}
        </div>

        <div class="mt-6 rounded-soft border border-line bg-surface-2 p-4">
          <p class="text-sm font-semibold text-heading mb-3">Preview</p>
          <div class="rounded-soft overflow-hidden border border-line">
            <div class="h-12" style="background:${SL.data.bannerCss(state.banner)}"></div>
            <div class="p-4 flex items-center gap-3">
              ${SL.ui.avatar({ name: state.role || "You", tone: state.tone }, "lg")}
              <div class="min-w-0">
                <p class="font-semibold text-heading truncate">${esc(state.role || "Your name")}</p>
                <p class="text-xs text-muted truncate">${esc(SL.data.occupationById(state.occupation)?.label || "Your headline")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  /* ---------- Render dispatch ------------------------------------------------ */
  function render() {
    renderProgress();
    clearError();
    const steps = [renderStep1, renderStep2, renderStep3, renderStep4];
    els.host.innerHTML = steps[state.step]();
    els.back.disabled = state.step === 0;
    els.back.style.visibility = state.step === 0 ? "hidden" : "visible";
    els.next.innerHTML = state.step === TOTAL_STEPS - 1 ? "Finish setup" : "Continue";
    wireStep();
    SL.motion.initAll();
  }

  /* ---------- Per-step wiring -------------------------------------------------- */
  function wireStep() {
    // Step 1 — occupation + detail inputs
    els.host.querySelectorAll("[data-occ]").forEach((btn) =>
      btn.addEventListener("click", () => {
        if (state.occupation !== btn.dataset.occ) {
          state.occupation = btn.dataset.occ;
          state.role = "";
          state.org = "";
        }
        render();
      })
    );
    const roleInput = qs("#ob-role");
    if (roleInput) roleInput.addEventListener("input", (e) => (state.role = e.target.value));
    const orgInput = qs("#ob-org");
    if (orgInput) orgInput.addEventListener("input", (e) => (state.org = e.target.value));

    // Step 2 — interest & hobby chips
    els.host.querySelectorAll("[data-interest]").forEach((btn) =>
      btn.addEventListener("click", () => {
        toggle(state.interests, btn.dataset.interest);
        render();
      })
    );
    els.host.querySelectorAll("[data-hobby]").forEach((btn) =>
      btn.addEventListener("click", () => {
        toggle(state.hobbies, btn.dataset.hobby);
        render();
      })
    );
    els.host.querySelectorAll("[data-hobby-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        state.hobbies = state.hobbies.filter((h) => h !== btn.dataset.hobbyRemove);
        render();
      })
    );
    const hobbyInput = qs("#ob-hobby");
    if (hobbyInput) hobbyInput.addEventListener("input", (e) => (state.customHobby = e.target.value));
    const hobbyAdd = qs("#ob-hobby-add");
    if (hobbyAdd)
      hobbyAdd.addEventListener("click", () => {
        const value = state.customHobby.trim();
        if (!value) return;
        if (state.hobbies.map((h) => h.toLowerCase()).indexOf(value.toLowerCase()) === -1) {
          state.hobbies.push(value);
        }
        state.customHobby = "";
        render();
      });

    // Step 3 — teach / learn chips
    els.host.querySelectorAll("[data-teach]").forEach((btn) =>
      btn.addEventListener("click", () => {
        toggle(state.skillsOffered, btn.dataset.teach);
        render();
      })
    );
    els.host.querySelectorAll("[data-learn]").forEach((btn) =>
      btn.addEventListener("click", () => {
        toggle(state.skillsWanted, btn.dataset.learn);
        render();
      })
    );

    // Step 4 — portfolio rows, tones, banners
    const linkAdd = qs("#ob-link-add");
    if (linkAdd)
      linkAdd.addEventListener("click", () => {
        readLinks();
        state.portfolio.push({ label: "", url: "" });
        render();
      });
    els.host.querySelectorAll("[data-link-remove]").forEach((btn) =>
      btn.addEventListener("click", () => {
        readLinks();
        state.portfolio.splice(Number(btn.dataset.linkRemove), 1);
        render();
      })
    );
    els.host.querySelectorAll("[data-tone]").forEach((btn) =>
      btn.addEventListener("click", () => {
        readLinks(); // keep typed link text across the re-render
        state.tone = Number(btn.dataset.tone);
        render();
      })
    );
    els.host.querySelectorAll("[data-banner]").forEach((btn) =>
      btn.addEventListener("click", () => {
        readLinks();
        state.banner = btn.dataset.banner;
        render();
      })
    );
    // Link rows — keep state live so no re-render can lose what's typed.
    els.host.querySelectorAll("[data-link-label]").forEach((input) =>
      input.addEventListener("input", readLinks)
    );
    els.host.querySelectorAll("[data-link-url]").forEach((input) =>
      input.addEventListener("input", readLinks)
    );
  }

  function toggle(list, value) {
    const i = list.indexOf(value);
    if (i === -1) list.push(value);
    else list.splice(i, 1);
  }

  /** Pull the live link inputs back into state before a re-render. */
  function readLinks() {
    els.host.querySelectorAll("[data-link-label]").forEach((input) => {
      const row = Number(input.dataset.linkLabel);
      if (state.portfolio[row]) state.portfolio[row].label = input.value;
    });
    els.host.querySelectorAll("[data-link-url]").forEach((input) => {
      const row = Number(input.dataset.linkUrl);
      if (state.portfolio[row]) state.portfolio[row].url = input.value;
    });
  }

  /* ---------- Validation ------------------------------------------------------------ */
  function validateStep() {
    if (state.step === 0) {
      if (!state.occupation) {
        showError("Pick the option that best describes you to continue.");
        return false;
      }
      return true;
    }
    if (state.step === 1) {
      if (!state.interests.length) {
        showError("Choose at least one field of interest — you can always change this later.");
        return false;
      }
      return true;
    }
    if (state.step === 2) {
      if (!state.skillsOffered.length) {
        showError("Choose at least one skill you can teach. If none apply yet, pick something you're one step ahead on.");
        return false;
      }
      return true;
    }
    // Step 4 — portfolio rules
    readLinks();
    state.portfolio = state.portfolio.filter((l) => (l.label || l.url));
    const required = SL.data.portfolioRequired(state.skillsOffered);
    const filled = state.portfolio.filter((l) => l.label.trim() && normaliseUrl(l.url));

    if (required && !filled.length) {
      showError("Members teaching technology or design skills need at least one working link to their work — add the label and URL, then continue.");
      return false;
    }
    if (state.portfolio.length && filled.length !== state.portfolio.length) {
      showError("One of your links is incomplete — each row needs both a label and a valid URL (like https://yoursite.com). ");
      return false;
    }
    return true;
  }

  /* ---------- Save ---------------------------------------------------------------------- */
  function save(complete) {
    readLinks();
    const links = state.portfolio
      .filter((l) => l.label.trim() && normaliseUrl(l.url))
      .map((l) => ({ label: l.label.trim(), url: normaliseUrl(l.url) }));

    SL.store.saveProfile({
      occupation: state.occupation,
      role: state.role.trim(),
      org: state.org.trim(),
      interests: state.interests.slice(),
      hobbies: state.hobbies.slice(),
      skillsOffered: state.skillsOffered.slice(),
      skillsWanted: state.skillsWanted.slice(),
      portfolio: links,
      banner: state.banner,
      tone: state.tone,
      onboardingComplete: complete,
    });
  }

  /* ---------- Boot ------------------------------------------------------------------------- */
  function init() {
    SL.navbar.render();
    SL.footer.render();
    cacheEls();

    // Signed out → back to the sign-up form.
    if (!SL.store.isAuthenticated()) {
      window.location.replace("login.html?next=onboarding.html");
      return;
    }

    // Already set up → dashboard.
    const existing = SL.store.getProfile();
    if (existing && existing.onboardingComplete) {
      window.location.replace("dashboard.html");
      return;
    }

    // Resume any half-finished answers. Use the raw patch (what this member
    // actually saved) so seeded demo-template values can't fake a finished step.
    const saved = (SL.store.getProfilePatch && SL.store.getProfilePatch()) || {};
    if (saved) {
      state.occupation = saved.occupation || "";
      state.role = saved.role || "";
      state.org = saved.org || "";
      state.interests = Array.isArray(saved.interests) ? saved.interests.slice() : [];
      state.hobbies = Array.isArray(saved.hobbies) ? saved.hobbies.slice() : [];
      state.skillsOffered = Array.isArray(saved.skillsOffered) ? saved.skillsOffered.slice() : [];
      state.skillsWanted = Array.isArray(saved.skillsWanted) ? saved.skillsWanted.slice() : [];
      state.portfolio = Array.isArray(saved.portfolio) ? saved.portfolio.map((l) => ({ label: l.label || "", url: l.url || "" })) : [];
      state.banner = saved.banner || "aurora";
      state.tone = Number.isFinite(saved.tone) ? saved.tone : 0;

      // Resume at the first step whose answers are still missing.
      if (!state.occupation) state.step = 0;
      else if (!state.interests.length) state.step = 1;
      else if (!state.skillsOffered.length) state.step = 2;
      else state.step = 3;
    }

    render();

    els.back.addEventListener("click", () => {
      if (state.step > 0) {
        state.step -= 1;
        render();
      }
    });

    els.next.addEventListener("click", () => {
      if (!validateStep()) return;
      if (state.step < TOTAL_STEPS - 1) {
        // Persist what's been answered so a refresh resumes where the member left off.
        save(false);
        state.step += 1;
        render();
        window.scrollTo({ top: 0, behavior: SL.h.prefersReducedMotion() ? "auto" : "smooth" });
        return;
      }

      els.next.disabled = true;
      els.next.innerHTML = `<span class="spinner"></span> Saving…`;
      save(true);
      SL.toast("Profile set up — welcome to SkillLoom!", { type: "success" });
      setTimeout(() => window.location.replace("dashboard.html"), 800);
    });

    els.later.addEventListener("click", () => {
      save(false);
      SL.toast("Progress saved — finish setup whenever you like.", { type: "info" });
      setTimeout(() => window.location.replace("dashboard.html"), 500);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
