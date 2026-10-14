/* =============================================================================
   SkillLoom — Modal dialogs
   SL.modal.open({ title, body, footer, onMount })  → { close }
   SL.modal.confirm({ title, body, confirmLabel, onConfirm })

   Keyboard support: Esc closes the top-most dialog, Tab is trapped inside it,
   and focus returns to the trigger when it closes.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const { esc, qs } = SL.h;
  const stack = [];
  let scrollY = 0;

  const FOCUSABLE =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function lockScroll() {
    if (stack.length === 1) {
      scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    }
  }

  function unlockScroll() {
    if (stack.length === 0) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      window.scrollTo(0, scrollY);
    }
  }

  function open(options) {
    const opts = options || {};
    const trigger = document.activeElement;
    const sizeClass = opts.size === "lg" ? "max-w-3xl" : opts.size === "sm" ? "max-w-md" : "";

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `
      <div class="modal ${sizeClass}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-head">
          <div>
            <h2 id="modal-title" class="font-heading font-bold text-xl text-heading">${esc(opts.title || "")}</h2>
            ${opts.subtitle ? `<p class="text-muted text-sm mt-1 leading-body">${esc(opts.subtitle)}</p>` : ""}
          </div>
          <button type="button" class="modal-close" aria-label="Close dialog" data-modal-close>${SL.icon("x", "w-4 h-4")}</button>
        </div>
        <div class="modal-body">${opts.body || ""}</div>
        ${opts.footer ? `<div class="modal-foot">${opts.footer}</div>` : ""}
      </div>`;

    const dialog = qs(".modal", backdrop);
    const close = () => {
      const idx = stack.findIndex((m) => m.backdrop === backdrop);
      if (idx === -1) return;
      stack.splice(idx, 1);
      backdrop.remove();
      unlockScroll();
      document.removeEventListener("keydown", onKeydown, true);
      if (trigger && typeof trigger.focus === "function") trigger.focus();
      if (typeof opts.onClose === "function") opts.onClose();
    };

    function onKeydown(e) {
      const top = stack[stack.length - 1];
      if (!top || top.backdrop !== backdrop) return;

      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        top.close();
        return;
      }
      if (e.key === "Tab") {
        const nodes = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(
          (n) => n.offsetParent !== null
        );
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    backdrop.addEventListener("mousedown", (e) => {
      if (e.target === backdrop) close();
    });
    backdrop.addEventListener("click", (e) => {
      if (e.target.closest("[data-modal-close]")) close();
    });
    document.addEventListener("keydown", onKeydown, true);

    document.getElementById("modal-root")?.appendChild(backdrop) ||
      document.body.appendChild(backdrop);
    stack.push({ backdrop, close });
    lockScroll();

    if (typeof opts.onMount === "function") opts.onMount(dialog, close);

    // Move focus into the dialog.
    const focusTarget = dialog.querySelector(FOCUSABLE) || dialog;
    focusTarget.focus({ preventScroll: true });

    return { close, dialog };
  }

  /** Confirmation dialog with an action callback. */
  function confirm(options) {
    const opts = options || {};
    return open({
      title: opts.title || "Are you sure?",
      subtitle: opts.subtitle,
      body: `<p class="text-body text-sm leading-body pb-2">${opts.body || ""}</p>`,
      footer: `
        <button type="button" class="btn btn-outline btn-sm" data-modal-close>${esc(opts.cancelLabel || "Cancel")}</button>
        <button type="button" class="btn ${opts.tone === "danger" ? "btn-primary" : "btn-primary"} btn-sm" data-confirm>${esc(opts.confirmLabel || "Confirm")}</button>`,
      onMount(dialog, close) {
        const btn = qs("[data-confirm]", dialog);
        if (btn) {
          btn.addEventListener("click", async () => {
            btn.disabled = true;
            const original = btn.innerHTML;
            btn.innerHTML = `<span class="spinner"></span> Working…`;
            try {
              if (typeof opts.onConfirm === "function") await opts.onConfirm();
              close();
            } catch (err) {
              btn.disabled = false;
              btn.innerHTML = original;
              SL.toast(err.message || "Please try again.", { type: "error" });
            }
          });
        }
      },
    });
  }

  function closeAll() {
    while (stack.length) stack[stack.length - 1].close();
  }

  SL.modal = { open, confirm, closeAll };
})(window.SL);
