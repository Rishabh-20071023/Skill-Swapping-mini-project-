/* =============================================================================
   SkillLoom — Footer
   Rendered into <div id="footer-root"></div> on every page.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const { esc } = SL.h;

  const COLUMNS = [
    {
      title: "Platform",
      links: [
        ["Home", "index.html"],
        ["Browse skills", "browse.html"],
        ["Communities", "community.html"],
        ["Dashboard", "dashboard.html"],
        ["Schedule a session", "schedule.html"],
      ],
    },
    {
      title: "Account",
      links: [
        ["Log in", "login.html?tab=login"],
        ["Create account", "login.html?tab=signup"],
        ["My profile", "profile.html"],
        ["Credit wallet", "wallet.html"],
        ["Ratings & reviews", "reviews.html"],
      ],
    },
    {
      title: "Company",
      links: [
        ["About SkillLoom", "index.html#features"],
        ["How it works", "index.html#how"],
        ["AI principles", "index.html#ai"],
        ["Community guidelines", "community.html?id=web-development"],
        ["Help centre", "index.html#footer"],
      ],
    },
  ];

  function render() {
    const root = document.getElementById("footer-root");
    if (!root) return;

    const year = new Date().getFullYear();

    root.innerHTML = `
      <footer id="footer" class="gradient-navy text-white/80 mt-auto">
        <div class="container-page py-14 lg:py-16">
          <div class="grid gap-10 lg:grid-cols-12">
            <div class="lg:col-span-4 flex flex-col gap-5">
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

            <div class="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              ${COLUMNS.map(
                (col) => `
                <nav aria-label="${esc(col.title)}">
                  <h3 class="font-heading font-bold text-sm uppercase tracking-[0.14em] text-white/60 mb-4">${esc(col.title)}</h3>
                  <ul class="space-y-2.5 list-reset">
                    ${col.links
                      .map(
                        ([label, href]) =>
                          `<li><a href="${href}" class="text-sm text-white/75 hover:text-white transition-colors">${esc(label)}</a></li>`
                      )
                      .join("")}
                  </ul>
                </nav>`
              ).join("")}
            </div>
          </div>

          <div class="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p class="text-xs text-white/60">© ${year} SkillLoom. All rights reserved.</p>
            <div class="flex items-center gap-6">
              <a href="#" class="text-xs text-white/60 hover:text-white transition-colors">Privacy</a>
              <a href="#" class="text-xs text-white/60 hover:text-white transition-colors">Terms</a>
              <a href="#" class="text-xs text-white/60 hover:text-white transition-colors">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>`;
  }

  SL.footer = { render };
})(window.SL);
