/* =============================================================================
   SkillLoom — Toast notifications
   SL.toast("Session booked!") · SL.toast("Swap requested", { type:"accent" })
   Toasts stack bottom-right, auto-dismiss, and can be closed manually.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const ICONS = {
    success: "check-circle",
    warning: "alert",
    error: "alert",
    accent: "sparkles",
    info: "info",
  };

  const TITLES = {
    success: "Success",
    warning: "Heads up",
    error: "Something went wrong",
    accent: "Reward",
    info: "Note",
  };

  let root;

  function ensureRoot() {
    if (!root) {
      root = document.getElementById("toast-root");
      if (!root) {
        root = document.createElement("div");
        root.id = "toast-root";
        root.setAttribute("aria-live", "polite");
        root.setAttribute("aria-atomic", "false");
        document.body.appendChild(root);
      }
    }
    return root;
  }

  /**
   * @param {string} message
   * @param {{type?: "success"|"warning"|"error"|"accent"|"info", title?: string, duration?: number}} [options]
   */
  function toast(message, options = {}) {
    const type = options.type || "success";
    const duration = options.duration === undefined ? 3800 : options.duration;
    const host = ensureRoot();

    // Keep the stack shallow.
    while (host.children.length >= 4) host.removeChild(host.firstElementChild);

    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.setAttribute("role", type === "error" ? "alert" : "status");
    el.innerHTML = `
      <span class="toast-icon">${SL.icon(ICONS[type] || "info", "w-5 h-5")}</span>
      <div class="min-w-0">
        <p class="toast-title">${SL.h.esc(options.title || TITLES[type])}</p>
        <p class="toast-msg">${SL.h.esc(message)}</p>
      </div>
      <button type="button" class="toast-close" aria-label="Dismiss notification">
        ${SL.icon("x", "w-4 h-4")}
      </button>`;

    const dismiss = () => {
      if (!el.isConnected) return;
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 300);
    };

    el.querySelector(".toast-close").addEventListener("click", dismiss);
    host.appendChild(el);
    if (duration > 0) setTimeout(dismiss, duration);
    return { dismiss };
  }

  SL.toast = toast;
})(window.SL);
