/* =============================================================================
   SkillLoom — Chat controller
   Two-pane messenger with a mobile list/detail switch. Messages are appended
   locally; the "typing" indicator and reply come from SL.api.messages —
   replace those two calls with a WebSocket/REST push when a backend exists.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, timeAgo, formatDate, formatTime, debounce } = SL.h;

  const conversations = SL.data.conversations;
  let activeId = conversations.length ? conversations[0].id : null;
  let searchTerm = "";

  const els = {};

  const activeConv = () => conversations.find((c) => c.id === activeId) || null;

  /* ---------- Conversation list ------------------------------------------------- */
  function renderList() {
    const host = document.getElementById("conversation-list");
    const term = searchTerm.toLowerCase();
    const rows = conversations.filter((c) => {
      const user = SL.data.userById(c.userId);
      if (!user) return false;
      const last = c.messages[c.messages.length - 1];
      return (
        !term ||
        user.name.toLowerCase().indexOf(term) !== -1 ||
        (last ? last.body.toLowerCase().indexOf(term) !== -1 : false)
      );
    });

    if (!rows.length) {
      host.innerHTML = `<div class="p-6">${SL.ui.emptyState({
        icon: "search",
        title: "No conversations found",
        body: "Try a different name or message phrase.",
      })}</div>`;
      return;
    }

    host.innerHTML = rows
      .map((c) => {
        const user = SL.data.userById(c.userId);
        const last = c.messages[c.messages.length - 1];
        const active = c.id === activeId;
        return `
        <button type="button" class="w-full text-left px-4 py-3.5 flex gap-3 border-b border-line transition-colors ${active ? "bg-surface-2" : "hover:bg-surface-2"}"
                data-conv="${esc(c.id)}" aria-current="${active ? "true" : "false"}">
          ${SL.ui.avatar(user, "md", { presence: true })}
          <span class="flex-1 min-w-0">
            <span class="flex items-center justify-between gap-2">
              <span class="text-sm font-semibold text-heading truncate">${esc(user.name)}</span>
              <span class="text-[0.7rem] text-muted shrink-0">${last ? timeAgo(last.at) : ""}</span>
            </span>
            <span class="flex items-center justify-between gap-2 mt-0.5">
              <span class="text-xs text-muted truncate">${c.typing ? "typing…" : last ? (last.from === "me" ? "You: " : "") + last.body : ""}</span>
              ${c.unread ? `<span class="shrink-0 inline-grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[0.65rem] font-bold" style="color:var(--c-on-primary)">${c.unread}</span>` : ""}
            </span>
          </span>
        </button>`;
      })
      .join("");
  }

  /* ---------- Header ---------------------------------------------------------------- */
  function renderHeader() {
    const conv = activeConv();
    const host = document.getElementById("chat-header");
    if (!conv) {
      host.innerHTML = `<p class="text-sm text-muted">Select a conversation</p>`;
      return;
    }
    const user = SL.data.userById(conv.userId);

    host.innerHTML = `
      <button type="button" class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-soft border border-line text-heading shrink-0" data-chat-back aria-label="Back to conversations">
        ${SL.icon("arrow-left", "w-4 h-4")}
      </button>
      ${SL.ui.avatar(user, "md", { presence: true })}
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-heading truncate">${esc(user.name)}</p>
        <p class="text-xs ${conv.typing ? "text-link" : "text-muted"} truncate">
          ${conv.typing
            ? `typing<span class="inline-flex gap-0.5 ml-0.5 align-middle"><i class="typing-dot"></i><i class="typing-dot"></i><i class="typing-dot"></i></span>`
            : conv.online
              ? `<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 align-middle"></span>Online`
              : "Last seen recently"}
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button type="button" class="inline-flex items-center justify-center w-9 h-9 rounded-soft border border-line text-muted hover:text-link hover:border-primary transition-colors" data-video-call aria-label="Start video call" title="Start video call">
          ${SL.icon("video", "w-4 h-4")}
        </button>
        <a href="schedule.html" class="inline-flex items-center justify-center w-9 h-9 rounded-soft border border-line text-muted hover:text-link hover:border-primary transition-colors" aria-label="Schedule a session" title="Schedule a session">
          ${SL.icon("calendar", "w-4 h-4")}
        </a>
      </div>`;
  }

  /* ---------- Messages ----------------------------------------------------------------- */
  function renderMessages(keepScroll) {
    const conv = activeConv();
    const host = document.getElementById("message-list");
    if (!conv) {
      host.innerHTML = SL.ui.emptyState({
        icon: "message-circle",
        title: "No conversation selected",
        body: "Choose a member on the left to open the thread.",
      });
      return;
    }

    const prevTop = host.scrollTop;
    const dayLabel = (iso) => formatDate(iso, { weekday: "short", day: "numeric", month: "short" });
    let lastDay = "";

    host.innerHTML =
      conv.messages
        .map((m) => {
          const mine = m.from === "me";
          const day = dayLabel(m.at);
          const showDay = day !== lastDay;
          lastDay = day;
          return `
          ${showDay ? `<div class="flex items-center gap-3 my-2"><span class="flex-1 h-px bg-line"></span><span class="text-[0.7rem] text-muted">${esc(day)}</span><span class="flex-1 h-px bg-line"></span></div>` : ""}
          <div class="flex ${mine ? "justify-end" : "justify-start"}">
            <div class="max-w-[80%] sm:max-w-[70%]">
              <div class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${mine ? "rounded-br-md" : "rounded-bl-md"}"
                   style="${mine ? "background:var(--c-primary);color:var(--c-on-primary)" : "background:var(--c-surface-2);border:1px solid var(--c-border);color:var(--c-body)"}">
                ${esc(m.body)}
              </div>
              <p class="text-[0.65rem] text-muted mt-1 ${mine ? "text-right" : "text-left"}">${mine ? "You" : esc((SL.data.userById(conv.userId) || {}).name || "")} · ${formatTime(m.at)}</p>
            </div>
          </div>`;
        })
        .join("") +
      (conv.typing
        ? `<div class="flex justify-start"><div class="rounded-2xl rounded-bl-md px-4 py-3" style="background:var(--c-surface-2);border:1px solid var(--c-border)">
             <span class="flex gap-1.5 text-muted"><i class="typing-dot"></i><i class="typing-dot"></i><i class="typing-dot"></i></span>
           </div></div>`
        : "");

    if (keepScroll) {
      host.scrollTop = prevTop;
    } else {
      host.scrollTop = host.scrollHeight;
    }
  }

  /* ---------- Sending --------------------------------------------------------------------- */
  async function sendMessage(text) {
    const conv = activeConv();
    if (!conv || !text.trim()) return;

    const message = await SL.api.messages.send({ from: "me", body: text.trim() });
    conv.messages.push(message);
    renderMessages();
    renderList();

    // Simulated reply
    conv.typing = true;
    renderHeader();
    renderMessages();
    renderList();

    const reply = await SL.api.messages.reply();
    conv.typing = false;
    conv.messages.push(await SL.api.messages.send({ from: "them", body: reply }));
    renderHeader();
    renderMessages();
    renderList();
  }

  /* ---------- Boot -------------------------------------------------------------------------- */
  function init() {
    SL.navbar.render();
    SL.footer.render();

    document.getElementById("chat-search-icon").innerHTML = SL.icon("search", "w-4 h-4");

    const shell = document.getElementById("chat-shell");
    els.list = document.getElementById("conversation-list");
    els.messages = document.getElementById("message-list");
    els.input = document.getElementById("message-input");

    renderList();
    renderHeader();
    renderMessages();

    // Select a conversation
    els.list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-conv]");
      if (!btn) return;
      activeId = btn.dataset.conv;
      const conv = activeConv();
      if (conv) conv.unread = 0;
      renderList();
      renderHeader();
      renderMessages();
      shell.classList.remove("show-list"); // mobile: move to the thread
    });

    // Mobile back
    document.getElementById("chat-header").addEventListener("click", (e) => {
      if (e.target.closest("[data-chat-back]")) shell.classList.add("show-list");
    });

    // Search
    document.getElementById("conversation-search").addEventListener(
      "input",
      debounce((e) => {
        searchTerm = e.target.value.trim();
        renderList();
      }, 180)
    );

    // Send
    document.getElementById("message-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = els.input.value;
      if (!text.trim()) return;
      els.input.value = "";
      sendMessage(text);
    });

    // Video call placeholder
    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-video-call]")) {
        SL.toast("Video rooms open 10 minutes before a booked session.", { type: "info", title: "Video calls" });
      }
    });

    SL.motion.initAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
