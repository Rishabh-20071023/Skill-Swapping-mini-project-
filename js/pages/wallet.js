/* =============================================================================
   SkillLoom — Credit wallet controller
   Balance tiles, a pure-SVG trend chart (week/month toggle) and a filterable
   transaction table. No charting library — the SVG is built by hand.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, formatDate, formatNumber } = SL.h;

  let range = "week";
  let txFilter = "all";

  /* ---------- Summary tiles ------------------------------------------------------- */
  function renderSummary() {
    const host = document.getElementById("wallet-summary");
    const s = SL.data.walletSummary;
    const balance = SL.store.getCredits();

    const tile = (o) => `
      <div class="card p-5 ${o.emphasis ? "gradient-navy text-white border-0" : ""}">
        <p class="text-[0.68rem] uppercase tracking-[0.14em] font-semibold ${o.emphasis ? "text-white/60" : "text-muted"}">${esc(o.label)}</p>
        <p class="font-heading font-extrabold text-2xl sm:text-3xl mt-2 leading-none ${o.emphasis ? "text-white" : "text-heading"}">${o.value}</p>
        <p class="text-xs mt-2 ${o.emphasis ? "text-white/60" : "text-muted"}">${esc(o.note)}</p>
      </div>`;

    host.innerHTML = [
      tile({
        label: "Current balance",
        value: `${formatNumber(balance)} <span class="text-base font-semibold ${"opacity-70"}">credits</span>`,
        note: "Available to spend on sessions",
        emphasis: true,
      }),
      tile({ label: "Earned (30 days)", value: `<span style="color:var(--c-success)">+${s.earnedMonth}</span>`, note: "From teaching sessions" }),
      tile({ label: "Spent (30 days)", value: `−${s.spentMonth}`, note: "On learning sessions" }),
      tile({ label: "Lifetime", value: `${s.earnedTotal} / ${s.spentTotal}`, note: "Earned / spent" }),
    ].join("");
  }

  /* ---------- Chart ------------------------------------------------------------------- */
  function buildChart(series) {
    const W = 680;
    const H = 260;
    const padL = 44;
    const padR = 20;
    const padT = 26;
    const padB = 40;
    const vals = series.values;
    const labels = series.labels;
    const n = vals.length;

    const min = Math.min.apply(null, vals);
    const max = Math.max.apply(null, vals);
    const span = max - min || 1;
    const lo = min - span * 0.45;
    const hi = max + span * 0.45;

    const xAt = (i) => padL + (i * (W - padL - padR)) / Math.max(1, n - 1);
    const yAt = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);

    const pts = vals.map((v, i) => ({ x: xAt(i), y: yAt(v), v }));

    // Smooth horizontal cubic curve through every point.
    const line = pts.reduce((acc, p, i, a) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = a[i - 1];
      const mid = (prev.x + p.x) / 2;
      return `${acc} C ${mid} ${prev.y} ${mid} ${p.y} ${p.x} ${p.y}`;
    }, "");

    const area = `${line} L ${pts[n - 1].x} ${H - padB} L ${pts[0].x} ${H - padB} Z`;

    // Horizontal gridlines + y labels
    const gridLines = [0, 0.5, 1]
      .map((t) => {
        const y = padT + t * (H - padT - padB);
        const value = Math.round(hi - t * (hi - lo));
        return `
          <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--c-border)" stroke-width="1" stroke-dasharray="4 6" />
          <text x="${padL - 10}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--c-muted)">${value}</text>`;
      })
      .join("");

    const xLabels = pts
      .map(
        (p, i) =>
          `<text x="${p.x}" y="${H - padB + 22}" text-anchor="middle" font-size="11" fill="var(--c-muted)">${esc(labels[i])}</text>`
      )
      .join("");

    const dots = pts
      .map(
        (p, i) =>
          `<circle cx="${p.x}" cy="${p.y}" r="${i === n - 1 ? 6 : 3.5}" fill="${i === n - 1 ? "#0EA5E9" : "var(--c-surface)"}" stroke="#0EA5E9" stroke-width="2" />`
      )
      .join("");

    const last = pts[n - 1];
    const badgeW = 66;
    const badgeX = Math.min(last.x + 10, W - padR - badgeW);

    return `
      <svg viewBox="0 0 ${W} ${H}" class="w-full h-auto" aria-hidden="true">
        <defs>
          <linearGradient id="wallet-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0EA5E9" stop-opacity="0.28" />
            <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0.02" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${area}" fill="url(#wallet-area)" />
        <path d="${line}" fill="none" stroke="#0EA5E9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" class="chart-line" />
        ${dots}
        <g transform="translate(${badgeX}, ${Math.max(4, last.y - 34)})">
          <rect width="${badgeW}" height="24" rx="12" fill="var(--c-heading)" />
          <text x="${badgeW / 2}" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="var(--c-surface)">${last.v}</text>
        </g>
        ${xLabels}
      </svg>`;
  }

  function renderChart() {
    const series = SL.data.walletSeries[range];
    document.getElementById("chart-host").innerHTML = buildChart(series);
    document.getElementById("chart-subtitle").textContent =
      range === "week" ? "Last 7 days · daily balance" : "Last 5 weeks · weekly balance";
  }

  /* ---------- Transaction table --------------------------------------------------------- */
  function renderTable() {
    const body = document.getElementById("tx-body");
    const empty = document.getElementById("tx-empty");
    const rows = SL.data.transactions.filter((t) => txFilter === "all" || t.type === txFilter);

    if (!rows.length) {
      body.innerHTML = "";
      empty.hidden = false;
      empty.innerHTML = SL.ui.emptyState({
        icon: "wallet",
        title: "No transactions in this filter",
        body: "Switch the filter above to see the rest of your history.",
      });
      return;
    }

    empty.hidden = true;
    body.innerHTML = rows
      .map((t) => {
        const earned = t.type === "earned";
        return `
        <tr>
          <td class="whitespace-nowrap text-muted">${formatDate(t.at)}</td>
          <td class="font-medium text-heading">${esc(t.title)}</td>
          <td class="text-muted">${esc(t.withName)}</td>
          <td>${SL.ui.badge(earned ? "Earned" : "Spent", earned ? "success" : "neutral")}</td>
          <td class="text-right font-semibold" style="color:${earned ? "var(--c-success)" : "var(--c-body)"}">
            ${earned ? "+" : "−"}${Math.abs(t.amount)} cr
          </td>
          <td class="text-right text-muted">${t.balance} cr</td>
        </tr>`;
      })
      .join("");
  }

  /* ---------- Chip toggles ------------------------------------------------------------------ */
  function wireChips(attr, onChange) {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(`[${attr}]`);
      if (!btn) return;
      const value = btn.getAttribute(attr);
      document.querySelectorAll(`[${attr}]`).forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      onChange(value);
    });
  }

  /* ---------- Boot ------------------------------------------------------------------------------ */
  function init() {
    SL.navbar.render();
    SL.footer.render();

    renderSummary();
    renderChart();
    renderTable();

    wireChips("data-range", (value) => {
      range = value;
      renderChart();
    });
    wireChips("data-tx-filter", (value) => {
      txFilter = value;
      renderTable();
    });

    SL.motion.initAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
