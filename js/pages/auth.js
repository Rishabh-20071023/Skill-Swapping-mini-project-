/* =============================================================================
   SkillLoom — Auth page controller (login.html)
   Client-side validation, tab switching and a *fake* session: on success we
   store the account in localStorage and redirect to the dashboard.

   BACKEND HOOK: swap SL.api.auth.login / signup for real requests — the form,
   validation and redirects stay exactly as they are.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { qs, qsa, on, esc, getParam } = SL.h;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MIN_PASSWORD = 8;

  let mode = getParam("tab") === "signup" ? "signup" : "login";

  const els = {};

  function cacheEls() {
    els.form = qs("#auth-form");
    els.nameGroup = qs("#group-name");
    els.confirmGroup = qs("#group-confirm");
    els.name = qs("#auth-name");
    els.email = qs("#auth-email");
    els.password = qs("#auth-password");
    els.confirm = qs("#auth-confirm");
    els.submit = qs("#auth-submit");
    els.submitLabel = qs("[data-submit-label]");
    els.switch = qs("#auth-switch");
    els.formError = qs("#form-error");
    els.panel = qs("#auth-panel");
  }

  /* ---------- Tabs -------------------------------------------------------------- */
  function setMode(next, updateUrl) {
    mode = next;
    const signup = mode === "signup";

    qsa("[data-tab]").forEach((tab) => {
      const active = tab.dataset.tab === mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    els.nameGroup.hidden = !signup;
    els.confirmGroup.hidden = !signup;
    els.password.autocomplete = signup ? "new-password" : "current-password";
    els.submitLabel.textContent = signup ? "Create account" : "Log in";
    els.panel.setAttribute("aria-labelledby", signup ? "tab-signup" : "tab-login");

    els.switch.innerHTML = signup
      ? `Already have an account? <button type="button" class="font-semibold text-link hover:underline" data-go="login">Log in</button>`
      : `New to SkillLoom? <button type="button" class="font-semibold text-link hover:underline" data-go="signup">Create an account</button>`;

    els.formError.hidden = true;
    clearAllErrors();
    if (updateUrl) {
      try {
        history.replaceState(null, "", `login.html?tab=${mode}${nextParam()}`);
      } catch (e) { /* file:// */ }
    }
  }

  const nextParam = () => {
    const next = getParam("next");
    return next ? `&next=${encodeURIComponent(next)}` : "";
  };

  /* ---------- Validation ---------------------------------------------------------- */
  function setError(input, message) {
    const err = document.getElementById(`err-${input.id.replace("auth-", "")}`);
    input.setAttribute("aria-invalid", "true");
    if (err) {
      err.innerHTML = `${SL.icon("alert", "w-3.5 h-3.5")}<span>${esc(message)}</span>`;
      err.classList.add("is-visible");
    }
  }

  function clearError(input) {
    const err = document.getElementById(`err-${input.id.replace("auth-", "")}`);
    input.removeAttribute("aria-invalid");
    if (err) {
      err.classList.remove("is-visible");
      err.textContent = "";
    }
  }

  function clearAllErrors() {
    [els.name, els.email, els.password, els.confirm].forEach((el) => el && clearError(el));
  }

  function validate() {
    clearAllErrors();
    let ok = true;
    let firstBad = null;

    if (mode === "signup" && els.name.value.trim().length < 2) {
      setError(els.name, "Please enter your full name.");
      ok = false;
      firstBad = firstBad || els.name;
    }

    const email = els.email.value.trim();
    if (!email) {
      setError(els.email, "Email address is required.");
      ok = false;
      firstBad = firstBad || els.email;
    } else if (!EMAIL_RE.test(email)) {
      setError(els.email, "Enter a valid email address, e.g. you@example.com.");
      ok = false;
      firstBad = firstBad || els.email;
    }

    const password = els.password.value;
    if (!password) {
      setError(els.password, "Password is required.");
      ok = false;
      firstBad = firstBad || els.password;
    } else if (password.length < MIN_PASSWORD) {
      setError(els.password, `Password must be at least ${MIN_PASSWORD} characters.`);
      ok = false;
      firstBad = firstBad || els.password;
    }

    if (mode === "signup" && els.confirm.value !== password) {
      setError(els.confirm, "Passwords do not match.");
      ok = false;
      firstBad = firstBad || els.confirm;
    }

    if (!ok && firstBad) firstBad.focus();
    return ok;
  }

  /* ---------- Submit ---------------------------------------------------------------- */
  function setLoading(loading) {
    els.submit.disabled = loading;
    els.submit.innerHTML = loading
      ? `<span class="spinner"></span> ${mode === "signup" ? "Creating your account…" : "Signing you in…"}`
      : `<span data-submit-label>${mode === "signup" ? "Create account" : "Log in"}</span>`;
    els.submitLabel = qs("[data-submit-label]", els.submit) || els.submit;
  }

  async function onSubmit(e) {
    e.preventDefault();
    els.formError.hidden = true;
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: els.name.value.trim(),
        email: els.email.value.trim(),
        password: els.password.value,
      };
      const result =
        mode === "signup"
          ? await SL.api.auth.signup(payload)
          : await SL.api.auth.login(payload);

      SL.store.setUser(result.user);
      if (mode === "signup") SL.store.saveProfile({ name: result.user.name, email: result.user.email });

      SL.toast(
        mode === "signup" ? "Welcome to SkillLoom — your profile is ready." : "Signed in successfully.",
        { type: "success" }
      );

      const next = sanitizeNext(getParam("next", "dashboard.html"));
      setTimeout(() => window.location.replace(next), 650);
    } catch (err) {
      setLoading(false);
      els.formError.hidden = false;
      els.formError.innerHTML = SL.ui.alertBox("", "error");
      els.formError.querySelector("p").textContent = err.message || "Something went wrong. Please try again.";
    }
  }

  /** Only allow same-origin page names — no open redirects. Query strings are kept. */
  function sanitizeNext(value) {
    const raw = String(value || "dashboard.html");
    const allowed = ["dashboard.html", "browse.html", "community.html", "index.html", "profile.html", "schedule.html", "wallet.html", "chat.html", "reviews.html"];
    const qIndex = raw.indexOf("?");
    const file = (qIndex === -1 ? raw : raw.slice(0, qIndex)).split("/").pop();
    if (allowed.indexOf(file) === -1) return "dashboard.html";
    const query = qIndex === -1 ? "" : raw.slice(qIndex);
    return /^[?&a-zA-Z0-9%=-]+$/.test(query) ? file + query : file;
  }

  /* ---------- Boot ------------------------------------------------------------------- */
  function init() {
    document.getElementById("auth-logo").innerHTML = SL.logo(34);
    SL.navbar.render();
    SL.footer.render();
    cacheEls();

    // Already signed in → straight to the dashboard.
    if (SL.store.isAuthenticated() && getParam("tab") !== "signup") {
      window.location.replace(sanitizeNext(getParam("next", "dashboard.html")));
      return;
    }

    setMode(mode, false);

    qsa("[data-tab]").forEach((tab) =>
      on(tab, "click", () => setMode(tab.dataset.tab, true))
    );

    // Keyboard support for the tab list (roving tabindex).
    qs(".tabs").addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      setMode(mode === "login" ? "signup" : "login", true);
      qs(`[data-tab="${mode}"]`).focus();
    });

    on(els.switch, "click", (e) => {
      const btn = e.target.closest("[data-go]");
      if (btn) setMode(btn.dataset.go, true);
    });

    // Show / hide password
    const toggle = qs("[data-toggle-password]");
    toggle.innerHTML = SL.icon("eye", "w-4 h-4");
    on(toggle, "click", () => {
      const showing = els.password.type === "text";
      els.password.type = showing ? "password" : "text";
      toggle.innerHTML = SL.icon(showing ? "eye" : "eye-off", "w-4 h-4");
      toggle.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      els.password.focus();
    });

    // Inline validation as the user fixes fields.
    [els.name, els.email, els.password, els.confirm].forEach((input) => {
      if (!input) return;
      on(input, "input", () => {
        if (input.getAttribute("aria-invalid") === "true") clearError(input);
      });
    });

    on(els.form, "submit", onSubmit);

    // Demo helper
    on(qs("#demo-fill"), "click", () => {
      els.email.value = "demo@skillloom.com";
      els.password.value = "skillloom123";
      if (mode === "signup") {
        els.name.value = "Demo Member";
        els.confirm.value = "skillloom123";
      }
      clearAllErrors();
      SL.toast("Demo credentials filled in — submit to continue.", { type: "info" });
    });

    SL.motion.initAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
