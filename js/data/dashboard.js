/* =============================================================================
   SkillLoom — Data: dashboard
   Suggested matches, upcoming sessions, recent activity, badges and level
   progression. Bookings the user creates at runtime are merged with this
   list by the dashboard page.
   ========================================================================== */

window.SL = window.SL || {};
SL.data = SL.data || {};

(function (data) {
  "use strict";

  const ahead = (d, h = 0) => new Date(Date.now() + d * 864e5 + h * 36e5).toISOString();
  const ago = (d, h = 0) => new Date(Date.now() - d * 864e5 - h * 36e5).toISOString();

  /* ---------- Suggested matches -------------------------------------------- */
  data.matches = [
    {
      id: "m1",
      userId: "u2",
      matchPercent: 96,
      offered: "Acoustic guitar for beginners",
      wanted: "UI design fundamentals",
      reason: "You offer design fundamentals; Sofia lists UI design as her top request. Both prefer weekday evenings.",
      credits: 10,
    },
    {
      id: "m2",
      userId: "u3",
      matchPercent: 91,
      offered: "Statistics & Python clinic",
      wanted: "Watercolour painting",
      reason: "Strong goal overlap — Daniel wants a creative outlet, you listed watercolour as a goal this quarter.",
      credits: 14,
    },
    {
      id: "m3",
      userId: "u4",
      matchPercent: 88,
      offered: "Conversational Mandarin",
      wanted: "Design systems review",
      reason: "Complementary schedules: your open Saturday mornings match her availability exactly.",
      credits: 11,
    },
    {
      id: "m4",
      userId: "u14",
      matchPercent: 84,
      offered: "Piano for adults",
      wanted: "Portfolio feedback",
      reason: "Grace has two open swaps left this month and lists design as a long-term interest.",
      credits: 12,
    },
  ];

  /* ---------- Upcoming sessions --------------------------------------------- */
  data.sessions = [
    {
      id: "sl1",
      withUserId: "u14",
      title: "Piano fundamentals — session 3",
      startsAt: ahead(1, 3),
      duration: "50 min",
      format: "Video call",
      status: "confirmed",
      credits: 12,
    },
    {
      id: "sl2",
      withUserId: "u2",
      title: "Guitar: chord changes clinic",
      startsAt: ahead(3, 5),
      duration: "45 min",
      format: "Video call",
      status: "confirmed",
      credits: 10,
    },
    {
      id: "sl3",
      withUserId: "u10",
      title: "Portfolio writing review",
      startsAt: ahead(6, 2),
      duration: "45 min",
      format: "In person · Indiranagar",
      status: "pending",
      credits: 10,
    },
  ];

  /* ---------- Recent activity ------------------------------------------------ */
  data.activity = [
    { id: "a1", icon: "star", title: "You reviewed Sofia Almeida", meta: "5.0 · “Patient and precise.”", at: ago(0, 5) },
    { id: "a2", icon: "wallet", title: "Earned 12 skill credits", meta: "Session: Design systems for engineers", at: ago(1, 2) },
    { id: "a3", icon: "users", title: "Joined UI/UX Design community", meta: "Member #3,132", at: ago(2, 6) },
    { id: "a4", icon: "award", badge: true, title: "Badge unlocked: Top Contributor", meta: "10 helpful posts in one month", at: ago(4) },
    { id: "a5", icon: "calendar-check", title: "Session booked with Grace Kim", meta: "Piano fundamentals — session 3", at: ago(5) },
    { id: "a6", icon: "swap", title: "Swap completed with Marcus Boateng", meta: "Mobility routine for desk-bound weeks", at: ago(8) },
  ];

  /* ---------- Badges ---------------------------------------------------------- */
  data.badges = [
    { id: "first-swap", icon: "swap", name: "First Swap", desc: "Completed your first exchange", earned: true, earnedAt: "Jan 2025" },
    { id: "reliable", icon: "shield", name: "Reliable Host", desc: "10 sessions without a no-show", earned: true, earnedAt: "Mar 2025" },
    { id: "contributor", icon: "award", name: "Top Contributor", desc: "10 helpful community posts", earned: true, earnedAt: "Sep 2026" },
    { id: "mentor", icon: "graduation-cap", name: "Mentor", desc: "Teach 25 sessions at 4.8★+", earned: false, progress: 72 },
    { id: "fifty", icon: "trophy", name: "50 Swaps", desc: "Fifty completed exchanges", earned: false, progress: 44 },
    { id: "explorer", icon: "globe", name: "Field Explorer", desc: "Swap across five categories", earned: false, progress: 60 },
  ];

  /* ---------- Level ladder ---------------------------------------------------- */
  data.levels = [
    { name: "Newcomer", min: 0 },
    { name: "Contributor", min: 100 },
    { name: "Practitioner", min: 250 },
    { name: "Mentor", min: 500 },
    { name: "Luminary", min: 1000 },
  ];

  /* ---------- Quick actions (dashboard shortcuts) ----------------------------- */
  data.quickActions = [
    { icon: "search", label: "Browse skills", body: "Find your next teacher", href: "browse.html" },
    { icon: "calendar", label: "Book a session", body: "Pick a time that fits", href: "schedule.html" },
    { icon: "message-circle", label: "Open chat", body: "2 conversations waiting", href: "chat.html" },
    { icon: "wallet", label: "Credit wallet", body: "View balance and history", href: "wallet.html" },
    { icon: "users", label: "Communities", body: "See what peers are sharing", href: "community.html" },
    { icon: "star", label: "Leave a review", body: "Rate your last session", href: "reviews.html" },
  ];
})(SL.data);
