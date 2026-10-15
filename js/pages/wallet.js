/* =============================================================================
   SkillLoom — Credit wallet controller
   Balance tiles, a pure-SVG trend chart (week/month toggle) and a filterable
   credit history table (credits earned vs spent per month). No charting
   library — the SVG is built by hand.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, formatNumber } = SL.h;

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

  /* ---------- Credit history ------------------------------------------------------------ */
  const monthLabel = (ts) =>
    new Date(ts).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  /** Aggregate the ledger into months, newest first. */
  function buildPeriods() {
    const groups = new Map();

    SL.data.transactions.forEach((t) => {
      const d = new Date(t.at);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!groups.has(key)) {
        groups.set(key, { at: d.getTime(), earned: 0, spent: 0, earnedCount: 0, spentCount: 0 });
      }
      const g = groups.get(key);
      g.at = Math.max(g.at, d.getTime());
      if (t.type === "earned") {
        g.earned += Math.abs(t.amount);
        g.earnedCount += 1;
      } else {
        g.spent += Math.abs(t.amount);
        g.spentCount += 1;
      }
    });

    return Array.from(groups.values())
      .sort((a, b) => b.at - a.at)
      .map((g) => Object.assign(g, { label: monthLabel(g.at) }));
  }

  /** Human-readable coverage of the ledger: "40 days" / "3 months". */
  function spanLabel() {
    const oldest = SL.data.transactions.reduce((min, t) => {
      const ts = new Date(t.at).getTime();
      return Number.isNaN(ts) ? min : Math.min(min, ts);
    }, Date.now());
    const days = Math.max(1, Math.round((Date.now() - oldest) / 864e5));
    if (days <= 45) return `${days} day${days === 1 ? "" : "s"}`;
    const months = Math.max(1, Math.round(days / 30));
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  /** Proportional bar for an earned/spent amount. */
  function bar(value, max, color) {
    const pct = Math.max(6, Math.round((value / (max || 1)) * 100));
    return `
      <span class="block h-1.5 mt-2 rounded-full bg-surface-3 overflow-hidden" aria-hidden="true">
        <span class="block h-full rounded-full" style="width:${pct}%;background:${color}"></span>
      </span>`;
  }

  /** Show only the columns the active filter applies to. */
  function syncColumns() {
    document.querySelectorAll("[data-col]").forEach((el) => {
      const col = el.getAttribute("data-col");
      el.classList.toggle("hidden", txFilter !== "all" && col !== txFilter);
    });
  }

  function netCell(value) {
    const color = value >= 0 ? "var(--c-success)" : "var(--c-danger)";
    const sign = value > 0 ? "+" : value < 0 ? "−" : "";
    return `<span class="font-semibold" style="color:${color}">${sign}${formatNumber(Math.abs(value))} cr</span>`;
  }

  function renderTable() {
    const body = document.getElementById("tx-body");
    const foot = document.getElementById("tx-foot");
    const empty = document.getElementById("tx-empty");
    const periods = buildPeriods();

    if (!periods.length) {
      body.innerHTML = "";
      foot.classList.add("hidden");
      foot.innerHTML = "";
      empty.hidden = false;
      empty.innerHTML = SL.ui.emptyState({
        icon: "wallet",
        title: "No credit history yet",
        body: "Credits you earn from teaching and spend on learning will appear here as monthly totals.",
      });
      return;
    }

    empty.hidden = true;
    foot.classList.remove("hidden");

    const maxEarned = Math.max.apply(null, periods.map((p) => p.earned).concat(1));
    const maxSpent = Math.max.apply(null, periods.map((p) => p.spent).concat(1));
    const totalEarned = periods.reduce((sum, p) => sum + p.earned, 0);
    const totalSpent = periods.reduce((sum, p) => sum + p.spent, 0);

    body.innerHTML = periods
      .map((p) => {
        const activities = p.earnedCount + p.spentCount;
        return `
        <tr>
          <td class="whitespace-nowrap">
            <span class="font-medium text-heading">${esc(p.label)}</span>
            <span class="block text-xs text-muted mt-0.5">${activities} ${activities === 1 ? "activity" : "activities"} · ${p.earnedCount} earned · ${p.spentCount} spent</span>
          </td>
          <td class="text-right" data-col="earned">
            <span class="font-semibold" style="color:var(--c-success)">+${formatNumber(p.earned)} cr</span>
            ${bar(p.earned, maxEarned, "var(--c-success)")}
          </td>
          <td class="text-right" data-col="spent">
            <span class="font-semibold text-body">−${formatNumber(p.spent)} cr</span>
            ${bar(p.spent, maxSpent, "var(--c-muted)")}
          </td>
          <td class="text-right" data-col="net">${netCell(p.earned - p.spent)}</td>
        </tr>`;
      })
      .join("");

    const footCell = (col, inner) =>
      `<td data-col="${col}" class="text-right" style="background:var(--c-surface-2);border-bottom:none">${inner}</td>`;

    foot.innerHTML = `
      <tr>
        <td class="font-semibold text-heading whitespace-nowrap" style="background:var(--c-surface-2);border-bottom:none">Total · past ${spanLabel()}</td>
        ${footCell("earned", `<span class="font-semibold" style="color:var(--c-success)">+${formatNumber(totalEarned)} cr</span>`)}
        ${footCell("spent", `<span class="font-semibold text-body">−${formatNumber(totalSpent)} cr</span>`)}
        ${footCell("net", netCell(totalEarned - totalSpent))}
      </tr>`;

    syncColumns();
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
