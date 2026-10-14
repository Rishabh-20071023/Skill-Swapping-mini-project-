/* =============================================================================
   SkillLoom — Schedule controller
   Mentor picker → weekly slot grid → details form → confirmation dialog →
   "Session booked!" toast. The booking is stored locally so the dashboard
   shows it on the next visit.

   BACKEND HOOK: SL.api.bookings.book() is the single call to replace.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, formatDate } = SL.h;

  const SLOTS = ["09:30", "12:00", "17:00", "19:30"];

  const state = { mentorId: null, dayIndex: null, slot: null };

  /* ---------- Mentor picker --------------------------------------------------------- */
  function mentorOptions() {
    // One representative listing per mentor.
    const seen = {};
    return SL.data.skills.filter((s) => {
      if (seen[s.userId]) return false;
      seen[s.userId] = true;
      return true;
    }).slice(0, 6);
  }

  function renderMentors() {
    const host = document.getElementById("mentor-picker");
    const options = mentorOptions();

    host.innerHTML = `
      <div class="grid sm:grid-cols-2 gap-3">
        ${options
          .map((s) => {
            const user = SL.data.userById(s.userId);
            const active = state.mentorId === s.id;
            return `
            <button type="button" class="text-left rounded-soft border p-4 flex items-center gap-3 transition-all ${active ? "border-primary bg-surface-2 shadow-soft" : "border-line bg-surface hover:border-line-strong"}"
                    data-mentor="${esc(s.id)}" aria-pressed="${active}">
              ${SL.ui.avatar(user, "md", { presence: true })}
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-semibold text-heading truncate">${esc(user.name)}</span>
                <span class="block text-xs text-muted truncate">${esc(s.title)}</span>
              </span>
              <span class="badge badge-accent shrink-0">${s.credits} cr</span>
            </button>`;
          })
          .join("")}
      </div>
      <p class="text-xs text-muted mt-3">Showing mentors available this week · <a href="browse.html" class="text-link font-semibold">browse all skills</a></p>`;
  }

  /* ---------- Weekly slot grid ---------------------------------------------------------- */
  function weekDays() {
    const now = new Date();
    const monday = new Date(now);
    const day = (now.getDay() + 6) % 7; // 0 = Monday
    monday.setDate(now.getDate() - day);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }

  function renderSlots() {
    const host = document.getElementById("slot-grid");
    const days = weekDays();
    const now = new Date();
    document.getElementById("week-label").textContent =
      `${formatDate(days[0])} — ${formatDate(days[6])}`;

    host.innerHTML = days
      .map((date, di) => {
        const sameDay = date.toDateString() === now.toDateString();
        const isPast = date < new Date(now.toDateString());
        return `
        <div class="rounded-soft border border-line bg-surface-2 p-3.5 ${isPast ? "opacity-55" : ""}">
          <p class="text-xs font-semibold text-heading flex items-center justify-between">
            <span>${formatDate(date, { weekday: "short", day: "numeric", month: "short" })}</span>
            ${sameDay ? `<span class="badge badge-primary">Today</span>` : ""}
          </p>
          <div class="flex flex-wrap gap-2 mt-2.5">
            ${SLOTS.map((slot) => {
              const [h, m] = slot.split(":").map(Number);
              const when = new Date(date);
              when.setHours(h, m, 0, 0);
              const past = when <= now;
              const active = state.dayIndex === di && state.slot === slot;
              return `<button type="button" class="chip !py-1.5 !px-3 text-xs ${active ? "is-active" : ""}"
                        data-slot data-day="${di}" data-time="${slot}" ${past ? "disabled" : ""}
                        aria-pressed="${active}" title="${past ? "Time already passed" : "Select " + slot}">
                        ${slot}
                      </button>`;
            }).join("") || `<span class="text-xs text-muted">Unavailable</span>`}
          </div>
        </div>`;
      })
      .join("");
  }

  function selectedDate() {
    if (state.dayIndex === null || !state.slot) return null;
    const d = weekDays()[state.dayIndex];
    const [h, m] = state.slot.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  }

  function mentor() {
    return state.mentorId ? SL.data.skills.find((s) => s.id === state.mentorId) : null;
  }

  function renderSummary() {
    const host = document.getElementById("booking-summary");
    const m = mentor();
    const when = selectedDate();
    if (!m || !when) {
      host.innerHTML = `Select a mentor and a time slot to continue.`;
      return;
    }
    const user = SL.data.userById(m.userId);
    host.innerHTML = `
      <span class="block font-semibold text-heading">
        ${formatDate(when, { weekday: "long", day: "numeric", month: "short" })} · ${state.slot}
      </span>
      <span class="block text-xs text-muted">with ${esc(user.name)} · ${esc(m.duration)} · ${m.credits} credits</span>`;
  }

  /* ---------- Upcoming sessions ----------------------------------------------------------- */
  function renderUpcoming() {
    const host = document.getElementById("upcoming-list");
    const sessions = SL.store.getBookings().concat(SL.data.sessions);
    if (!sessions.length) {
      host.innerHTML = `<li>${SL.ui.emptyState({ icon: "calendar", title: "Nothing booked", body: "Pick a slot to get started." })}</li>`;
      return;
    }
    host.innerHTML = sessions.slice(0, 5).map((s) => SL.cards.sessionRow(s)).join("");
  }

  /* ---------- Confirmation ------------------------------------------------------------------ */
  function openConfirmation(details) {
    SL.modal.open({
      title: "Confirm your session",
      subtitle: "Nothing is charged — credits settle after both sides confirm.",
      body: `
        <div class="rounded-soft border border-line bg-surface-2 divide-y divide-line">
          ${[
            ["Mentor", details.mentorName],
            ["Skill", details.title],
            ["When", details.when],
            ["Duration", details.duration],
            ["Format", details.format],
            ["Credit cost", `${details.credits} credits`],
          ]
            .map(
              ([k, v]) => `
              <div class="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span class="text-muted">${k}</span>
                <span class="font-semibold text-heading text-right">${esc(v)}</span>
              </div>`
            )
            .join("")}
        </div>
        <p class="text-xs text-muted mt-3 leading-body pb-2">
          ${SL.icon("info", "w-4 h-4 inline -mt-0.5")}
          Your mentor has 24 hours to confirm. You can cancel free up to 12 hours before the start.
        </p>`,
      footer: `
        <button type="button" class="btn btn-outline btn-sm" data-modal-close>Go back</button>
        <button type="button" class="btn btn-primary btn-sm" data-confirm-book>Confirm booking</button>`,
      onMount(dialog, close) {
        const btn = dialog.querySelector("[data-confirm-book]");
        btn.addEventListener("click", async () => {
          btn.disabled = true;
          btn.innerHTML = `<span class="spinner"></span> Booking…`;
          const booking = await SL.api.bookings.book({
            withUserId: details.userId,
            title: details.title,
            startsAt: details.date.toISOString(),
            duration: details.duration,
            format: details.format,
            credits: details.credits,
          });
          SL.store.addBooking(booking);
          close();
          SL.toast("Session booked!", {
            type: "success",
            title: "Session booked",
            duration: 4200,
          });
          renderUpcoming();
          resetForm();
        });
      },
    });
  }

  function resetForm() {
    state.mentorId = null;
    state.dayIndex = null;
    state.slot = null;
    document.getElementById("booking-form").reset();
    renderMentors();
    renderSlots();
    renderSummary();
  }

  /* ---------- Boot ------------------------------------------------------------------------------ */
  function init() {
    SL.navbar.render();
    SL.footer.render();

    renderMentors();
    renderSlots();
    renderSummary();
    renderUpcoming();

    // Mentor selection
    document.getElementById("mentor-picker").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-mentor]");
      if (!btn) return;
      state.mentorId = btn.dataset.mentor;
      renderMentors();
      renderSummary();
    });

    // Slot selection
    document.getElementById("slot-grid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-slot]");
      if (!btn || btn.disabled) return;
      state.dayIndex = Number(btn.dataset.day);
      state.slot = btn.dataset.time;
      renderSlots();
      renderSummary();
    });

    // Form validation + confirmation
    document.getElementById("booking-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const topic = document.getElementById("session-topic");
      const err = document.getElementById("err-session-topic");
      const fail = (msg) => {
        topic.setAttribute("aria-invalid", "true");
        err.innerHTML = `${SL.icon("alert", "w-3.5 h-3.5")}<span>${esc(msg)}</span>`;
        err.classList.add("is-visible");
        topic.focus();
      };
      const pass = () => {
        topic.removeAttribute("aria-invalid");
        err.classList.remove("is-visible");
      };

      if (topic.value.trim().length < 4) {
        fail("Add a short description of what you'd like to work on.");
        return;
      }
      pass();

      const m = mentor();
      const when = selectedDate();
      if (!m) {
        SL.toast("Choose a mentor first.", { type: "warning" });
        return;
      }
      if (!when) {
        SL.toast("Pick a time slot to continue.", { type: "warning" });
        return;
      }
      if (!SL.store.isAuthenticated()) {
        SL.toast("Sign in to book a session.", { type: "warning", title: "Sign in required" });
        setTimeout(() => (window.location.href = "login.html?next=schedule.html"), 900);
        return;
      }

      const user = SL.data.userById(m.userId);
      const format = (document.querySelector('input[name="format"]:checked') || {}).value || "Video call";

      openConfirmation({
        userId: m.userId,
        mentorName: user.name,
        title: topic.value.trim(),
        when: `${formatDate(when, { weekday: "long", day: "numeric", month: "long" })} at ${state.slot}`,
        duration: m.duration,
        format,
        credits: m.credits,
        date: when,
      });
    });

    SL.motion.initAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
