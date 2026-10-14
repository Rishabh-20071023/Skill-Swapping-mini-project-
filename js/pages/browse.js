/* =============================================================================
   SkillLoom — Browse skills controller
   Client-side search + filtering over the dummy catalogue with simulated
   loading (skeletons) and an empty state. Swap requests open a confirmation
   dialog and update the card locally — no network, no persistence.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { qs, on, esc, debounce } = SL.h;

  const state = { q: "", category: "all", level: "all", sort: "relevance" };

  const els = {};

  /* ---------- Filters UI ------------------------------------------------------------ */
  function renderChips() {
    const host = document.getElementById("category-chips");
    const items = [{ id: "all", label: "All skills", icon: "layers" }].concat(SL.data.categories);
    host.innerHTML = items
      .map((c) => {
        const active = state.category === c.id;
        return `<button type="button" class="chip shrink-0" data-category="${esc(c.id)}" aria-pressed="${active}">
          ${SL.icon(c.icon, "w-4 h-4")}${esc(c.label)}
        </button>`;
      })
      .join("");
  }

  function hasActiveFilters() {
    return state.q !== "" || state.category !== "all" || state.level !== "all" || state.sort !== "relevance";
  }

  function syncFilterChrome(count) {
    const clear = document.getElementById("clear-filters");
    clear.classList.toggle("hidden", !hasActiveFilters());
    clear.classList.toggle("inline-flex", hasActiveFilters());

    const countEl = document.getElementById("results-count");
    if (count === null) {
      countEl.textContent = "Loading listings…";
    } else if (state.q) {
      countEl.textContent = `${count} result${count === 1 ? "" : "s"} for “${state.q}”`;
    } else {
      countEl.textContent = `${count} skill${count === 1 ? "" : "s"} available`;
    }
  }

  /* ---------- Results ----------------------------------------------------------------- */
  function showSkeletons() {
    els.grid.hidden = false;
    els.grid.setAttribute("aria-busy", "true");
    els.grid.innerHTML = SL.ui.skillSkeletons(6);
    els.empty.hidden = true;
    syncFilterChrome(null);
  }

  function showEmpty() {
    els.grid.hidden = true;
    els.grid.setAttribute("aria-busy", "false");
    els.empty.hidden = false;
    els.empty.innerHTML = SL.ui.emptyState({
      icon: "search",
      title: "No skills match those filters",
      body: "Try a broader search term, or clear the filters to see everything the community has listed.",
      action: `<button type="button" class="btn btn-primary btn-sm mt-1" data-clear>Clear filters</button>`,
    });
    syncFilterChrome(0);
  }

  async function fetchAndRender(withSkeleton) {
    if (withSkeleton) showSkeletons();
    const rows = await SL.api.catalog.listSkills(state);

    if (!rows.length) {
      showEmpty();
      return;
    }

    els.grid.hidden = false;
    els.grid.setAttribute("aria-busy", "false");
    els.empty.hidden = true;
    els.grid.innerHTML = rows.map((s) => SL.cards.skillCard(s)).join("");
    syncFilterChrome(rows.length);
    SL.motion.initTilt(els.grid);
  }

  /* ---------- Swap request --------------------------------------------------------------- */
  function requestSwap(btn) {
    const skill = SL.data.skills.find((s) => s.id === btn.dataset.requestSwap);
    if (!skill) return;
    const owner = SL.data.userById(skill.userId) || { name: "this member" };

    if (!SL.store.isAuthenticated()) {
      SL.toast("Please sign in to request a swap.", { type: "warning", title: "Sign in required" });
      setTimeout(() => {
        window.location.href = "login.html?next=browse.html";
      }, 900);
      return;
    }

    SL.modal.open({
      title: "Request this swap",
      subtitle: `${skill.title}`,
      body: `
        <div class="flex flex-col gap-4 pb-2">
          <div class="rounded-soft border border-line bg-surface-2 p-4 flex items-center gap-3">
            ${SL.ui.avatar(owner, "md", { presence: true })}
            <div class="min-w-0">
              <p class="text-sm font-semibold text-heading">${esc(owner.name)}</p>
              <p class="text-xs text-muted">Offers ${esc(skill.teaches)} · wants ${esc(skill.wants)}</p>
            </div>
          </div>
          <dl class="grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-soft border border-line p-3">
              <dt class="text-xs text-muted">Session length</dt>
              <dd class="font-semibold text-heading mt-0.5">${esc(skill.duration)}</dd>
            </div>
            <div class="rounded-soft border border-line p-3">
              <dt class="text-xs text-muted">Credit cost</dt>
              <dd class="font-semibold text-heading mt-0.5">${skill.credits} credits</dd>
            </div>
          </dl>
          <p class="text-xs text-muted leading-body">
            ${SL.icon("info", "w-4 h-4 inline -mt-0.5")}
            Credits are only transferred once both sides confirm the session.
          </p>
        </div>`,
      footer: `
        <button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" data-confirm-send>Send request</button>`,
      onMount(dialog, close) {
        const confirmBtn = dialog.querySelector("[data-confirm-send]");
        on(confirmBtn, "click", async () => {
          confirmBtn.disabled = true;
          confirmBtn.innerHTML = `<span class="spinner"></span> Sending…`;
          await SL.api.latency(400, 800);
          close();
          btn.disabled = true;
          btn.innerHTML = `${SL.icon("check", "w-4 h-4")} Requested`;
          SL.toast(`Swap request sent to ${owner.name}.`, { type: "success" });
        });
      },
    });
  }

  /* ---------- Boot ------------------------------------------------------------------------ */
  function init() {
    SL.navbar.render();
    SL.footer.render();

    els.grid = document.getElementById("skill-grid");
    els.empty = document.getElementById("empty-slot");
    els.search = document.getElementById("skill-search");
    document.getElementById("search-icon").innerHTML = SL.icon("search", "w-5 h-5");
    document.getElementById("clear-filters").innerHTML =
      SL.icon("x", "w-4 h-4") + " Clear filters";

    renderChips();

    const run = (skeleton) => fetchAndRender(skeleton);

    // Search (debounced)
    on(els.search, "input", debounce(() => {
      state.q = els.search.value.trim();
      run(false);
    }, 260));

    // Category chips
    document.getElementById("category-chips").addEventListener("click", (e) => {
      const chip = e.target.closest("[data-category]");
      if (!chip) return;
      state.category = chip.dataset.category;
      renderChips();
      run(false);
    });

    // Level + sort
    on(document.getElementById("level-filter"), "change", (e) => {
      state.level = e.target.value;
      run(false);
    });
    on(document.getElementById("sort-filter"), "change", (e) => {
      state.sort = e.target.value;
      run(false);
    });

    // Clear (toolbar + empty state)
    document.addEventListener("click", (e) => {
      if (e.target.closest("#clear-filters") || e.target.closest("[data-clear]")) {
        state.q = "";
        state.category = "all";
        state.level = "all";
        state.sort = "relevance";
        els.search.value = "";
        document.getElementById("level-filter").value = "all";
        document.getElementById("sort-filter").value = "relevance";
        renderChips();
        run(false);
      }
    });

    // Swap requests (cards are re-rendered, so delegate from the document)
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-request-swap]");
      if (btn) requestSwap(btn);
    });

    run(true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
