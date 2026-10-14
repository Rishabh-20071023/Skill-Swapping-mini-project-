/* =============================================================================
   SkillLoom — Ratings & reviews controller
   Rating summary with breakdown bars, the reviews you've received, the ones
   you've left, and a modal built on the reusable interactive star component.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, formatDate } = SL.h;

  /* ---------- Summary ---------------------------------------------------------------- */
  function renderSummary() {
    const host = document.getElementById("rating-summary");
    const { average, total } = SL.data.ratingAverage;
    const breakdown = SL.data.ratingBreakdown;
    const max = Math.max.apply(null, breakdown.map((r) => r.count)) || 1;

    host.innerHTML = `
      <h2 id="summary-title" class="font-heading font-bold text-lg text-heading mb-5">Your rating</h2>

      <div class="flex items-center gap-5">
        <div class="text-center shrink-0">
          <p class="font-heading font-extrabold text-5xl text-heading leading-none">${average.toFixed(1)}</p>
          <div class="mt-2">${SL.rating.display(average, "w-5 h-5")}</div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-heading">${formatDate(new Date(), { month: "long", year: "numeric" })} standing</p>
          <p class="text-xs text-muted mt-0.5 leading-body">
            Based on ${total} reviews across ${SL.data.reviews.length + SL.data.memberReviews.length}+ sessions.
            Top 8% of members in Design.
          </p>
          <div class="flex flex-wrap gap-2 mt-3">
            ${SL.ui.badge("Verified mentor", "accent", "shield")}
            ${SL.ui.badge("98% response rate", "primary", "clock")}
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2.5 mt-6 pt-5 border-t border-line">
        ${breakdown
          .map(
            (r) => `
          <div class="breakdown-row">
            <span class="text-muted">${r.stars} star${r.stars > 1 ? "s" : ""}</span>
            <span class="breakdown-track"><span class="breakdown-fill" data-value="${Math.round((r.count / max) * 100)}"></span></span>
            <span class="text-right text-muted">${r.count}</span>
          </div>`
          )
          .join("")}
      </div>`;
  }

  /* ---------- Received ------------------------------------------------------------------- */
  function renderReceived() {
    document.getElementById("received-list").innerHTML = SL.data.reviews
      .map((r) => SL.cards.reviewCard(r))
      .join("");
    document.getElementById("received-count").textContent = `${SL.data.reviews.length} reviews`;
  }

  /* ---------- Given ----------------------------------------------------------------------- */
  function memberFromName(name) {
    const known = SL.data.users.find((u) => u.name === name);
    if (known) return known;
    let tone = 0;
    for (let i = 0; i < name.length; i++) tone = (tone + name.charCodeAt(i)) % 6;
    return { name, tone };
  }

  function renderGiven() {
    const host = document.getElementById("given-list");
    const rows = SL.data.reviewsGiven;

    if (!rows.length) {
      host.innerHTML = SL.ui.emptyState({
        icon: "star",
        title: "You haven't reviewed anyone yet",
        body: "After your next session you can leave feedback here.",
        action: `<a href="schedule.html" class="btn btn-primary btn-sm mt-1">View sessions</a>`,
      });
      document.getElementById("given-count").textContent = "0 reviews";
      return;
    }

    host.innerHTML = rows
      .map((r) => {
        const target = r.toUserId ? SL.data.userById(r.toUserId) : memberFromName(r.toName || "Member");
        return `
        <article class="card p-5 flex flex-col gap-3 h-full">
          <header class="flex items-center gap-3">
            ${SL.ui.avatar(target, "md")}
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-heading truncate">${esc(target.name)}</p>
              <p class="text-xs text-muted truncate">${esc(r.skill)}</p>
            </div>
            ${SL.rating.display(r.rating, "w-4 h-4")}
          </header>
          <p class="text-sm text-body leading-body flex-1">${esc(r.body)}</p>
          <footer class="text-xs text-muted pt-3 border-t border-line flex items-center justify-between">
            <span>${formatDate(r.createdAt)}</span>
            <span class="badge badge-neutral">${r.rating}.0 / 5</span>
          </footer>
        </article>`;
      })
      .join("");

    document.getElementById("given-count").textContent = `${rows.length} reviews`;
  }

  /* ---------- Leave a review modal ----------------------------------------------------------- */
  function reviewableSessions() {
    return SL.data.transactions
      .filter((t) => t.title.indexOf("bonus") === -1 && t.title.indexOf("reward") === -1)
      .slice(0, 8);
  }

  function openReviewModal() {
    if (!SL.store.isAuthenticated()) {
      SL.toast("Sign in to leave a review.", { type: "warning" });
      window.location.href = "login.html?next=reviews.html";
      return;
    }

    const sessions = reviewableSessions();

    SL.modal.open({
      title: "Leave a review",
      subtitle: "Reviews are public and can't be edited after 14 days.",
      body: `
        <div class="flex flex-col gap-5 pb-2">
          <div>
            <label class="label" for="rv-session">Which session?</label>
            <select class="select" id="rv-session">
              ${sessions
                .map((s, i) => `<option value="${i}">${esc(s.title)} — ${esc(s.withName)}</option>`)
                .join("")}
            </select>
          </div>

          <div>
            <span class="label">Your rating</span>
            <div class="flex items-center gap-4">
              <div id="rv-stars"></div>
              <span class="text-sm font-semibold text-link" id="rv-label" aria-live="polite"></span>
            </div>
            <p class="field-error" id="err-rv-rating" role="alert"></p>
          </div>

          <div>
            <label class="label" for="rv-body">Your review</label>
            <textarea class="textarea" id="rv-body" rows="4" maxlength="500"
              placeholder="What went well? What would you tell a member considering a session with them?"
              aria-describedby="rv-hint err-rv-body"></textarea>
            <p class="hint" id="rv-hint">Minimum 10 characters. Kind, specific feedback helps everyone.</p>
            <p class="field-error" id="err-rv-body" role="alert"></p>
          </div>
        </div>`,
      footer: `
        <button type="button" class="btn btn-outline btn-sm" data-modal-close>Cancel</button>
        <button type="button" class="btn btn-primary btn-sm" data-submit-review>Publish review</button>`,
      onMount(dialog, close) {
        let rating = 0;
        const label = dialog.querySelector("#rv-label");
        SL.rating.mount(dialog.querySelector("#rv-stars"), {
          value: 0,
          size: "w-7 h-7",
          labels: SL.data.ratingLabels,
          labelEl: label,
          onChange: (v) => {
            rating = v;
            dialog.querySelector("#err-rv-rating").classList.remove("is-visible");
          },
        });

        const submit = dialog.querySelector("[data-submit-review]");
        submit.addEventListener("click", async () => {
          const body = dialog.querySelector("#rv-body");
          const errRating = dialog.querySelector("#err-rv-rating");
          const errBody = dialog.querySelector("#err-rv-body");
          let ok = true;

          if (!rating) {
            errRating.innerHTML = `${SL.icon("alert", "w-3.5 h-3.5")}<span>Please choose a star rating.</span>`;
            errRating.classList.add("is-visible");
            ok = false;
          }
          if (body.value.trim().length < 10) {
            body.setAttribute("aria-invalid", "true");
            errBody.innerHTML = `${SL.icon("alert", "w-3.5 h-3.5")}<span>Please write at least 10 characters.</span>`;
            errBody.classList.add("is-visible");
            ok = false;
          } else {
            body.removeAttribute("aria-invalid");
            errBody.classList.remove("is-visible");
          }
          if (!ok) return;

          submit.disabled = true;
          submit.innerHTML = `<span class="spinner"></span> Publishing…`;

          const idx = Number(dialog.querySelector("#rv-session").value);
          const session = sessions[idx];
          const created = await SL.api.reviews.create({
            toUserId: (SL.data.users.find((u) => u.name === session.withName) || {}).id,
            toName: session.withName,
            rating,
            skill: session.title,
            body: body.value.trim(),
          });

          SL.data.reviewsGiven.unshift(created);
          close();
          renderGiven();
          SL.toast(`Review published — thank you.`, { type: "success", title: "Review published" });
        });
      },
    });
  }

  /* ---------- Boot -------------------------------------------------------------------------- */
  function init() {
    SL.navbar.render();
    SL.footer.render();

    renderSummary();
    renderReceived();
    renderGiven();

    document.getElementById("open-review-modal").addEventListener("click", openReviewModal);

    // "Helpful" toggles on received reviews
    document.addEventListener("click", (e) => {
      const helpful = e.target.closest("[data-helpful]");
      if (!helpful || helpful.dataset.done) return;
      helpful.dataset.done = "1";
      const count = helpful.querySelector("[data-helpful-count]");
      if (count) count.textContent = Number(count.textContent) + 1;
      helpful.classList.add("text-link");
    });

    SL.motion.initAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
