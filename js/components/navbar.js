/* =============================================================================
   SkillLoom — Navbar
   Renders the sticky header on every page (drop it in with
   <div id="navbar-root"></div>) and keeps it in sync with auth state:

     · logged out  → Log in / Sign up buttons
     · logged in   → credit pill + avatar menu (profile, wallet, chat…)

   The active link is derived from the current file, so the same component
   works on every page without configuration.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const { esc, qs, qsa, on } = SL.h;

  const LINKS = [
    { key: "home", label: "Home", href: "index.html" },
    { key: "features", label: "Features", href: "index.html#features" },
    { key: "community", label: "Community", href: "community.html" },
    { key: "browse", label: "Browse Skills", href: "browse.html" },
    { key: "dashboard", label: "Dashboard", href: "dashboard.html" },
  ];

  function currentSection() {
    const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (file.indexOf("community") === 0) return "community";
    if (file.indexOf("browse") === 0) return "browse";
    if (file.indexOf("dashboard") === 0) return "dashboard";
    if (file.indexOf("index") === 0 || file === "") return "home";
    return file;
  }

  function navLinksHtml(className) {
    const active = currentSection();
    return LINKS.map(
      (l) =>
        `<li><a href="${l.href}" class="${className} ${active === l.key ? "is-active" : ""}"${active === l.key ? ' aria-current="page"' : ""}>${l.label}</a></li>`
    ).join("");
  }

  function authAreaHtml() {
    const store = SL.store;
    if (store.isAuthenticated()) {
      const profile = store.getProfile();
      const credits = store.getCredits();
      return `
        <a href="wallet.html" class="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-heading hover:border-primary transition-colors" title="Skill credit balance">
          ${SL.icon("zap", "w-3.5 h-3.5")} ${esc(credits)} credits
        </a>
        <div class="relative" data-profile-menu>
          <button type="button" class="flex items-center gap-2 rounded-full border border-line bg-surface pl-1 pr-2.5 py-1 hover:border-primary transition-colors" aria-haspopup="menu" aria-expanded="false" data-profile-toggle>
            ${SL.ui.avatar(profile, "xs")}
            <span class="hidden md:inline text-sm font-semibold text-heading">${esc((profile.name || "").split(" ")[0])}</span>
            ${SL.icon("chevron-down", "w-4 h-4 text-muted")}
          </button>
          <div class="dropdown" role="menu" hidden data-profile-dropdown>
            <div class="px-3 py-2.5">
              <p class="text-sm font-semibold text-heading truncate">${esc(profile.name)}</p>
              <p class="text-xs text-muted truncate">${esc(profile.email)}</p>
            </div>
            <div class="dropdown-sep"></div>
            ${[
              ["user", "My profile", "profile.html"],
              ["dashboard", "Dashboard", "dashboard.html"],
              ["wallet", "Credit wallet", "wallet.html"],
              ["message-circle", "Messages", "chat.html"],
              ["calendar", "Schedule", "schedule.html"],
              ["star", "Reviews", "reviews.html"],
            ]
              .map(
                ([icon, label, href]) =>
                  `<a class="dropdown-item" role="menuitem" href="${href}">${SL.icon(icon, "w-4 h-4 text-muted")}${label}</a>`
              )
              .join("")}
            <div class="dropdown-sep"></div>
            <button type="button" class="dropdown-item" role="menuitem" data-sign-out>
              ${SL.icon("logout", "w-4 h-4 text-muted")}Sign out
            </button>
          </div>
        </div>`;
    }
    return `
      <a href="login.html?tab=login" class="btn btn-ghost btn-sm">Log in</a>
      <a href="login.html?tab=signup" class="btn btn-primary btn-sm">Sign up</a>`;
  }

  function render() {
    const root = document.getElementById("navbar-root");
    if (!root) return;

    root.innerHTML = `
      <header class="nav-shell">
        <nav class="container-page flex h-16 items-center justify-between gap-4" aria-label="Main">
          <a href="index.html" class="flex items-center gap-2.5 shrink-0" aria-label="SkillLoom home">
            ${SL.logo(34)}
            <span class="font-heading font-extrabold text-lg tracking-tight text-heading">Skill<span class="text-link">Loom</span></span>
          </a>

          <ul class="hidden lg:flex items-center gap-7 list-reset">${navLinksHtml("nav-link")}</ul>

          <div class="hidden lg:flex items-center gap-2">
            <button type="button" class="theme-toggle" data-theme-toggle aria-label="Switch to dark mode"></button>
            <div class="flex items-center gap-2" id="nav-auth">${authAreaHtml()}</div>
          </div>

          <button type="button" class="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-soft border border-line bg-surface text-heading" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu" data-menu-toggle>
            <span data-icon-open>${SL.icon("menu", "w-5 h-5")}</span>
            <span data-icon-close hidden>${SL.icon("x", "w-5 h-5")}</span>
          </button>
        </nav>

        <div id="mobile-menu" class="mobile-menu lg:hidden bg-surface">
          <ul class="container-page pt-3 pb-1 flex flex-col gap-0.5 list-reset">
            ${navLinksHtml("nav-link block w-full px-2 py-3 rounded-soft text-base font-medium")}
          </ul>
          <div class="container-page py-4 border-t border-line flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-muted">Appearance</span>
              <button type="button" class="theme-toggle" data-theme-toggle aria-label="Switch to dark mode"></button>
            </div>
            <div class="flex items-center gap-2 flex-wrap" id="nav-auth-mobile">${authAreaHtml()}</div>
          </div>
        </div>
      </header>`;

    paintThemeIcons();
    wire(root);
  }

  /** Re-render just the auth areas (used after login/logout). */
  function refreshAuth() {
    const desktop = document.getElementById("nav-auth");
    const mobile = document.getElementById("nav-auth-mobile");
    if (desktop) desktop.innerHTML = authAreaHtml();
    if (mobile) mobile.innerHTML = authAreaHtml();
    wireAuth(document);
    paintThemeIcons();
  }

  /* ---------- Theme toggle ------------------------------------------------------ */
  function paintThemeIcons() {
    const dark = SL.store.getTheme() === "dark";
    qsa("[data-theme-toggle]").forEach((btn) => {
      btn.innerHTML = dark ? SL.icon("sun", "w-5 h-5") : SL.icon("moon", "w-5 h-5");
      btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      btn.setAttribute("aria-pressed", String(dark));
      btn.className =
        "inline-flex items-center justify-center w-10 h-10 rounded-soft border border-line bg-surface text-heading hover:border-primary hover:text-link transition-colors";
    });
  }

  /* ---------- Event wiring ------------------------------------------------------- */
  function wire(root) {
    const header = qs("header", root);

    // Scroll shadow
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 6);
    onScroll();
    on(window, "scroll", onScroll, { passive: true });

    // Mobile menu
    const toggle = qs("[data-menu-toggle]", root);
    const menu = qs("#mobile-menu", root);
    const setMenu = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      qs("[data-icon-open]", toggle).hidden = open;
      qs("[data-icon-close]", toggle).hidden = !open;
    };
    on(toggle, "click", () => setMenu(!menu.classList.contains("is-open")));
    qsa("a", menu).forEach((a) => on(a, "click", () => setMenu(false)));

    // Theme buttons
    qsa("[data-theme-toggle]", root).forEach((btn) =>
      on(btn, "click", () => {
        const next = SL.store.toggleTheme();
        paintThemeIcons();
        SL.toast(next === "dark" ? "Dark mode on" : "Light mode on", { type: "info", duration: 2200 });
      })
    );

    wireAuth(root);
  }

  /** Profile dropdown + sign out (auth markup appears in two places). */
  function wireAuth(root) {
    qsa("[data-profile-menu]", root).forEach((wrap) => {
      const btn = qs("[data-profile-toggle]", wrap);
      const dd = qs("[data-profile-dropdown]", wrap);
      if (!btn || !dd || btn.dataset.wired) return;
      btn.dataset.wired = "1";

      const close = () => {
        dd.hidden = true;
        btn.setAttribute("aria-expanded", "false");
      };
      const open = () => {
        dd.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      };

      on(btn, "click", (e) => {
        e.stopPropagation();
        dd.hidden ? open() : close();
      });
      on(document, "click", (e) => {
        if (!wrap.contains(e.target)) close();
      });
      on(document, "keydown", (e) => {
        if (e.key === "Escape" && !dd.hidden) {
          close();
          btn.focus();
        }
      });
    });

    qsa("[data-sign-out]", root).forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      on(btn, "click", async () => {
        await SL.api.auth.logout();
        SL.store.clearUser();
        SL.toast("You have been signed out.", { type: "info" });
        refreshAuth();
        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      });
    });
  }

  SL.navbar = { render, refreshAuth };
})(window.SL);
