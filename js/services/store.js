/* =============================================================================
   SkillLoom — Store (client persistence)
   The only place in the UI that touches localStorage. It holds exactly what
   the product promises to keep across refreshes:
     · fake login state
     · theme choice
     · joined communities
   plus a few demo conveniences (credits, bookings, profile edits) so the
   prototype feels continuous.

   Every read goes through a single accessor, so swapping localStorage for a
   real session/API later means editing only this file.
   ========================================================================== */

window.SL = window.SL || {};

(function (SL) {
  "use strict";

  const PREFIX = "skillloom:";
  const KEYS = {
    THEME: "theme",
    USER: "user",
    COMMUNITIES: "communities",
    CREDITS: "credits",
    BOOKINGS: "bookings",
    PROFILE: "profile",
  };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch (e) {
      /* Private mode / quota — the demo degrades to session-only state. */
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) { /* no-op */ }
  }

  /* ---------- Theme ---------------------------------------------------------- */
  function getTheme() {
    return read(KEYS.THEME, "light");
  }
  function setTheme(theme) {
    write(KEYS.THEME, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    return theme;
  }
  function toggleTheme() {
    return setTheme(getTheme() === "dark" ? "light" : "dark");
  }

  /* ---------- Auth (fake) ----------------------------------------------------- */
  function getUser() {
    return read(KEYS.USER, null);
  }
  function setUser(user) {
    write(KEYS.USER, user);
    return user;
  }
  function clearUser() {
    remove(KEYS.USER);
    remove(KEYS.PROFILE);
  }
  const isAuthenticated = () => getUser() !== null;

  /**
   * The profile shown on Profile / Dashboard. Built from the login form's
   * name + email merged over the seeded template.
   */
  function getProfile() {
    const user = getUser();
    const template = (SL.data && SL.data.defaultProfile) || {};
    if (!user) return null;
    return Object.assign({}, template, read(KEYS.PROFILE, {}), {
      id: "me",
      name: user.name || template.name,
      email: user.email || template.email,
    });
  }
  function saveProfile(patch) {
    const current = read(KEYS.PROFILE, {});
    write(KEYS.PROFILE, Object.assign({}, current, patch));
    return getProfile();
  }
  /**
   * Only what this member explicitly saved — i.e. getProfile() minus the seeded
   * demo template. Lets flows like onboarding tell "never answered" from "the
   * template happens to contain a value".
   */
  function getProfilePatch() {
    return read(KEYS.PROFILE, null);
  }

  /* ---------- Joined communities ---------------------------------------------- */
  function getJoined() {
    const list = read(KEYS.COMMUNITIES, []);
    return Array.isArray(list) ? list : [];
  }
  function isJoined(id) {
    return getJoined().indexOf(id) !== -1;
  }
  function setJoined(ids) {
    write(KEYS.COMMUNITIES, ids);
    return ids;
  }
  function join(id) {
    const list = getJoined();
    if (list.indexOf(id) === -1) list.push(id);
    return setJoined(list);
  }
  function leave(id) {
    return setJoined(getJoined().filter((x) => x !== id));
  }

  /* ---------- Skill credits ----------------------------------------------------- */
  function getCredits() {
    const stored = read(KEYS.CREDITS, null);
    if (stored !== null) return stored;
    const profile = (SL.data && SL.data.defaultProfile) || null;
    return profile ? profile.credits : 0;
  }
  function setCredits(n) {
    write(KEYS.CREDITS, Math.max(0, Math.round(n)));
    return getCredits();
  }
  function addCredits(n) {
    return setCredits(getCredits() + n);
  }
  function spendCredits(n) {
    return setCredits(getCredits() - n);
  }

  /* ---------- Bookings (demo continuity) ------------------------------------------ */
  function getBookings() {
    const list = read(KEYS.BOOKINGS, []);
    return Array.isArray(list) ? list : [];
  }
  function addBooking(booking) {
    const list = getBookings();
    list.unshift(booking);
    write(KEYS.BOOKINGS, list);
    return booking;
  }

  SL.store = {
    KEYS,
    getTheme, setTheme, toggleTheme,
    getUser, setUser, clearUser, isAuthenticated,
    getProfile, saveProfile, getProfilePatch,
    getJoined, isJoined, setJoined, join, leave,
    getCredits, setCredits, addCredits, spendCredits,
    getBookings, addBooking,
  };
})(window.SL);
