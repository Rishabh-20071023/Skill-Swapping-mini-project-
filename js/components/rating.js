/* =============================================================================
   SkillLoom — Star rating component
   Read-only:   SL.rating.display(4.5, "w-5 h-5")
   Interactive: SL.rating.mount(container, { value, onChange, labelEl })
   The interactive version follows the WAI-ARIA radiogroup pattern:
   arrow keys move between stars, Home/End jump to first/last.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const STAR_PATH =
    "M12 2.6l2.9 5.88 6.5.95-4.7 4.58 1.11 6.47L12 17.42l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95z";

  function starSvg(index, active, size) {
    return `<svg viewBox="0 0 24 24" class="${size}" fill="${active ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="${STAR_PATH}"/></svg>`;
  }

  /** Read-only row of stars (decorative; pair it with visible numeric text). */
  function display(value, size = "w-4 h-4") {
    let out = '<span class="stars-readonly" aria-hidden="true">';
    for (let i = 1; i <= 5; i++) {
      out += starSvg(i, value >= i - 0.35, size);
    }
    return out + "</span>";
  }

  /**
   * @param {HTMLElement} container  empty element to fill
   * @param {{value?:number, size?:string, onChange?:(v:number)=>void,
   *          labelEl?:HTMLElement, labels?:string[]}} options
   */
  function mount(container, options) {
    const opts = options || {};
    let value = Number(opts.value || 0);
    let preview = 0;
    const size = opts.size || "w-7 h-7";
    const labels = opts.labels || ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

    container.className = `stars ${opts.className || ""}`;
    container.setAttribute("role", "radiogroup");
    container.setAttribute("aria-label", "Your rating out of 5");

    function render() {
      const shown = preview || value;
      container.innerHTML = "";
      for (let i = 1; i <= 5; i++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `star-btn ${i <= shown ? "is-on" : ""}`;
        btn.setAttribute("role", "radio");
        btn.setAttribute("aria-checked", String(i === value));
        btn.setAttribute("aria-label", `${i} star${i > 1 ? "s" : ""}`);
        btn.tabIndex = i === (value || 1) ? 0 : -1;
        btn.dataset.value = String(i);
        btn.innerHTML = starSvg(i, i <= shown, size);
        container.appendChild(btn);
      }
      if (opts.labelEl) opts.labelEl.textContent = value ? labels[value] : "";
    }

    function setValue(v, emit) {
      value = Math.min(5, Math.max(1, v));
      preview = 0;
      render();
      if (emit && typeof opts.onChange === "function") opts.onChange(value);
    }

    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".star-btn");
      if (btn) setValue(Number(btn.dataset.value), true);
    });

    container.addEventListener("mouseover", (e) => {
      const btn = e.target.closest(".star-btn");
      if (!btn) return;
      preview = Number(btn.dataset.value);
      render();
      if (opts.labelEl) opts.labelEl.textContent = labels[preview] || "";
    });

    container.addEventListener("mouseleave", () => {
      preview = 0;
      render();
    });

    container.addEventListener("keydown", (e) => {
      const keys = ["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown", "Home", "End"];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();
      let next = value || 1;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(5, (value || 0) + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(1, (value || 1) - 1);
      if (e.key === "Home") next = 1;
      if (e.key === "End") next = 5;
      setValue(next, true);
      const active = container.querySelector(`[data-value="${next}"]`);
      if (active) active.focus();
    });

    render();
    return { get value() { return value; }, set: (v) => setValue(v, false) };
  }

  SL.rating = { display, mount, starSvg };
})(window.SL);
