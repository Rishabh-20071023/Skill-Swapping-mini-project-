/* =============================================================================
   SkillLoom — UI primitives
   Small presentational builders shared by every page. Each returns an HTML
   string so pages can compose markup declaratively.
   ========================================================================== */

window.SL = window.SL || {};
SL.ui = SL.ui || {};

(function (SL) {
  "use strict";

  const { esc, initials } = SL.h;

  /* ---------- Avatars ---------------------------------------------------------- */
  /* Tinted initial avatars — no image requests, no external services. */
  const TONES = [
    { bg: "#E0F2FE", fg: "#0369A1" },
    { bg: "#E0E7FF", fg: "#4338CA" },
    { bg: "#CCFBF1", fg: "#0F766E" },
    { bg: "#FEF3C7", fg: "#B45309" },
    { bg: "#FCE7F3", fg: "#BE185D" },
    { bg: "#E2E8F0", fg: "#334155" },
  ];

  const SIZES = { xs: 24, sm: 32, md: 44, lg: 64, xl: 96 };

  /**
   * @param {{name:string, tone?:number}} user
   * @param {"xs"|"sm"|"md"|"lg"|"xl"} size
   */
  function avatar(user, size = "md", opts = {}) {
    const px = SIZES[size] || SIZES.md;
    const tone = TONES[(user && user.tone) || 0] || TONES[0];
    const dark = opts.dark;
    const style = dark
      ? `background:${tone.fg};color:${tone.bg};width:${px}px;height:${px}px;font-size:${Math.round(px * 0.36)}px`
      : `background:${tone.bg};color:${tone.fg};width:${px}px;height:${px}px;font-size:${Math.round(px * 0.36)}px`;
    const cls = `avatar ${opts.className || ""}`;
    const dot = opts.presence
      ? `<span class="avatar-presence${user && user.online ? "" : " is-away"}"></span>`
      : "";
    const inner = `<span class="${cls}" style="${style}" role="img" aria-label="${esc((user && user.name) || "Member")}">${esc(initials((user && user.name) || "?"))}</span>`;
    return opts.presence ? `<span class="avatar-wrap">${inner}${dot}</span>` : inner;
  }

  /* ---------- Chips / tags / badges --------------------------------------------- */
  const chip = (label, opts = {}) =>
    `<button type="button" class="chip ${opts.active ? "is-active" : ""} ${opts.cls || ""}"` +
    (opts.pressed !== undefined ? ` aria-pressed="${opts.pressed}"` : "") +
    (opts.dataset
      ? " " + Object.keys(opts.dataset).map((k) => `data-${k}="${esc(opts.dataset[k])}"`).join(" ")
      : "") +
    `>${opts.icon ? SL.icon(opts.icon, "w-4 h-4") : ""}${esc(label)}</button>`;

  const tag = (label, icon) =>
    `<span class="tag">${icon ? SL.icon(icon, "w-3.5 h-3.5") : ""}${esc(label)}</span>`;

  const badge = (label, variant = "neutral", icon) =>
    `<span class="badge badge-${variant}">${icon ? SL.icon(icon, "w-3.5 h-3.5") : ""}${esc(label)}</span>`;

  /** Skill-credit pill, used on cards and session rows. */
  const creditPill = (n, cls = "") =>
    `<span class="badge badge-accent ${cls}">${SL.icon("zap", "w-3.5 h-3.5")} ${esc(n)} credits</span>`;

  /* ---------- Icon tile ---------------------------------------------------------- */
  const iconTile = (name, tone = 0, cls = "w-11 h-11 rounded-soft") => {
    const t = TONES[tone % TONES.length];
    return `<span class="${cls} inline-grid place-items-center" style="background:${t.bg};color:${t.fg}">${SL.icon(name, "w-5 h-5")}</span>`;
  };

  /* ---------- Section header ------------------------------------------------------ */
  function sectionHeader(o) {
    const align = o.align === "center" ? "text-center items-center" : "text-left items-start";
    return `<div class="flex flex-col gap-4 ${align} max-w-2xl ${o.align === "center" ? "mx-auto" : ""}">
      ${o.eyebrow ? `<span class="eyebrow">${esc(o.eyebrow)}</span>` : ""}
      <h2 class="font-heading font-bold text-heading text-3xl sm:text-4xl tracking-tight leading-tight">${o.title}</h2>
      ${o.body ? `<p class="text-muted leading-body text-base sm:text-lg">${o.body}</p>` : ""}
    </div>`;
  }

  /* ---------- Loading skeletons ---------------------------------------------------- */
  function skillSkeletons(count = 6) {
    let out = "";
    for (let i = 0; i < count; i++) {
      out += `<div class="skeleton-card" aria-hidden="true">
        <div class="flex items-center gap-3">
          <div class="skeleton w-11 h-11 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="skeleton h-3 w-2/5"></div>
            <div class="skeleton h-3 w-2/5"></div>
          </div>
        </div>
        <div class="skeleton h-4 w-11/12 mt-2"></div>
        <div class="skeleton h-3 w-full"></div>
        <div class="skeleton h-3 w-4/5"></div>
        <div class="flex gap-2 pt-2">
          <div class="skeleton h-6 w-20 rounded-full"></div>
          <div class="skeleton h-6 w-24 rounded-full"></div>
        </div>
        <div class="flex items-center justify-between pt-3">
          <div class="skeleton h-8 w-28"></div>
          <div class="skeleton h-9 w-28 rounded-xl"></div>
        </div>
      </div>`;
    }
    return out;
  }

  /* ---------- Empty state ---------------------------------------------------------- */
  function emptyState(o) {
    return `<div class="empty-state">
      <span class="empty-icon">${SL.icon(o.icon || "inbox", "w-6 h-6")}</span>
      <h3 class="font-heading font-bold text-lg text-heading">${esc(o.title)}</h3>
      <p class="text-muted text-sm max-w-sm leading-body">${esc(o.body || "")}</p>
      ${o.action || ""}
    </div>`;
  }

  /* ---------- Inline alert ---------------------------------------------------------- */
  function alertBox(message, type = "info") {
    const map = {
      info: ["info", "badge-primary"],
      success: ["check-circle", "badge-success"],
      warning: ["alert", "badge-primary"],
      error: ["alert", "badge-primary"],
    };
    const conf = map[type] || map.info;
    return `<div class="flex items-start gap-3 rounded-soft border border-line bg-surface-2 p-4" role="${type === "error" ? "alert" : "status"}">
      <span class="text-link shrink-0 mt-0.5">${SL.icon(conf[0], "w-5 h-5")}</span>
      <p class="text-sm text-body leading-body">${message}</p>
    </div>`;
  }

  SL.ui = { TONES, SIZES, avatar, chip, tag, badge, creditPill, iconTile, sectionHeader, skillSkeletons, emptyState, alertBox };
})(window.SL);
