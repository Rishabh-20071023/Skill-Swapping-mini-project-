/* =============================================================================
   SkillLoom — Data: credit wallet
   Dummy ledger of skill-credit movements plus the chart series used by the
   wallet page. Credits are the platform's unit of exchange — never money.
   ========================================================================== */

window.SL = window.SL || {};
SL.data = SL.data || {};

(function (data) {
  "use strict";

  const daysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString();

  /** type: "earned" (taught) · "spent" (learned) */
  data.transactions = [
    { id: "t1", at: daysAgo(1), type: "earned", title: "Design systems for engineers", withName: "Kenji Tanaka", amount: 12, balance: 340 },
    { id: "t2", at: daysAgo(2), type: "spent", title: "Piano fundamentals — session 2", withName: "Grace Kim", amount: -12, balance: 328 },
    { id: "t3", at: daysAgo(4), type: "earned", title: "Portfolio critique for juniors", withName: "Elena Rossi", amount: 15, balance: 340 },
    { id: "t4", at: daysAgo(6), type: "spent", title: "Conversational Mandarin", withName: "Mei-Ling Chen", amount: -11, balance: 325 },
    { id: "t5", at: daysAgo(8), type: "earned", title: "Community workshop: UX writing", withName: "SkillLoom Events", amount: 20, balance: 336 },
    { id: "t6", at: daysAgo(9), type: "spent", title: "Strength programme review", withName: "Marcus Boateng", amount: -8, balance: 316 },
    { id: "t7", at: daysAgo(11), type: "earned", title: "Figma handoff clinic", withName: "Hannah Weiss", amount: 13, balance: 324 },
    { id: "t8", at: daysAgo(13), type: "earned", title: "First Swap bonus", withName: "SkillLoom", amount: 25, balance: 311 },
    { id: "t9", at: daysAgo(15), type: "spent", title: "Manual mode photography walk", withName: "Nadia Haddad", amount: -11, balance: 286 },
    { id: "t10", at: daysAgo(18), type: "earned", title: "Design review for a landing page", withName: "Lucas Moreau", amount: 12, balance: 297 },
    { id: "t11", at: daysAgo(21), type: "spent", title: "Knife skills & sauces", withName: "Tomás Rivera", amount: -9, balance: 285 },
    { id: "t12", at: daysAgo(24), type: "earned", title: "Accessibility audit walkthrough", withName: "Oliver Grant", amount: 16, balance: 294 },
    { id: "t13", at: daysAgo(27), type: "earned", title: "Contribution reward: 10 posts", withName: "SkillLoom", amount: 50, balance: 278 },
    { id: "t14", at: daysAgo(31), type: "spent", title: "Statistics clinic", withName: "Daniel Okafor", amount: -14, balance: 228 },
    { id: "t15", at: daysAgo(35), type: "earned", title: "Interface teardown session", withName: "Amara Singh", amount: 14, balance: 242 },
    { id: "t16", at: daysAgo(40), type: "spent", title: "Guitar: chord changes", withName: "Sofia Almeida", amount: -10, balance: 228 },
  ];

  /* ---------- Chart series (net balance trend) -------------------------------- */
  data.walletSeries = {
    week: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      values: [316, 328, 328, 340, 340, 340, 340],
      delta: "+24",
    },
    month: {
      labels: ["W1", "W2", "W3", "W4", "W5"],
      values: [286, 311, 316, 340, 340],
      delta: "+54",
    },
  };

  /** Summary tiles rendered at the top of the wallet page. */
  data.walletSummary = {
    balance: 340,
    earnedTotal: 486,
    spentTotal: 146,
    earnedMonth: 60,
    spentMonth: 23,
    pending: 12,
  };
})(SL.data);
