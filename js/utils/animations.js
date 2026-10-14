/* =============================================================================
   SkillLoom — Motion layer
   All scroll reveals, count-ups, 3D card tilts and the hero parallax live
   here. Everything degrades gracefully: if the visitor prefers reduced motion
   the final state is applied immediately and the effect is skipped.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const { qsa, prefersReducedMotion, clamp, lerp } = SL.h;

  const reduced = () => prefersReducedMotion();

  /* ---------- Scroll reveal ------------------------------------------------ */
  /**
   * Observes [data-reveal] elements and fades/slides them into view.
   * Optional `data-reveal-delay="120"` staggers siblings.
   */
  function initReveal(root = document) {
    const items = qsa("[data-reveal]", root).filter((el) => !el.dataset.revealed);
    if (!items.length) return;

    if (reduced() || !("IntersectionObserver" in window)) {
      items.forEach((el) => {
        el.dataset.revealed = "1";
        el.classList.add("is-visible");
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay || 0);
          setTimeout(() => el.classList.add("is-visible"), delay);
          el.dataset.revealed = "1";
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => io.observe(el));
  }

  /* ---------- Count-up numbers --------------------------------------------- */
  function animateCount(el) {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.countSuffix || "";
    const prefix = el.dataset.countPrefix || "";
    const decimals = Number(el.dataset.countDecimals || 0);

    const render = (value) => {
      const shown =
        decimals > 0
          ? value.toFixed(decimals)
          : Math.round(value).toLocaleString("en-US");
      el.textContent = prefix + shown + suffix;
    };

    if (reduced()) {
      render(target);
      return;
    }

    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      render(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /** Wires every [data-count] element to a scroll observer. */
  function initCounters(root = document) {
    const items = qsa("[data-count]", root);
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(animateCount);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCount(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- 3D card tilt -------------------------------------------------- */
  /**
   * Attaches pointer-driven tilt to every `.tilt` element.
   * Cards rotate by a maximum of ~7° so the effect stays calm.
   */
  function initTilt(root = document) {
    if (reduced()) return;
    if (!window.matchMedia("(hover: hover)").matches) return; // touch: skip

    qsa(".tilt", root).forEach((card) => {
      if (card.dataset.tiltReady) return;
      card.dataset.tiltReady = "1";
      const max = Number(card.dataset.tiltMax || 7);

      const onMove = (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * max * 2;
        const ry = (px - 0.5) * max * 2;
        card.classList.add("is-tilting");
        card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
        card.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
        card.style.transform =
          `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-5px)`;
        card.style.boxShadow = "var(--shadow-lift)";
      };

      const onLeave = () => {
        card.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        card.style.transform = "";
        card.style.boxShadow = "";
      };

      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
    });
  }

  /* ---------- Hero 3D parallax ---------------------------------------------- */
  /**
   * Gently steers the hero scene toward the cursor using a lerped rAF loop,
   * so the motion feels weighty rather than glued to the pointer.
   */
  function initHeroParallax() {
    const scene = document.getElementById("hero-3d");
    const stage = document.getElementById("hero-stage");
    if (!scene || !stage || reduced()) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let running = false;

    const baseTiltX = -20; // resting pitch of the orbit plane

    function loop() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);
      stage.style.transform =
        `rotateX(${(baseTiltX + currentY * 7).toFixed(3)}deg) ` +
        `rotateY(${(currentX * 12).toFixed(3)}deg)`;

      if (Math.abs(currentX - targetX) > 0.001 || Math.abs(currentY - targetY) > 0.001) {
        requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }

    function kick() {
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    }

    scene.addEventListener("mousemove", (e) => {
      const rect = scene.getBoundingClientRect();
      targetX = clamp(((e.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
      targetY = clamp(((e.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
      kick();
    });

    scene.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      kick();
    });
  }

  /* ---------- Progress bars -------------------------------------------------- */
  /** Fills every .progress-bar / .breakdown-fill to its data-value once visible. */
  function initProgressBars(root = document) {
    const bars = qsa("[data-value]", root);
    if (!bars.length) return;
    const fill = (el) => {
      const v = clamp(Number(el.dataset.value || 0), 0, 100);
      requestAnimationFrame(() => {
        el.style.width = `${v}%`;
      });
    };
    if (!("IntersectionObserver" in window) || reduced()) {
      bars.forEach(fill);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fill(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach((el) => io.observe(el));
  }

  /* ---------- Boot ----------------------------------------------------------- */
  /** Standard boot sequence every page calls after rendering its markup. */
  function initAll(root = document) {
    initReveal(root);
    initCounters(root);
    initTilt(root);
    initProgressBars(root);
  }

  SL.motion = {
    initReveal,
    initCounters,
    initTilt,
    initProgressBars,
    initHeroParallax,
    initAll,
  };
})(window.SL);
