/* =============================================================================
   SkillLoom — Community controller
   One file drives two views of community.html:

     · Directory  (community.html)         — search, filter, join/leave
     · Detail     (community.html?id=slug) — feed, resources, events, members

   Joined state persists in localStorage; feed/resource contributions award
   bonus credits with a visible "+5 credits earned" toast.

   BACKEND HOOKS: SL.api.catalog.listCommunities, SL.api.social.createPost,
   SL.api.social.addResource, SL.api.social.rsvp.
   ========================================================================== */

(function (SL) {
  "use strict";

  const { esc, getParam, debounce, timeAgo, formatDate, formatNumber } = SL.h;

  /* ---------- Shared helpers -------------------------------------------------------- */

  /** Signed-in member or a guest stand-in so composing always works. */
  function currentUser() {
    return SL.store.getProfile() || { id: "me", name: "Guest Member", headline: "Browsing SkillLoom", tone: 1 };
  }

  /** +5 contribution reward (only meaningful accounts when signed in). */
  function rewardCredits(message) {
    if (SL.store.isAuthenticated()) {
      const balance = SL.store.addCredits(5);
      SL.toast(`+5 credits earned · new balance ${balance}`, {
        type: "accent",
        title: "Contribution rewarded",
      });
    } else {
      SL.toast(message || "Published — sign in to earn credits for contributing.", {
        type: "info",
        title: "Published",
      });
    }
  }

  function memberRecord(communityId, userId) {
    const roster = SL.data.membersFor(communityId) || [];
    return roster.find((m) => m.userId === userId) || null;
  }

  function roleBadge(role) {
    if (role === "Owner") return SL.ui.badge("Owner", "accent", "crown");
    if (role === "Moderator") return SL.ui.badge("Moderator", "primary", "shield");
    return "";
  }

  /* ==========================================================================
     DIRECTORY VIEW
     ========================================================================== */
  const dir = { q: "", category: "All", tab: "all", loaded: false };

  function renderCategories() {
    const host = document.getElementById("community-categories");
    host.innerHTML = SL.data.communityCategories
      .map(
        (c) => `
        <button type="button" class="chip shrink-0" data-dir-category="${esc(c)}" aria-pressed="${dir.category === c}">
          ${esc(c)}
        </button>`
      )
      .join("");
  }

  function directorySkeletons() {
    return SL.ui.skillSkeletons(6);
  }

  async function renderDirectory(withSkeleton) {
    const grid = document.getElementById("community-grid");
    const empty = document.getElementById("community-empty");
    const count = document.getElementById("directory-count");

    if (withSkeleton || !dir.loaded) {
      grid.setAttribute("aria-busy", "true");
      grid.innerHTML = directorySkeletons();
      empty.hidden = true;
      count.textContent = "Loading communities…";
    }

    let rows = await SL.api.catalog.listCommunities({ q: dir.q, category: dir.category });
    if (dir.tab === "mine") {
      rows = rows.filter((c) => SL.store.isJoined(c.id));
    }

    grid.setAttribute("aria-busy", "false");
    document.getElementById("mine-count").textContent = String(SL.store.getJoined().length);

    if (!rows.length) {
      grid.hidden = true;
      empty.hidden = false;
      empty.innerHTML =
        dir.tab === "mine"
          ? SL.ui.emptyState({
              icon: "users",
              title: "You haven't joined a community yet",
              body: "Join a group in your field to see its feed, resources and events here.",
              action: `<button type="button" class="btn btn-primary btn-sm mt-1" data-dir-browse>Browse communities</button>`,
            })
          : SL.ui.emptyState({
              icon: "search",
              title: "No communities match that search",
              body: "Try a different term or clear the field filter.",
              action: `<button type="button" class="btn btn-primary btn-sm mt-1" data-dir-reset>Clear filters</button>`,
            });
      count.textContent = "0 communities";
      return;
    }

    grid.hidden = false;
    empty.hidden = true;
    grid.innerHTML = rows
      .map((c) => SL.cards.communityCard(c, SL.store.isJoined(c.id)))
      .join("");
    count.textContent =
      `${rows.length} communit${rows.length === 1 ? "y" : "ies"}` +
      (dir.q ? ` matching “${dir.q}”` : "") +
      (dir.tab === "mine" ? " you've joined" : "");
    dir.loaded = true;
    SL.motion.initAll(grid);
  }

  function toggleJoin(id, buttonEl) {
    const community = SL.data.communityById(id);
    if (!community) return;
    const joined = SL.store.isJoined(id);

    if (joined) {
      SL.store.leave(id);
      SL.toast(`You left ${community.name}.`, { type: "info" });
    } else {
      SL.store.join(id);
      SL.toast(`Community joined — ${community.name}`, { type: "success", title: "Community joined" });
    }

    // Update the card in place (both the directory and any header button).
    document.querySelectorAll(`[data-toggle-join="${CSS.escape(id)}"]`).forEach((btn) => {
      const nowJoined = SL.store.isJoined(id);
      btn.setAttribute("aria-pressed", String(nowJoined));
      btn.className = `btn ${nowJoined ? "btn-outline" : "btn-primary"} ${btn.dataset.size === "lg" ? "" : "btn-sm"}`;
      btn.innerHTML = nowJoined ? `${SL.icon("check", "w-4 h-4")} Joined` : "Join";
      const card = btn.closest("[data-community-card]");
      if (card) {
        const counter = card.querySelector("[data-member-count]");
        if (counter) counter.textContent = formatNumber(community.members + (nowJoined ? 1 : 0));
      }
    });
    document.getElementById("mine-count").textContent = String(SL.store.getJoined().length);

    if (dir.tab === "mine") renderDirectory(false);
    renderHeaderJoinState();
  }

  function wireDirectory() {
    document.getElementById("community-search-icon").innerHTML = SL.icon("search", "w-5 h-5");

    document.getElementById("community-search").addEventListener(
      "input",
      debounce((e) => {
        dir.q = e.target.value.trim();
        renderDirectory(false);
      }, 250)
    );

    document.getElementById("community-categories").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-dir-category]");
      if (!btn) return;
      dir.category = btn.dataset.dirCategory;
      renderCategories();
      renderDirectory(false);
    });

    document.querySelectorAll("[data-dir-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        dir.tab = btn.dataset.dirTab;
        document.querySelectorAll("[data-dir-tab]").forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        renderDirectory(false);
      });
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-dir-reset]")) {
        dir.q = "";
        dir.category = "All";
        document.getElementById("community-search").value = "";
        renderCategories();
        renderDirectory(false);
      }
      if (e.target.closest("[data-dir-browse]")) {
        dir.tab = "all";
        document.querySelectorAll("[data-dir-tab]").forEach((b) =>
          b.classList.toggle("is-active", b.dataset.dirTab === "all")
        );
        renderDirectory(false);
      }
    });
  }

  /* ==========================================================================
     DETAIL VIEW
     ========================================================================== */
  let community = null;

  function renderHeaderJoinState() {
    if (!community) return;
    const btn = document.getElementById("cover-join");
    if (!btn) return;
    const joined = SL.store.isJoined(community.id);
    btn.setAttribute("aria-pressed", String(joined));
    btn.className = `btn ${joined ? "btn-outline" : "btn-primary"} btn-sm`;
    btn.innerHTML = joined ? `${SL.icon("check", "w-4 h-4")} Joined` : `${SL.icon("users", "w-4 h-4")} Join community`;
    const count = document.getElementById("cover-members");
    if (count) count.textContent = formatNumber(community.members + (joined ? 1 : 0));
  }

  function renderCover() {
    const host = document.getElementById("community-cover");
    host.innerHTML = `
      <div class="gradient-navy relative overflow-hidden">
        <div class="absolute inset-0 opacity-45 pointer-events-none" aria-hidden="true"
             style="background-image:radial-gradient(circle at 15% 25%, rgba(56,189,248,.55), transparent 45%), radial-gradient(circle at 85% 75%, rgba(99,102,241,.5), transparent 45%)"></div>
        <div class="container-page py-8 lg:py-11 relative">
          <a href="community.html" class="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors">
            ${SL.icon("arrow-left", "w-4 h-4")} All communities
          </a>

          <div class="flex flex-col sm:flex-row sm:items-end gap-5 mt-5">
            <span class="inline-grid place-items-center w-16 h-16 rounded-soft shrink-0" style="background:#FFFFFF;color:#0C4A6E;box-shadow:0 18px 40px -20px rgba(0,0,0,.7)">
              ${SL.icon(community.icon, "w-8 h-8")}
            </span>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2.5">
                <h1 class="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">${esc(community.name)}</h1>
                <span class="badge" style="background:rgba(255,255,255,.16);color:#E0F2FE">${esc(community.category)}</span>
              </div>
              <p class="text-white/75 text-sm leading-body mt-2 max-w-2xl">${esc(community.description)}</p>
              <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/60 mt-3">
                <span class="inline-flex items-center gap-1.5">${SL.icon("users", "w-4 h-4")}<span id="cover-members">${formatNumber(community.members + (SL.store.isJoined(community.id) ? 1 : 0))}</span> members</span>
                <span class="inline-flex items-center gap-1.5">${SL.icon("calendar", "w-4 h-4")}Weekly events</span>
                <span class="inline-flex items-center gap-1.5">${SL.icon("file-text", "w-4 h-4")}Shared resources</span>
              </p>
            </div>

            <div class="flex items-center gap-2.5 shrink-0">
              <button type="button" class="btn btn-quiet btn-sm" data-share-community>
                ${SL.icon("share-2", "w-4 h-4")} Share
              </button>
              <button type="button" id="cover-join" data-toggle-join="${esc(community.id)}" data-size="lg" aria-pressed="false" class="btn btn-primary btn-sm">
                ${SL.icon("users", "w-4 h-4")} Join community
              </button>
            </div>
          </div>
        </div>
      </div>`;
    renderHeaderJoinState();
  }

  /* ---------- Tabs ------------------------------------------------------------------- */
  function setTab(name) {
    document.querySelectorAll("[data-community-tab]").forEach((btn) => {
      const active = btn.dataset.communityTab === name;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    ["feed", "resources", "events", "members"].forEach((key) => {
      document.getElementById(`tab-${key}`).hidden = key !== name;
    });
    if (name === "feed") renderFeed();
    if (name === "resources") renderResources();
    if (name === "events") renderEvents();
    if (name === "members") renderMembers();
    SL.motion.initAll(document.getElementById("view-detail"));
  }

  /* ---------- Feed ---------------------------------------------------------------------- */
  function renderCreatePost() {
    const host = document.getElementById("create-post");
    const user = currentUser();
    host.innerHTML = `
      <div class="flex gap-3.5">
        ${SL.ui.avatar(user, "md")}
        <div class="flex-1 min-w-0">
          <label for="post-body" class="sr-only">Write a post</label>
          <textarea id="post-body" class="textarea" rows="3" maxlength="800"
            placeholder="Share an insight, ask a question, or post a swap request…"></textarea>

          <div class="flex flex-wrap items-center gap-2.5 mt-3">
            <label for="post-tag" class="sr-only">Post tag</label>
            <select id="post-tag" class="select w-auto text-sm py-2">
              <option>Discussion</option>
              <option>Question</option>
              <option>Resource</option>
              <option>Showcase</option>
              <option>Swap</option>
            </select>

            <label for="post-link" class="sr-only">Link (optional)</label>
            <input id="post-link" class="input w-auto text-sm py-2 flex-1 min-w-[10rem]" placeholder="Add a link (optional)" />

            <button type="button" class="btn btn-primary btn-sm" id="post-submit">
              ${SL.icon("send", "w-4 h-4")} Post
            </button>
          </div>
          <p class="hint">${SL.store.isAuthenticated() ? "Contributing earns +5 skill credits." : "Sign in to earn +5 credits for contributing."}</p>
        </div>
      </div>`;
  }

  function commentRow(c) {
    const author = c.authorId === "me" ? currentUser() : SL.data.userById(c.authorId) || { name: "Member", tone: 0 };
    return `
      <li class="flex gap-2.5">
        ${SL.ui.avatar(author, "sm")}
        <div class="min-w-0 flex-1 rounded-soft bg-surface-2 border border-line px-3.5 py-2.5">
          <p class="text-xs font-semibold text-heading">${esc(author.name)} <span class="text-muted font-normal">· ${timeAgo(c.createdAt)}</span></p>
          <p class="text-sm text-body leading-body mt-0.5">${esc(c.body)}</p>
        </div>
      </li>`;
  }

  function postCard(post) {
    const author = post.authorId === "me" ? currentUser() : SL.data.userById(post.authorId) || { name: "Member", tone: 0 };
    const record = memberRecord(post.communityId, post.authorId);
    const tagVariant =
      post.tag === "Swap" ? "accent" : post.tag === "Question" ? "primary" : post.tag === "Showcase" ? "success" : "neutral";

    return `
      <article class="card p-5" data-post="${esc(post.id)}">
        <header class="flex items-start gap-3">
          ${SL.ui.avatar(author, "md", { presence: post.authorId !== "me" ? true : false })}
          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-center gap-2 text-sm">
              <a href="profile.html?id=${esc(post.authorId)}" class="font-semibold text-heading hover:text-link transition-colors">${esc(author.name)}</a>
              ${record ? roleBadge(record.role) : ""}
            </p>
            <p class="flex flex-wrap items-center gap-2 text-xs text-muted mt-1">
              <span class="badge badge-${tagVariant}">${SL.icon("hash", "w-3 h-3")}${esc(post.tag)}</span>
              <span>${timeAgo(post.createdAt)}</span>
            </p>
          </div>
          <button type="button" class="inline-grid place-items-center w-8 h-8 rounded-lg text-muted hover:text-link hover:bg-surface-2 transition-colors" data-post-menu aria-label="Post options">
            ${SL.icon("dots-horizontal", "w-4 h-4")}
          </button>
        </header>

        <p class="text-sm text-body leading-body mt-3.5 whitespace-pre-line">${esc(post.body)}</p>

        ${post.link
          ? `<a href="${esc(post.link.url)}" class="mt-3 flex items-center gap-3 rounded-soft border border-line bg-surface-2 px-4 py-3 hover:border-primary transition-colors group">
               <span class="grid place-items-center w-9 h-9 rounded-lg bg-surface border border-line text-link shrink-0">${SL.icon("link", "w-4 h-4")}</span>
               <span class="min-w-0 flex-1">
                 <span class="block text-sm font-semibold text-heading truncate group-hover:text-link transition-colors">${esc(post.link.label)}</span>
                 <span class="block text-xs text-muted">Shared resource</span>
               </span>
               ${SL.icon("external-link", "w-4 h-4 text-muted")}
             </a>`
          : ""}

        <footer class="mt-4 pt-3.5 border-t border-line flex items-center gap-1.5 flex-wrap">
          <button type="button" class="btn btn-ghost btn-sm ${post.liked ? "text-link" : ""}" data-like aria-pressed="${!!post.liked}">
            ${SL.icon("heart", "w-4 h-4", { fill: post.liked })} <span data-like-count>${post.likes}</span> Like
          </button>
          <button type="button" class="btn btn-ghost btn-sm" data-toggle-comments>
            ${SL.icon("message-circle", "w-4 h-4")} <span>${post.comments.length}</span> Comment
          </button>
          <button type="button" class="btn btn-ghost btn-sm" data-share-post>
            ${SL.icon("share-2", "w-4 h-4")} Share
          </button>
          <span class="ml-auto text-xs text-muted hidden sm:inline">${post.shares || 0} shares</span>
        </footer>

        <div class="mt-3.5 pt-3.5 border-t border-line" data-comments>
          ${post.comments.length
            ? `<ul class="flex flex-col gap-2.5 mb-3 list-reset">${post.comments.map(commentRow).join("")}</ul>`
            : `<p class="text-xs text-muted mb-3">No comments yet — be the first to respond.</p>`}
          <form class="flex items-center gap-2.5" data-comment-form>
            ${SL.ui.avatar(currentUser(), "sm")}
            <label class="sr-only" for="comment-${esc(post.id)}">Write a comment</label>
            <input id="comment-${esc(post.id)}" class="input text-sm py-2" placeholder="Write a comment…" maxlength="240" />
            <button type="submit" class="btn btn-outline btn-sm shrink-0">Reply</button>
          </form>
        </div>
      </article>`;
  }

  function renderFeed() {
    renderCreatePost();
    const host = document.getElementById("feed-list");
    const posts = SL.data.postsFor(community.id);
    host.innerHTML = posts.length
      ? posts.map(postCard).join("")
      : SL.ui.emptyState({
          icon: "message-circle",
          title: "The feed is quiet",
          body: "Start the conversation with a question or a swap request.",
        });
  }

  async function submitPost() {
    const body = document.getElementById("post-body");
    const link = document.getElementById("post-link");
    const tag = document.getElementById("post-tag");
    const text = body.value.trim();

    if (text.length < 10) {
      body.setAttribute("aria-invalid", "true");
      body.focus();
      SL.toast("Posts need at least 10 characters.", { type: "warning" });
      return;
    }
    body.removeAttribute("aria-invalid");

    const btn = document.getElementById("post-submit");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Posting…`;

    const linkValue = link.value.trim();
    const post = await SL.api.social.createPost({
      communityId: community.id,
      authorId: "me",
      tag: tag.value,
      body: text,
      link: linkValue ? { label: linkValue.replace(/^https?:\/\//, ""), url: linkValue } : null,
    });

    SL.data.posts.unshift(post);
    renderFeed();
    rewardCredits("Post published.");
  }

  /* ---------- Resources ----------------------------------------------------------------- */
  function renderResourceForm() {
    document.getElementById("resource-form").innerHTML = `
      <div class="flex items-center justify-between gap-3 mb-4">
        <h2 class="font-heading font-bold text-base text-heading flex items-center gap-2">
          ${SL.icon("plus", "w-4 h-4 text-link")} Add a resource
        </h2>
        <span class="badge badge-accent">+5 credits</span>
      </div>
      <form id="resource-add" class="grid sm:grid-cols-[1fr_auto_auto] gap-2.5" novalidate>
        <div class="min-w-0">
          <label class="sr-only" for="res-title">Resource title</label>
          <input id="res-title" class="input text-sm py-2.5" placeholder="Title, e.g. Flexbox cheat sheet" maxlength="90" />
        </div>
        <div class="min-w-0">
          <label class="sr-only" for="res-type">Type</label>
          <select id="res-type" class="select text-sm py-2.5 w-auto">
            <option>Link</option>
            <option>Guide</option>
            <option>File</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary btn-sm py-2.5">Add resource</button>
      </form>
      <p class="hint">Optional: paste the URL into the title field — e.g. "css-tricks.com/flexbox".</p>`;
  }

  function renderResources() {
    renderResourceForm();
    const host = document.getElementById("resource-list");
    const rows = SL.data.resourcesFor(community.id);

    host.innerHTML = rows.length
      ? rows
          .map(
            (r) => {
              const author = r.authorId === "me" ? currentUser() : SL.data.userById(r.authorId) || { name: "Member", tone: 0 };
              const icon = r.type === "Guide" ? "book" : r.type === "File" ? "file-text" : "link";
              return `
              <article class="card p-4 flex items-center gap-4 card-hover" data-resource="${esc(r.id)}">
                <span class="grid place-items-center w-11 h-11 rounded-soft bg-surface-2 border border-line text-link shrink-0">${SL.icon(icon, "w-5 h-5")}</span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-heading truncate">${esc(r.title)}</p>
                  <p class="text-xs text-muted truncate mt-0.5">${esc(r.type)} · ${esc(r.meta)} · added by ${esc(author.name)} · ${formatDate(r.createdAt)}</p>
                </div>
                <span class="hidden sm:inline badge badge-neutral">${r.saves} saves</span>
                <button type="button" class="btn btn-outline btn-sm shrink-0" data-save-resource>Save</button>
              </article>`;
            }
          )
          .join("")
      : SL.ui.emptyState({ icon: "folder", title: "No resources yet", body: "Be the first to share a guide, link or file." });
  }

  async function submitResource(form) {
    const title = document.getElementById("res-title");
    const type = document.getElementById("res-type");
    const text = title.value.trim();

    if (text.length < 4) {
      title.setAttribute("aria-invalid", "true");
      title.focus();
      SL.toast("Give the resource a short title.", { type: "warning" });
      return;
    }
    title.removeAttribute("aria-invalid");

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Adding…`;

    const resource = await SL.api.social.addResource({
      communityId: community.id,
      authorId: "me",
      title: text,
      type: type.value,
      meta: type.value === "Link" ? text.split("/")[0] : "Added by you",
    });

    SL.data.resources.unshift(resource);
    renderResources();
    rewardCredits("Resource added.");
  }

  /* ---------- Events ---------------------------------------------------------------------- */
  function renderEvents() {
    const host = document.getElementById("event-list");
    const rows = SL.data.eventsFor(community.id);

    host.innerHTML = rows.length
      ? rows
          .map((e) => {
            const host2 = e.hostId === "me" ? currentUser() : SL.data.userById(e.hostId) || { name: "Member", tone: 0 };
            const d = new Date(e.startsAt);
            return `
            <article class="card p-5 flex flex-col gap-3.5 h-full" data-event="${esc(e.id)}">
              <div class="flex items-start gap-4">
                <span class="shrink-0 w-14 rounded-soft border border-line bg-surface-2 text-center overflow-hidden">
                  <span class="block text-[0.65rem] font-semibold uppercase tracking-wider py-1" style="background:var(--c-surface-3);color:var(--c-link)">${formatDate(d, { month: "short" })}</span>
                  <span class="block font-heading font-extrabold text-xl text-heading py-1">${d.getDate()}</span>
                </span>
                <div class="min-w-0">
                  <h3 class="font-heading font-bold text-base text-heading leading-snug">${esc(e.title)}</h3>
                  <p class="text-xs text-muted mt-1">${formatDate(d, { weekday: "long" })} · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · ${esc(e.duration)}</p>
                </div>
              </div>

              <p class="text-sm text-muted leading-body flex-1">${esc(e.description)}</p>

              <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span class="tag">${SL.icon(e.mode === "Online" ? "video" : "map-pin", "w-3.5 h-3.5")}${esc(e.mode)}</span>
                <span class="tag">${SL.icon("users", "w-3.5 h-3.5")}${e.seats} seats</span>
                <span class="tag">Hosted by ${esc(host2.name)}</span>
              </div>

              <button type="button" class="btn ${e.rsvp ? "btn-outline" : "btn-primary"} btn-sm" data-rsvp aria-pressed="${e.rsvp}">
                ${e.rsvp ? `${SL.icon("check", "w-4 h-4")} You're going` : "RSVP"}
              </button>
            </article>`;
          })
          .join("")
      : SL.ui.emptyState({ icon: "calendar", title: "No upcoming events", body: "Events for this community will appear here." });
  }

  /* ---------- Members ----------------------------------------------------------------------- */
  function renderMembers() {
    const host = document.getElementById("member-list");
    const roster = (SL.data.membersFor(community.id) || []).slice().sort((a, b) => b.contributions - a.contributions);

    host.innerHTML = roster
      .map((m, index) => {
        const member = m.userId === "me" ? currentUser() : SL.data.userById(m.userId) || { name: "Member", tone: 0 };
        const topThree = index < 3;
        return `
        <article class="card p-4 flex items-center gap-3.5 ${topThree ? "border-primary/60" : ""}">
          <div class="relative shrink-0">
            ${SL.ui.avatar(member, "md", { presence: true })}
            ${topThree ? `<span class="absolute -top-1 -right-1 w-5 h-5 grid place-items-center rounded-full text-white" style="background:#6366F1;font-size:10px;font-weight:700">${index + 1}</span>` : ""}
          </div>
          <div class="min-w-0 flex-1">
            <a href="profile.html?id=${esc(m.userId)}" class="text-sm font-semibold text-heading hover:text-link transition-colors truncate block">${esc(member.name)}</a>
            <p class="text-xs text-muted truncate mt-0.5">${m.contributions} contributions</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
              ${roleBadge(m.role)}
              ${(m.badges || []).map((b) => SL.ui.badge(b, b === "Top Contributor" ? "accent" : b === "Mentor" ? "primary" : "neutral")).join("")}
            </div>
          </div>
        </article>`;
      })
      .join("");
  }

  /* ---------- Sidebar -------------------------------------------------------------------------- */
  function renderSidebar() {
    document.getElementById("rules-list").innerHTML = community.rules
      .map(
        (r, i) => `
        <li class="flex gap-2.5">
          <span class="font-heading font-bold text-link shrink-0">${i + 1}</span>
          <span>${esc(r)}</span>
        </li>`
      )
      .join("");

    const roster = (SL.data.membersFor(community.id) || [])
      .filter((m) => m.userId !== "me")
      .slice()
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 4);

    document.getElementById("contributors-list").innerHTML = roster
      .map((m, i) => {
        const member = SL.data.userById(m.userId) || { name: "Member", tone: 0 };
        return `
        <li class="flex items-center gap-3">
          <span class="font-heading font-extrabold text-sm text-muted w-4 shrink-0">${i + 1}</span>
          ${SL.ui.avatar(member, "sm")}
          <a href="profile.html?id=${esc(m.userId)}" class="min-w-0 flex-1 group">
            <span class="block text-sm font-semibold text-heading truncate group-hover:text-link transition-colors">${esc(member.name)}</span>
            <span class="block text-xs text-muted">${m.contributions} points</span>
          </a>
          ${i === 0 ? SL.ui.badge("Top", "accent", "crown") : ""}
        </li>`;
      })
      .join("");

    document.getElementById("related-list").innerHTML = (community.related || [])
      .map((id) => {
        const c = SL.data.communityById(id);
        if (!c) return "";
        return `
        <li>
          <a href="community.html?id=${esc(c.id)}" class="flex items-center gap-3 rounded-soft border border-line px-3 py-2.5 hover:border-primary transition-colors group">
            ${SL.ui.iconTile(c.icon, c.tone, "w-9 h-9 rounded-lg")}
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold text-heading truncate group-hover:text-link transition-colors">${esc(c.name)}</span>
              <span class="block text-xs text-muted">${formatNumber(c.members)} members</span>
            </span>
            ${SL.icon("chevron-right", "w-4 h-4 text-muted")}
          </a>
        </li>`;
      })
      .join("");
  }

  /* ---------- Detail wiring --------------------------------------------------------------------- */
  function wireDetail() {
    document.querySelectorAll("[data-community-tab]").forEach((btn) => {
      btn.addEventListener("click", () => setTab(btn.dataset.communityTab));
    });

    const view = document.getElementById("view-detail");

    view.addEventListener("click", (e) => {
      // Create post
      if (e.target.closest("#post-submit")) {
        submitPost();
        return;
      }

      // Like
      const likeBtn = e.target.closest("[data-like]");
      if (likeBtn) {
        const card = likeBtn.closest("[data-post]");
        const post = SL.data.posts.find((p) => p.id === card.dataset.post);
        if (!post) return;
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        likeBtn.classList.toggle("text-link", post.liked);
        likeBtn.setAttribute("aria-pressed", String(post.liked));
        likeBtn.innerHTML = `${SL.icon("heart", "w-4 h-4", { fill: post.liked })} <span data-like-count>${post.likes}</span> Like`;
        return;
      }

      // Toggle comments focus
      if (e.target.closest("[data-toggle-comments]")) {
        const card = e.target.closest("[data-post]");
        const input = card.querySelector("[data-comment-form] input");
        if (input) input.focus();
        return;
      }

      // Share
      if (e.target.closest("[data-share-post]")) {
        const card = e.target.closest("[data-post]");
        const post = SL.data.posts.find((p) => p.id === card.dataset.post);
        if (post) post.shares = (post.shares || 0) + 1;
        copyToClipboard(`${location.origin}${location.pathname}?id=${community.id}`);
        SL.toast("Link copied to clipboard.", { type: "success", title: "Shared" });
        return;
      }

      if (e.target.closest("[data-share-community]")) {
        copyToClipboard(location.href);
        SL.toast("Community link copied.", { type: "success", title: "Shared" });
        return;
      }

      if (e.target.closest("[data-post-menu]")) {
        SL.toast("Post actions: save, report and mute are demo-only.", { type: "info" });
        return;
      }

      // Save a resource
      if (e.target.closest("[data-save-resource]")) {
        const btn = e.target.closest("[data-save-resource]");
        if (btn.dataset.saved) return;
        btn.dataset.saved = "1";
        btn.innerHTML = `${SL.icon("check", "w-4 h-4")} Saved`;
        btn.classList.add("btn-ghost");
        SL.toast("Resource saved to your library.", { type: "success", duration: 2600 });
        return;
      }

      // RSVP
      const rsvpBtn = e.target.closest("[data-rsvp]");
      if (rsvpBtn) {
        const card = rsvpBtn.closest("[data-event]");
        const event = SL.data.events.find((x) => x.id === card.dataset.event);
        if (!event) return;
        event.rsvp = !event.rsvp;
        SL.api.social.rsvp(event.id, event.rsvp);
        renderEvents();
        SL.toast(event.rsvp ? `You're going to “${event.title}”.` : `RSVP cancelled for “${event.title}”.`, {
          type: event.rsvp ? "success" : "info",
        });
      }
    });

    view.addEventListener("submit", (e) => {
      // Comment form
      const commentForm = e.target.closest("[data-comment-form]");
      if (commentForm) {
        e.preventDefault();
        const card = commentForm.closest("[data-post]");
        const post = SL.data.posts.find((p) => p.id === card.dataset.post);
        const input = commentForm.querySelector("input");
        const text = input.value.trim();
        if (!post || !text) return;
        post.comments.push({
          id: SL.h.uid("c"),
          authorId: "me",
          body: text,
          createdAt: new Date().toISOString(),
        });
        renderFeed();
        SL.toast("Comment posted.", { type: "success", duration: 2400 });
        return;
      }

      // Resource form
      if (e.target.id === "resource-add") {
        e.preventDefault();
        submitResource(e.target);
      }
    });
  }

  function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
    } catch (err) {
      /* Clipboard unavailable — the toast still confirms the intent. */
    }
  }

  /* ---------- Boot ------------------------------------------------------------------------------ */
  function initDirectory() {
    document.getElementById("view-directory").hidden = false;
    document.getElementById("view-detail").hidden = true;
    renderCategories();
    wireDirectory();
    renderDirectory(true);
  }

  function initDetail(id) {
    community = SL.data.communityById(id);
    if (!community) {
      window.location.replace("404.html");
      return;
    }
    document.title = `${community.name} · SkillLoom`;
    document.getElementById("view-directory").hidden = true;
    document.getElementById("view-detail").hidden = false;

    renderCover();
    renderSidebar();
    wireDetail();
    setTab("feed");
    SL.motion.initAll();
  }

  function init() {
    SL.navbar.render();
    SL.footer.render();

    const id = getParam("id");
    if (id) initDetail(id);
    else initDirectory();

    // Join / leave — shared by directory cards and the cover button.
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-toggle-join]");
      if (btn) toggleJoin(btn.dataset.toggleJoin, btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.SL);
