/* =============================================================================
   SkillLoom — Data: ratings & reviews
   Reviews received by the signed-in member, plus the rating distribution
   used by the breakdown bars.
   ========================================================================== */

window.SL = window.SL || {};
SL.data = SL.data || {};

(function (data) {
  "use strict";

  const daysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString();

  data.ratingBreakdown = [
    { stars: 5, count: 59 },
    { stars: 4, count: 3 },
    { stars: 3, count: 1 },
    { stars: 2, count: 0 },
    { stars: 1, count: 1 },
  ];

  data.reviews = [
    {
      id: "rv1",
      fromUserId: "u9",
      rating: 5,
      skill: "Design systems review",
      sessionType: "Video call · 60 min",
      createdAt: daysAgo(2),
      body:
        "Priya came with a specific problem and left with a system. She explained the reasoning behind every token choice, then rewrote two of my components on the spot. One of the clearest sessions I've had on SkillLoom.",
      helpful: 14,
    },
    {
      id: "rv2",
      fromUserId: "u7",
      rating: 5,
      skill: "Portfolio critique",
      sessionType: "Video call · 45 min",
      createdAt: daysAgo(8),
      body:
        "Honest, structured, and genuinely kind. No vague feedback — she pointed at the exact paragraph that was weakening my case study and showed me how to fix it.",
      helpful: 9,
    },
    {
      id: "rv3",
      fromUserId: "u11",
      rating: 4,
      skill: "UX writing for pricing pages",
      sessionType: "In person · 45 min",
      createdAt: daysAgo(15),
      body:
        "Very good session with clear takeaways. Ran a few minutes over our slot, but she flagged it early and asked first — would happily swap again.",
      helpful: 6,
    },
    {
      id: "rv4",
      fromUserId: "u13",
      rating: 5,
      skill: "Figma handoff workflow",
      sessionType: "Video call · 60 min",
      createdAt: daysAgo(23),
      body:
        "I've sat through paid workshops that taught less. Templates included, questions encouraged, nothing padded.",
      helpful: 11,
    },
    {
      id: "rv5",
      fromUserId: "u4",
      rating: 5,
      skill: "Design system Q&A",
      sessionType: "Video call · 30 min",
      createdAt: daysAgo(31),
      body: "Prepared, punctual and precise. She had read my brief before we joined and came with three questions of her own.",
      helpful: 7,
    },
    {
      id: "rv6",
      fromUserId: "u12",
      rating: 4,
      skill: "Portfolio layout feedback",
      sessionType: "Video call · 45 min",
      createdAt: daysAgo(44),
      body: "Clear, generous feedback and a written summary afterwards. The pacing was a touch fast for me, otherwise excellent.",
      helpful: 5,
    },
  ];

  /** Average computed from the breakdown so the numbers always agree. */
  data.ratingAverage = (() => {
    const total = data.ratingBreakdown.reduce((s, r) => s + r.count, 0);
    const sum = data.ratingBreakdown.reduce((s, r) => s + r.stars * r.count, 0);
    return { average: Math.round((sum / total) * 10) / 10, total };
  })();

  /** Reviews the signed-in member has written about others. */
  data.reviewsGiven = [
    { id: "g1", toUserId: "u14", rating: 5, skill: "Piano fundamentals — session 2", createdAt: daysAgo(3), body: "Grace prepares every session around what I struggled with last time. Progress I can actually hear.", helpful: 4 },
    { id: "g2", toUserId: "u5", rating: 5, skill: "Knife skills & sauces", createdAt: daysAgo(13), body: "Ninety minutes, five sauces, zero fluff. Tomás corrects your grip without making you feel daft.", helpful: 6 },
    { id: "g3", toUserId: "u12", rating: 4, skill: "Manual mode photography", createdAt: daysAgo(26), body: "Confident, well-structured walk. The review at the end was worth the session on its own.", helpful: 3 },
  ];

  /** Reviews attached to other members' profiles (names kept generic on purpose). */
  data.memberReviews = [
    { id: "mr1", fromUserId: "u9", rating: 5, skill: "Session swap", sessionType: "Video call · 60 min", createdAt: daysAgo(5), body: "Well prepared, clear explanations, and generous with follow-up resources. Exactly what a swap should be.", helpful: 12 },
    { id: "mr2", fromUserId: "u6", rating: 5, skill: "Mentoring session", sessionType: "Video call · 45 min", createdAt: daysAgo(17), body: "Asked what I wanted to get out of it before we started, then structured the whole hour around that. Very few people do that.", helpful: 8 },
    { id: "mr3", fromUserId: "u13", rating: 4, skill: "Skill exchange", sessionType: "In person · 60 min", createdAt: daysAgo(28), body: "Knowledgeable and friendly. We overran slightly, but the content was worth the extra ten minutes.", helpful: 5 },
    { id: "mr4", fromUserId: "u10", rating: 5, skill: "Workshop", sessionType: "Video call · 90 min", createdAt: daysAgo(41), body: "Patient with a beginner and specific with feedback. I left with notes I still use weeks later.", helpful: 9 },
  ];

  /** Star labels for the interactive widget. */
  data.ratingLabels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
})(SL.data);
