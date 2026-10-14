/* =============================================================================
   SkillLoom — Data: conversations
   Fake message history for the two-pane chat. Replies the user receives
   after sending are canned — see pages/chat.js.
   ========================================================================== */

window.SL = window.SL || {};
SL.data = SL.data || {};

(function (data) {
  "use strict";

  const mins = (m) => new Date(Date.now() - m * 60000).toISOString();
  const hours = (h) => new Date(Date.now() - h * 36e5).toISOString();
  const days = (d) => new Date(Date.now() - d * 864e5).toISOString();

  /** preview = last message, used in the conversation list. */
  data.conversations = [
    {
      id: "cv1",
      userId: "u14",
      unread: 2,
      online: true,
      typing: false,
      messages: [
        { id: "m1", from: "them", body: "Hello Priya! Confirming Saturday's piano session — are we still on for 10:00?", at: hours(26) },
        { id: "m2", from: "me", body: "Yes, Saturday works. I'll bring my book — I've practised the left-hand part, mostly.", at: hours(25) },
        { id: "m3", from: "them", body: "That's exactly the right kind of 'mostly'. We'll spend the first ten minutes on it together.", at: hours(25) },
        { id: "m4", from: "me", body: "Perfect. Anything I should prepare beyond the book?", at: hours(24) },
        { id: "m5", from: "them", body: "Just a metronome app if you have one. Phone is fine.", at: hours(23) },
        { id: "m6", from: "them", body: "Also — I'd love your thoughts on my recital poster afterwards. Fair swap?", at: mins(42) },
        { id: "m7", from: "them", body: "No rush at all, just flagging it before I forget.", at: mins(41) },
      ],
    },
    {
      id: "cv2",
      userId: "u1",
      unread: 0,
      online: true,
      typing: false,
      messages: [
        { id: "m1", from: "me", body: "Hi Aarav — I saw your React state architecture listing. Would you be open to a design-for-code swap?", at: days(3) },
        { id: "m2", from: "them", body: "Hi Priya — absolutely. What are you hoping to get from the React side?", at: days(3) },
        { id: "m3", from: "me", body: "Honestly? I can read our codebase but I freeze the moment I need to change state logic.", at: days(2) },
        { id: "m4", from: "them", body: "That's the most common starting point. We'll rebuild one small feature together and then take it apart.", at: days(2) },
        { id: "m5", from: "me", body: "Great — my calendar is open Tuesday and Thursday evenings.", at: days(1) },
        { id: "m6", from: "them", body: "Thursday 19:00 then. I'll send the booking link shortly.", at: hours(5) },
      ],
    },
    {
      id: "cv3",
      userId: "u5",
      unread: 1,
      online: false,
      typing: false,
      messages: [
        { id: "m1", from: "them", body: "Thanks for last night's session — the shallot trick has changed my week.", at: days(1) },
        { id: "m2", from: "me", body: "Ha! Glad it landed. Next time we do the tomato sauce, I promise fewer steps.", at: days(1) },
        { id: "m3", from: "them", body: "Fewer steps, more bread. Deal. I'll bring the sourdough recipe as credit.", at: hours(18) },
        { id: "m4", from: "them", body: "Are you free Sunday morning for the follow-up?", at: hours(2) },
      ],
    },
    {
      id: "cv4",
      userId: "u12",
      unread: 0,
      online: true,
      typing: false,
      messages: [
        { id: "m1", from: "me", body: "Nadia — could we do the photo walk on Saturday? Golden hour starts around 17:40.", at: days(5) },
        { id: "m2", from: "them", body: "Saturday is perfect. Meet at the river gate?", at: days(5) },
        { id: "m3", from: "me", body: "River gate, 17:15. I'll bring the wide lens you asked about.", at: days(4) },
        { id: "m4", from: "them", body: "Wonderful. Bring a jacket — it turns cold by the water.", at: days(4) },
      ],
    },
    {
      id: "cv5",
      userId: "u3",
      unread: 0,
      online: false,
      typing: false,
      messages: [
        { id: "m1", from: "them", body: "Your survey data arrived — 812 rows, three columns of text we'll need to untangle.", at: days(8) },
        { id: "m2", from: "me", body: "That's the messy part I was warning you about.", at: days(8) },
        { id: "m3", from: "them", body: "The interesting part, you mean. Session booked for Wednesday.", at: days(7) },
      ],
    },
  ];

  /** Canned reply used when the user sends a message (simulated latency). */
  data.cannedReplies = [
    "Sounds good — I'll check my calendar and confirm shortly.",
    "Perfect. Shall we book that into the schedule tab?",
    "That works for me. Anything you'd like me to prepare beforehand?",
    "Noted, thank you. I'll send over the resources after the session.",
    "Great — looking forward to it.",
  ];
})(SL.data);
