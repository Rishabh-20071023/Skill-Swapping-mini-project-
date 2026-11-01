/* =============================================================================
   SkillLoom — Editorial section components
   The repeating units of the landing page, kept in one place so pages compose
   markup instead of copying it:

     · sectionHeader   eyebrow + display title + one-line intro
     · numberedList    the 01 / 02 / 03 rows used by skills, workshops, guides
     · storyCard       editorial card with category + read time
     · flipCard        tap/Enter to flip a glossary term
     · accordion       numbered, keyboard-friendly disclosure
     · tabs            roving-tabindex tablist + panels (shared by landing and
                       the community detail page)
     · marquee         looping ticker
     · quoteCarousel   rotating hero quotes with prev / next / pause

   All behaviour is delegated from data-attributes and registered once via
   init(root), so re-rendering a section only needs another init() call.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const { esc } = SL.h;
  const pad = (n) => String(n + 1).padStart(2, "0");
  const escsafe = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  /* ---------- Section header ------------------------------------------------- */
  /**
   * Every section starts the same way: small eyebrow, large title, one-line
   * intro (plus an optional trailing action such as "See all workshops").
   */
  function sectionHeader(o) {
    return `<div class="sec-head${o.align === "center" ? " sec-head-center" : ""}" data-reveal>
      <span class="eyebrow">${esc(o.eyebrow)}</span>
      <div class="sec-head-row">
        <div class="sec-head-copy">
          <h2 id="${esc(o.id)}" class="sec-title">${o.title}</h2>
          ${o.intro ? `<p class="sec-intro">${esc(o.intro)}</p>` : ""}
        </div>
        ${o.action || ""}
      </div>
    </div>`;
  }

  /* ---------- Numbered rows -------------------------------------------------- */
  /**
   * One numbered row. `meta` is the small right-aligned label ("3 min read",
   * "Evenings · 2 slots"), `action` is optional markup (a Request Swap button).
   */
  function listRow(o) {
    return `<li class="num-row"${o.delay ? ` data-reveal data-reveal-delay="${o.delay}"` : " data-reveal"}>
      <span class="num" aria-hidden="true">${esc(o.n || "01")}</span>
      <div class="num-body">
        <div class="num-top">
          <h3 class="num-title">${o.title}</h3>
          ${o.meta ? `<span class="num-meta">${esc(o.meta)}</span>` : ""}
        </div>
        ${o.body ? `<p class="num-text">${esc(o.body)}</p>` : ""}
      </div>
      ${o.action ? `<div class="num-action">${o.action}</div>` : ""}
    </li>`;
  }

  /* ---------- Story card ----------------------------------------------------- */
  function storyCard(story, i) {
    return `<article class="card card-hover story-card" data-reveal data-reveal-delay="${i * 90}">
      <div class="story-meta">
        <span class="badge badge-primary">${esc(story.category)}</span>
        <span class="story-read">${esc(story.readMin)} min read</span>
      </div>
      <h3 class="story-title">${esc(story.title)}</h3>
      <p class="story-excerpt">${esc(story.excerpt)}</p>
      <a class="link-arrow mt-auto" href="#community" aria-label="Read story: ${esc(story.title)}">
        Read story ${SL.icon("arrow-right", "w-4 h-4")}
      </a>
    </article>`;
  }

  /* ---------- Flip cards ------------------------------------------------------ */
  /**
   * A flip card is a div (not a button: it holds block content) with
   * role="button" + aria-expanded, so Space/Enter work like a click.
   * Clicking again flips it back — state is in .is-flipped, not in markup.
   */
  function flipCard(item, i) {
    const id = `flip-${escsafe(item.term)}`;
    return `<div class="flip" role="button" tabindex="0" data-flip aria-expanded="false"
        aria-controls="${id}" aria-label="${esc(item.term)}: show definition" data-reveal data-reveal-delay="${i * 60}">
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <span class="num" aria-hidden="true">${pad(i)}</span>
          <span class="flip-term">${esc(item.term)}</span>
          <span class="flip-hint">Tap to flip ${SL.icon("refresh", "w-3.5 h-3.5")}</span>
        </div>
        <div class="flip-face flip-back" id="${id}">
          <span class="num num-inverse" aria-hidden="true">${pad(i)}</span>
          <p class="flip-def">${esc(item.definition)}</p>
          <span class="flip-hint">Flip back ${SL.icon("refresh", "w-3.5 h-3.5")}</span>
        </div>
      </div>
    </div>`;
  }

  /* ---------- Accordion ------------------------------------------------------- */
  /**
   * @param {{id:string, items:{title:string, tips:string[]}[]}} o
   * One panel open at a time; triggers are real buttons inside <h3>.
   */
  function accordion(o) {
    return `<div class="accordion" data-accordion id="${esc(o.id)}">
      ${o.items
        .map((item, i) => {
          const tid = `${o.id}-trigger-${i}`;
          const pid = `${o.id}-panel-${i}`;
          const open = i === 0;
          return `<div class="acc-item${open ? " is-open" : ""}">
            <h3 class="acc-head">
              <button type="button" class="acc-trigger" id="${tid}" aria-expanded="${open}" aria-controls="${pid}">
                <span class="num" aria-hidden="true">${pad(i)}</span>
                <span class="acc-title">${esc(item.title)}</span>
                <span class="acc-icon" aria-hidden="true">${SL.icon("plus", "w-4 h-4")}</span>
              </button>
            </h3>
            <div class="acc-panel" id="${pid}" role="region" aria-labelledby="${tid}">
              <div class="acc-inner">
                <ol class="acc-tips">
                  ${item.tips.map((t) => `<li>${esc(t)}</li>`).join("")}
                </ol>
              </div>
            </div>
          </div>`;
        })
        .join("")}
    </div>`;
  }

  /* ---------- Tabs ------------------------------------------------------------ */
  /**
   * @param {{id:string, label:string, tabs:{id,label,panel:string}[], className?:string}} o
   * WAI-ARIA tabs: only the active tab is tabbable, arrows move between tabs.
   */
  function tabs(o) {
    const group = esc(o.id);
   return `<div class="tabs ${o.className || ""}" role="tablist" aria-label="${esc(o.label)}" data-tabs>
      ${o.tabs
        .map(
          (t, i) => `<button type="button" class="tab${i === 0 ? " is-active" : ""}" role="tab"
            id="${group}-tab-${esc(t.id)}" aria-controls="${group}-panel-${esc(t.id)}"
            aria-selected="${i === 0}" tabindex="${i === 0 ? "0" : "-1"}">${esc(t.label)}</button>`
        )
        .join("")}
    </div>
    ${o.tabs
      .map(
        (t, i) => `<div class="tab-panel" role="tabpanel" id="${group}-panel-${esc(t.id)}"
          aria-labelledby="${group}-tab-${esc(t.id)}" tabindex="0"${i === 0 ? "" : " hidden"}>${t.panel}</div>`
      )
      .join("")}`;
  }

  /* ---------- Marquee --------------------------------------------------------- */
  /** Duplicated track so the loop is seamless; `aria-hidden` — it is decoration. */
  function marquee(items) {
    const group = `<span class="marquee-group">${items
      .map((t) => `<span>${esc(t)}</span><span class="marquee-dot" aria-hidden="true">·</span>`)
      .join("")}</span>`;
    return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${group}${group}</div></div>`;
  }

  /* ---------- Quote carousel -------------------------------------------------- */
  /**
   * Rotates a list of quotes. Prev / next / pause are real buttons; auto-play
   * pauses on hover, on focus, when the tab is hidden and — entirely — when the
   * visitor prefers reduced motion (they still get prev / next).
   */
  function quoteCarousel(quotes) {
    return `<div class="quote-carousel" data-carousel aria-roledescription="carousel" aria-label="What members say">
      <div class="quote-viewport">
        ${quotes
          .map(
            (q, i) => `<blockquote class="quote-slide${i === 0 ? " is-active" : ""}" data-carousel-slide
              aria-hidden="${i === 0 ? "false" : "true"}">
              <p class="quote-text">${esc(q.text)}</p>
              <footer class="quote-who">${esc(q.who)}<span> · ${esc(q.role)}</span></footer>
            </blockquote>`
          )
          .join("")}
      </div>
      <div class="quote-controls">
        <button type="button" class="quote-btn" data-carousel-prev aria-label="Previous quote">
          ${SL.icon("arrow-left", "w-4 h-4")}
        </button>
        <button type="button" class="quote-btn" data-carousel-next aria-label="Next quote">
          ${SL.icon("arrow-right", "w-4 h-4")}
        </button>
        <button type="button" class="quote-btn quote-toggle" data-carousel-toggle aria-pressed="false">
          <span data-toggle-label>Pause</span>
        </button>
        <p class="quote-count" aria-live="off"><span data-carousel-index>01</span> / ${String(quotes.length).padStart(2, "0")}</p>
      </div>
    </div>`;
  }

  /* ---------- Tier card ------------------------------------------------------- */
  function tierCard(tier, i, active) {
    return `<article class="card tier-card${active ? " is-current" : ""}" data-reveal data-reveal-delay="${i * 80}">
      <div class="tier-top">
        <span class="num" aria-hidden="true">${pad(i)}</span>
        ${active ? '<span class="badge badge-primary">Your tier</span>' : ""}
      </div>
      <h3 class="tier-name">${esc(tier.name)}</h3>
      <p class="tier-range">${esc(tier.range)}</p>
      <p class="tier-blurb">${esc(tier.blurb)}</p>
      <ul class="check-list">
        ${tier.perks.map((p) => `<li>${SL.icon("check", "w-4 h-4")}${esc(p)}</li>`).join("")}
      </ul>
    </article>`;
  }

  /* ===========================================================================
     Behaviour
     ======================================================================== */

  /* ---------- Flip cards ------------------------------------------------------ */
  function initFlips(root = document) {
    root.querySelectorAll("[data-flip]").forEach((card) => {
      if (card.dataset.flipReady) return;
      card.dataset.flipReady = "1";
      const toggle = () => {
        const open = card.classList.toggle("is-flipped");
        card.setAttribute("aria-expanded", String(open));
        card.setAttribute(
          "aria-label",
          `${card.querySelector(".flip-term").textContent}: ${open ? "hide" : "show"} definition`
        );
      };
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ---------- Accordion ------------------------------------------------------- */
  function initAccordions(root = document) {
    root.querySelectorAll("[data-accordion]").forEach((group) => {
      if (group.dataset.accReady) return;
      group.dataset.accReady = "1";
      const items = Array.from(group.querySelectorAll(".acc-item"));

      const setOpen = (item, open) => {
        item.classList.toggle("is-open", open);
        item.querySelector(".acc-trigger").setAttribute("aria-expanded", String(open));
      };

      items.forEach((item) => {
        const trigger = item.querySelector(".acc-trigger");
        trigger.addEventListener("click", () => {
          const willOpen = !item.classList.contains("is-open");
          items.forEach((other) => setOpen(other, false));
          setOpen(item, willOpen);
        });
        // Arrow keys move between headers, Home / End jump to the ends.
        trigger.addEventListener("keydown", (e) => {
          const i = items.indexOf(item);
          let next = null;
          if (e.key === "ArrowDown") next = items[i + 1];
          if (e.key === "ArrowUp") next = items[i - 1];
          if (e.key === "Home") next = items[0];
          if (e.key === "End") next = items[items.length - 1];
          if (next) {
            e.preventDefault();
            next.querySelector(".acc-trigger").focus();
          }
        });
      });
    });
  }

  /* ---------- Tabs ------------------------------------------------------------ */
  function initTabs(root = document) {
    root.querySelectorAll("[data-tabs]").forEach((list) => {
      if (list.dataset.tabsReady) return;
      list.dataset.tabsReady = "1";
      const tabBtns = Array.from(list.querySelectorAll('[role="tab"]'));

      const select = (btn, focus) => {
        tabBtns.forEach((b) => {
          const on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-selected", String(on));
          b.tabIndex = on ? 0 : -1;
          const panel = document.getElementById(b.getAttribute("aria-controls"));
          if (panel) panel.hidden = !on;
        });
        if (focus) btn.focus();
        // Tell the page which panel is now visible so it can lazy-load content
        // (the community detail page does exactly that).
        list.dispatchEvent(
          new CustomEvent("tabchange", {
            bubbles: true,
            detail: { id: btn.id, panel: btn.getAttribute("aria-controls") },
          })
        );
      };

      tabBtns.forEach((btn) => btn.addEventListener("click", () => select(btn, false)));

      list.addEventListener("keydown", (e) => {
        const i = tabBtns.indexOf(document.activeElement);
        if (i === -1) return;
        let next = null;
        if (e.key === "ArrowRight") next = tabBtns[(i + 1) % tabBtns.length];
        if (e.key === "ArrowLeft") next = tabBtns[(i - 1 + tabBtns.length) % tabBtns.length];
        if (e.key === "Home") next = tabBtns[0];
        if (e.key === "End") next = tabBtns[tabBtns.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
  }

  /* ---------- Quote carousel -------------------------------------------------- */
  function initCarousels(root = document) {
    root.querySelectorAll("[data-carousel]").forEach((host) => {
      if (host.dataset.carouselReady) return;
      host.dataset.carouselReady = "1";

      const slides = Array.from(host.querySelectorAll("[data-carousel-slide]"));
      if (!slides.length) return;
      const indexEl = host.querySelector("[data-carousel-index]");
      const toggle = host.querySelector("[data-carousel-toggle]");
      const label = host.querySelector("[data-toggle-label]");
      const reduced = SL.h.prefersReducedMotion();

      let index = 0;
      let timer = null;
      let playing = !reduced;

      const show = (n) => {
        index = (n + slides.length) % slides.length;
        slides.forEach((s, i) => {
          const on = i === index;
          s.classList.toggle("is-active", on);
          s.setAttribute("aria-hidden", String(!on));
        });
        if (indexEl) indexEl.textContent = String(index + 1).padStart(2, "0");
      };

      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      const start = () => {
        stop();
        if (!playing || reduced) return;
        timer = setInterval(() => show(index + 1), 6500);
      };

      const setPlaying = (on) => {
        playing = on;
        if (toggle) {
          toggle.setAttribute("aria-pressed", String(!on));
          toggle.setAttribute("aria-label", on ? "Pause quotes" : "Play quotes");
        }
        if (label) label.textContent = on ? "Pause" : "Play";
        on ? start() : stop();
      };

      host.querySelector("[data-carousel-prev]").addEventListener("click", () => {
        show(index - 1);
        start(); // restart the dwell time after a manual move
      });
      host.querySelector("[data-carousel-next]").addEventListener("click", () => {
        show(index + 1);
        start();
      });
      toggle.addEventListener("click", () => setPlaying(!playing));

      // Pause while the visitor is reading the quote.
      host.addEventListener("mouseenter", stop);
      host.addEventListener("mouseleave", start);
      host.addEventListener("focusin", stop);
      host.addEventListener("focusout", start);
      document.addEventListener("visibilitychange", () =>
        document.hidden ? stop() : start()
      );

      if (reduced) {
        setPlaying(false);
      } else {
        start();
      }
      show(0);
    });
  }

  /** One entry point for every section behaviour. */
  function init(root = document) {
    initFlips(root);
    initAccordions(root);
    initTabs(root);
    initCarousels(root);
  }

  /* ---------- Page header (app pages) ---------------------------------------- */
  /**
   * App pages share the landing page's rhythm: eyebrow, display title, intro.
   * Pages that render their header in HTML use the same classes.
   */
  function pageHeader(o) {
    return `<header class="app-head">
      <span class="eyebrow">${esc(o.eyebrow)}</span>
      <div class="app-head-row">
        <div>
          <h1 class="app-title">${o.title}</h1>
          ${o.intro ? `<p class="app-intro">${esc(o.intro)}</p>` : ""}
        </div>
        ${o.action || ""}
      </div>
    </header>`;
  }

  /**
   * Tablist only — for pages whose panels already exist in the HTML (the
   * community detail page keeps its Feed / Resources / Events / Members markup
   * and only needs the shared, keyboard-aware tab strip).
   * @param {{id:string, label:string, panelPrefix?:string, tabs:{id,label:?}[], className?:string}} o
   */
  function tablist(o) {
    const group = esc(o.id);
    const prefix = o.panelPrefix || group + "-panel-";
    const buttons = o.tabs.map(function (t, i) {
      const active = i === 0;
      return (
        '<button type="button" class="tab' + (active ? " is-active" : "") + '" role="tab"' +
        ' id="' + group + '-tab-' + esc(t.id) + '"' +
        ' aria-controls="' + esc(prefix) + esc(t.id) + '"' +
        ' aria-selected="' + active + '"' +
        ' tabindex="' + (active ? "0" : "-1") + '">' + esc(t.label) + "</button>"
      );
    });
    return (
      '<div class="tabs ' + (o.className || "") + '" role="tablist" aria-label="' + esc(o.label) + '" data-tabs>' +
      buttons.join("") +
      "</div>"
    );
  }

  SL.sections = {
    sectionHeader,
    tablist,
    listRow,
    storyCard,
    flipCard,
    accordion,
    tabs,
    marquee,
    quoteCarousel,
    tierCard,
    pageHeader,
    init,
    initFlips,
    initAccordions,
    initTabs,
    initCarousels,
  };
})(window.SL);
