/* =============================================================================
   SkillLoom — Footer
   Rendered into <div id="footer-root"></div> on every page.
   Editorial layout: logo + one-line description, an Explore column and the
   three latest stories, then a slim bottom row with the copyright and a
   "Back to top" link.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const { esc } = SL.h;

  const EXPLORE = [
    ["Home", "index.html"],
    ["Stories", "index.html#stories"],
    ["Skills", "index.html#skills"],
    ["Learn", "index.html#learn"],
    ["Credits", "index.html#credits"],
    ["Community", "community.html"],
    ["About", "index.html#about"],
  ];

  /* Story links share the landing page's Stories anchor until each article has
     its own route (e.g. /stories/:slug from GET /api/stories). */
  const STORY_LINKS = [
    ["A coder and a guitarist swapped hours for a season", "index.html#stories"],
    ["Why we priced every skill at one credit per hour", "index.html#stories"],
    ["The study group that became a hiring pipeline", "index.html#stories"],
  ];

  function render() {
    const root = document.getElementById("footer-root");
    if (!root) return;

    const year = new Date().getFullYear();

    root.innerHTML = `
      <footer id="footer" class="gradient-navy text-white/80 mt-auto">
        <div class="container-page py-14 lg:py-16">
          <div class="grid gap-10 lg:grid-cols-12">
            <div class="lg:col-span-5 flex flex-col gap-5">
              <a href="index.html" class="flex items-center gap-2.5" aria-label="SkillLoom home">
                ${SL.logo(34)}
                <span class="font-heading font-extrabold text-lg tracking-tight text-white">Skill<span style="color:#7DD3FC">Loom</span></span>
              </a>
              <p class="text-sm leading-body text-white/70 max-w-sm">
                A peer-to-peer marketplace for skills. Teach what you know, learn what you don't,
                and settle the difference in skill credits — never in cash.
              </p>
              <p class="font-heading font-semibold text-sm text-white/90">Learn. Teach. Trade.</p>
              <div class="flex items-center gap-2.5 pt-1">
                ${[
                  ["x", "SkillLoom on X"],
                  ["linkedin", "SkillLoom on LinkedIn"],
                  ["github", "SkillLoom on GitHub"],
                  ["youtube", "SkillLoom on YouTube"],
                ]
                  .map(
                    ([name, label]) =>
                      `<a href="#" aria-label="${label}" class="inline-grid place-items-center w-9 h-9 rounded-soft border border-white/20 text-white/80 hover:text-white hover:border-white/50 hover:bg-white/10 transition-colors">${SL.social(name)}</a>`
                  )
                  .join("")}
              </div>
            </div>

            <nav class="lg:col-span-3" aria-label="Explore">
              <h3 class="font-heading font-bold text-sm uppercase tracking-[0.14em] text-white/60 mb-4">Explore</h3>
              <ul class="space-y-2.5 list-reset">
                ${EXPLORE.map(
                  ([label, href]) =>
                    `<li><a href="${href}" class="text-sm text-white/75 hover:text-white transition-colors">${esc(label)}</a></li>`
                ).join("")}
              </ul>
            </nav>

            <nav class="lg:col-span-4" aria-label="Latest stories">
              <h3 class="font-heading font-bold text-sm uppercase tracking-[0.14em] text-white/60 mb-4">Latest stories</h3>
              <ul class="space-y-3 list-reset">
                ${STORY_LINKS.map(
                  ([label, href], i) =>
                    `<li class="flex gap-3">
                      <span class="text-[0.7rem] font-semibold tracking-[0.1em] text-white/40 pt-0.5">${String(i + 1).padStart(2, "0")}</span>
                      <a href="${href}" class="text-sm leading-snug text-white/75 hover:text-white transition-colors">${esc(label)}</a>
                    </li>`
                ).join("")}
              </ul>
            </nav>
          </div>

          <div class="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-white/60">© ${year} SkillLoom. All rights reserved.</p>
            <div class="flex items-center gap-6">
              <a href="#" class="text-xs text-white/60 hover:text-white transition-colors">Privacy</a>
              <a href="#" class="text-xs text-white/60 hover:text-white transition-colors">Terms</a>
              <a href="#main" class="text-xs font-semibold text-white hover:text-white inline-flex items-center gap-1.5">
                Back to top
                <svg viewBox="0 0 24 24" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>`;
  }

  SL.footer = { render };
})(window.SL);
