/* =============================================================================
   SkillLoom — Icon system
   A small registry of inline SVG icons (24×24, 1.75 stroke) so the UI never
   depends on an icon font or emoji. Usage:

     SL.icon("search")                       → string of SVG markup
     SL.icon("star", "w-4 h-4", { fill: true })
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  /* Inner markup only — the wrapper is added by icon(). Paths are lucide-style. */
  const PATHS = {
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.2-4.2"/>',
    star: '<path d="M12 2.6l2.9 5.88 6.5.95-4.7 4.58 1.11 6.47L12 17.42l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95z"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    "message-circle": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    "share-2": '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    "calendar-check": '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    wallet: '<path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/><path d="M17 13h.01"/>',
    award: '<circle cx="12" cy="8" r="5.5"/><path d="M8.6 12.9 7 22l5-2.8L17 22l-1.6-9.1"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.6V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.6V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0Z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    palette: '<path d="M12 22a10 10 0 1 1 10-10 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8Z"/><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/>',
    music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a15 15 0 0 1 0 19 15 15 0 0 1 0-19"/>',
    utensils: '<path d="M3 2v7a3 3 0 0 0 3 3 3 3 0 0 0 3-3V2M6 12v10M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7"/>',
    dumbbell: '<path d="m6.5 6.5 11 11M21 21l-1-1M3 3l1 1M18 22l4-4M2 6l4-4M3 10l7-7M14 21l7-7"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    "pen-line": '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    pencil: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
    "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
    "arrow-left": '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    "arrow-up-right": '<path d="M7 17 17 7M8 7h9v9"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    "check-circle": '<circle cx="12" cy="12" r="9.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    video: '<path d="m22 8-5 4 5 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
    "trending-up": '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
    sparkles: '<path d="m12 3-1.9.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/><path d="M19 3v3M20.5 4.5h-3M5 17v2M6 18H4"/>',
    filter: '<path d="M21.5 3.5H2.5l7.6 9v6.5l3.8 2v-8.5Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    "external-link": '<path d="M15 3h6v6M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "map-pin": '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z"/>',
    "thumbs-up": '<path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    "file-text": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M16 13H8M16 17H8M10 9H8"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
    "graduation-cap": '<path d="M21.4 10.9a1 1 0 0 0 0-1.8L12.8 5.2a2 2 0 0 0-1.6 0L2.6 9.1a1 1 0 0 0 0 1.8l8.6 3.9a2 2 0 0 0 1.6 0Z"/><path d="M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/><circle cx="12" cy="13" r="3"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z"/>',
    coffee: '<path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M9.9 9.9a3 3 0 1 0 4.2 4.2"/><path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a13.2 13.2 0 0 1-1.7 2.7"/><path d="M6.6 6.6A13.5 13.5 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="m2 2 20 20"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16.5V11M12 7.5h.01"/>',
    alert: '<path d="m21.7 18-8-14a2 2 0 0 0-3.5 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4M12 17h.01"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.5 0 4.9 1 6.7 2.7L21 8"/><path d="M21 3v5h-5"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/>',
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3Z"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z"/><path d="M4 22v-7"/>',
    target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    swap: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
    crown: '<path d="M11.6 3.5a.5.5 0 0 1 .8 0l2.4 4.5.9-1.5a.5.5 0 0 1 .6.7L17.7 12l1.7 4.8a.5.5 0 0 1-.7.6L12 15.7l-6.7 1.7a.5.5 0 0 1-.7-.6L6.4 12 1.6 7.2a.5.5 0 0 1 .7-.7l4.9 1.5Z"/><path d="M6 19.5h12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    "dots-horizontal": '<circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/><circle cx="5" cy="12" r="1.4"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    at: '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.9 7.9"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
    "bar-chart": '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-3"/>',
  };

  let counter = 0;

  /**
   * Render an icon.
   * @param {string} name  key in PATHS
   * @param {string} [cls] extra classes, e.g. "w-5 h-5"
   * @param {{fill?: boolean, strokeWidth?: number}} [opts]
   */
  function icon(name, cls = "w-5 h-5", opts = {}) {
    const body = PATHS[name] || PATHS.info;
    const filled = opts.fill === true;
    const stroke = opts.strokeWidth || 1.75;
    const ariaHidden = opts.title
      ? `role="img" aria-label="${String(opts.title).replace(/"/g, "&quot;")}"`
      : 'aria-hidden="true"';
    return `<svg viewBox="0 0 24 24" ${ariaHidden} class="${cls}" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }

  /** Multi-path brand-ish logo mark (loom = two crossing threads of exchange). */
  function logo(size = 34) {
    counter += 1;
    const gid = `sl-grad-${counter}`;
    return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0EA5E9"/><stop offset="1" stop-color="#6366F1"/>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#${gid})"/>
      <path d="M8.5 21.5C12 11.5 20 11.5 23.5 21.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".95"/>
      <path d="M8.5 10.5C12 20.5 20 20.5 23.5 10.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>
    </svg>`;
  }

  /** Social glyphs for the footer. */
  const SOCIAL = {
    x: '<path d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.2l-4.9-6.4L5.1 21H2l7.3-8.3L2.4 3h6.4l4.4 5.8L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z"/>',
    linkedin: '<path d="M6.94 8.5v12.5H3V8.5h3.94ZM5 3a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 5 3Zm4.5 5.5h3.77v1.71h.05c.53-.95 1.82-1.96 3.75-1.96 4 0 4.74 2.5 4.74 5.76v6.99h-3.94v-6.2c0-1.48-.03-3.38-2.06-3.38-2.06 0-2.38 1.6-2.38 3.27v6.31H9.5V8.5Z"/>',
    github: '<path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.47.09.65-.2.65-.45v-1.6c-2.64.57-3.2-1.27-3.2-1.27-.43-1.1-1.06-1.4-1.06-1.4-.86-.6.07-.58.07-.58.96.07 1.46 1 1.46 1 .85 1.46 2.23 1.04 2.78.8.08-.62.33-1.04.6-1.28-2.1-.24-4.32-1.05-4.32-4.69 0-1.04.37-1.89.98-2.55-.1-.24-.43-1.2.09-2.51 0 0 .8-.26 2.62.98a9.1 9.1 0 0 1 4.78 0c1.82-1.24 2.62-.98 2.62-.98.52 1.31.19 2.27.1 2.51.6.66.97 1.51.97 2.55 0 3.65-2.23 4.44-4.34 4.68.34.3.65.88.65 1.78v2.63c0 .25.17.55.66.45A9.5 9.5 0 0 0 12 2.5Z"/>',
    youtube: '<path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3-5.2 3Z"/>',
  };

  function social(name, cls = "w-[18px] h-[18px]") {
    const body = SOCIAL[name] || SOCIAL.x;
    return `<svg viewBox="0 0 24 24" aria-hidden="true" class="${cls}" fill="currentColor">${body}</svg>`;
  }

  /** Read-only star row (rendering only — see components/rating.js for the interactive one). */
  function starRow(rating, size = "w-4 h-4") {
    let out = '<span class="stars-readonly" aria-hidden="true">';
    for (let i = 1; i <= 5; i++) {
      const fill = rating >= i - 0.25 ? 100 : rating >= i - 0.75 ? 55 : 0;
      out += `<svg viewBox="0 0 24 24" class="${size}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
        <defs><linearGradient id="sg${i}-${counter}${i}"><stop offset="${fill}%" stop-color="currentColor"/><stop offset="${fill}%" stop-color="transparent"/></linearGradient></defs>
        <path d="M12 2.6l2.9 5.88 6.5.95-4.7 4.58 1.11 6.47L12 17.42l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95z" fill="url(#sg${i}-${counter}${i})"/>
      </svg>`;
    }
    counter += 1;
    return out + "</span>";
  }

  SL.icon = icon;
  SL.logo = logo;
  SL.social = social;
  SL.starRow = starRow;
})(window.SL);
