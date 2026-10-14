/* =============================================================================
   SkillLoom — Helper utilities
   Tiny dependency-free helpers used throughout the UI layer.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  /** querySelector shorthand */
  const qs = (sel, root = document) => root.querySelector(sel);

  /** querySelectorAll shorthand → Array */
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** addEventListener shorthand */
  const on = (el, ev, fn, opts) => {
    if (el) el.addEventListener(ev, fn, opts);
    return () => el && el.removeEventListener(ev, fn, opts);
  };

  /** Escape a value for safe interpolation into HTML strings. */
  function esc(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Trailing-edge debounce. */
  function debounce(fn, wait = 250) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;

  /** 12480 → "12,480" */
  function formatNumber(n) {
    return Number(n || 0).toLocaleString("en-US");
  }

  /** Compact stat formatting for the landing page: 12480 → "12.4K" */
  function formatCompact(n) {
    if (n >= 1000) {
      const v = n / 1000;
      return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + "K";
    }
    return String(n);
  }

  /** ISO string → "14 Oct 2026" */
  function formatDate(iso, opts) {
    const d = iso instanceof Date ? iso : new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", Object.assign({ day: "numeric", month: "short", year: "numeric" }, opts));
  }

  /** ISO string → "09:30" */
  function formatTime(iso) {
    const d = iso instanceof Date ? iso : new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  /** "14 Oct 2026, 09:30" */
  function formatDateTime(iso) {
    return `${formatDate(iso)} · ${formatTime(iso)}`;
  }

  /** Relative time such as "3h ago" / "Just now". */
  function timeAgo(iso) {
    const d = iso instanceof Date ? iso : new Date(iso);
    const diff = Math.max(0, Date.now() - d.getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
  }

  /** "Ada Lovelace" → "AL" */
  function initials(name) {
    return String(name || "?")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  }

  /** Read a query-string parameter. */
  function getParam(key, fallback = null) {
    try {
      const v = new URLSearchParams(window.location.search).get(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  /** True when the user asked the OS for reduced motion. */
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  /** Stable tiny id for local (non-persisted) records. */
  let idSeq = 0;
  const uid = (prefix = "id") => `${prefix}-${Date.now().toString(36)}-${(idSeq++).toString(36)}`;

  /** Debounced click delegation helper: [data-action="x"] inside a root. */
  function delegate(root, event, selector, handler) {
    on(root, event, (e) => {
      const target = e.target.closest(selector);
      if (target && root.contains(target)) handler(e, target);
    });
  }

  SL.h = {
    qs, qsa, on, esc, debounce, clamp, lerp,
    formatNumber, formatCompact, formatDate, formatTime, formatDateTime, timeAgo,
    initials, getParam, prefersReducedMotion, sleep, uid, delegate,
  };
})(window.SL);
