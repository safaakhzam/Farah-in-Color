/* Interactions for the static design preview (the real site uses React). */
{
  const P = window.__PAINTINGS__ || [];
  const page = document.body.dataset.page || "/";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // Put streamed (Suspense) sections in place, as React's inline script would
  $$('div[hidden][id^="S:"]').forEach((d) => {
    const t = document.getElementById("B:" + d.id.slice(2));
    if (t) { t.replaceWith(...d.childNodes); d.parentNode.removeChild(d); }
  });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  let toastTimer;
  const toast = (msg) => {
    let t = $(".preview-toast");
    if (!t) { t = document.createElement("div"); t.className = "preview-toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 2800);
  };
  const lockScroll = (on) => { document.body.style.overflow = on ? "hidden" : ""; };

  /* ── Mobile menu ── */
  const menuBtn = $('header button[aria-label="Open menu"]');
  if (menuBtn) {
    let nav;
    menuBtn.addEventListener("click", () => {
      if (nav) { nav.remove(); nav = null; lockScroll(false); menuBtn.setAttribute("aria-expanded", "false"); return; }
      const links = [["shop.html", "Shop"], ["about.html", "About"], ["commissions.html", "Commissions"], ["contact.html", "Contact"]];
      nav = document.createElement("nav");
      nav.className = "fixed inset-x-0 bottom-0 top-16 z-40 animate-fade-up bg-canvas px-6 py-10";
      nav.innerHTML = `<ul class="space-y-6">${links.map(([h, l]) => `<li><a href="${h}" class="font-serif text-4xl">${l}</a></li>`).join("")}</ul>
        <a href="https://instagram.com/farahincolor" target="_blank" rel="noopener noreferrer" class="btn-outline mt-12 w-full">Follow @farahincolor</a>
        <div class="bg-color-gradient absolute inset-x-0 bottom-0 h-1.5"></div>`;
      document.body.appendChild(nav);
      lockScroll(true);
      menuBtn.setAttribute("aria-expanded", "true");
    });
  }

  /* ── Forms ── */
  document.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const btnText = (f.querySelector("button[type=submit], button:not([type])") || {}).textContent || "";
    if (/Log out/.test(btnText)) { location.href = "admin-login.html"; return; }
    if (page === "/admin/login") { location.href = "admin.html"; return; }
    if (page.startsWith("/admin")) { toast("Preview only: changes are saved once the shop is live."); return; }
    f.removeAttribute("novalidate");
    if (!f.reportValidity()) return;
    const slug = f.querySelector('[name="paintingId"]');
    if (slug) { location.href = `confirmation-${slug.value}.html`; return; }
    const isCommission = page === "/commissions";
    f.outerHTML = `<div class="card flex items-start gap-3 p-6" role="status"><div><p class="font-serif text-2xl">Thank you!</p>
      <p class="mt-2 text-muted">${isCommission ? "Your commission request has been sent. Farah will get back to you within a few days." : "Your message is on its way. Farah usually replies within a day or two."}</p>
      <p class="mt-2 text-xs text-muted">(Design preview: nothing was actually sent.)</p></div></div>`;
  });

  // Admin-only controls that save instantly in the real dashboard
  if (page.startsWith("/admin") && page !== "/admin/login") {
    document.addEventListener("change", (e) => { if (e.target.matches("select") && !e.target.closest("form")) toast("Preview only: status changes are saved once the shop is live."); });
    $$("button").forEach((b) => {
      if (/Mark as replied|Replied|Delete/.test(b.textContent)) b.addEventListener("click", () => toast("Preview only: not saved."));
    });
    $$('input[type=file]').forEach((i) => i.addEventListener("change", () => toast("Photo uploads work once the shop is live.")));
  }

  /* ── Shop filters & sorting ── */
  if (page === "/shop") {
    const grid = $$("a[href^='painting-']")[0]?.parentElement;
    const cards = $$("a[href^='painting-']", grid);
    const slugOf = (a) => a.getAttribute("href").replace(/^painting-|\.html$/g, "");
    const bySlug = Object.fromEntries(P.map((p) => [p.slug, p]));
    const state = { availability: "", size: "", price: "", collection: "", style: "", color: "", sort: "featured" };
    const band = (p) => (!p.w || !p.h ? "unknown" : Math.max(p.w, p.h) < 40 ? "small" : Math.max(p.w, p.h) <= 80 ? "medium" : "large");
    const uniq = (xs) => [...new Set(xs.filter(Boolean))].sort();
    const countEl = $$("p[aria-live]")[0];
    const sw = { black: "#1f1d1b", blue: "#2f6fb0", coral: "#e8664f", earth: "#a0703f", gold: "#d4af37", green: "#4f8a4f", pink: "#e8a0b4", purple: "#8e7cc3", red: "#c0392b", teal: "#1f8a87", white: "#f4f1ea", yellow: "#e9b93b" };

    const apply = () => {
      let list = cards.map((a) => ({ a, p: bySlug[slugOf(a)] })).filter(({ p }) => {
        if (!p) return true;
        if (state.availability === "available" && p.status !== "available") return false;
        if (state.availability === "sold" && p.status === "available") return false;
        if (state.size && band(p) !== state.size) return false;
        if (state.price) { const [mn, mx] = state.price.split("-").map((n) => (n ? +n : null)); if (mn != null && p.price < mn) return false; if (mx != null && p.price >= mx) return false; }
        if (state.collection && p.collection !== state.collection) return false;
        if (state.style && p.style !== state.style) return false;
        if (state.color && !p.colors.includes(state.color)) return false;
        return true;
      });
      const s = state.sort;
      list.sort((x, y) => s === "price-asc" ? x.p.price - y.p.price : s === "price-desc" ? y.p.price - x.p.price : s === "newest" ? new Date(y.p.created) - new Date(x.p.created)
        : (x.p.status !== "available") - (y.p.status !== "available") || y.p.featured - x.p.featured || x.p.order - y.p.order);
      cards.forEach((a) => (a.style.display = "none"));
      list.forEach(({ a }) => { a.style.display = ""; grid.appendChild(a); });
      if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? "painting" : "paintings"}`;
      const badge = $("#filter-count");
      const n = ["availability", "size", "price", "collection", "style", "color"].filter((k) => state[k]).length;
      if (badge) { badge.textContent = n; badge.style.display = n ? "" : "none"; }
    };

    const sortSel = $$("select").find((s) => s.closest("label")?.textContent.includes("Sort"));
    sortSel?.addEventListener("change", () => { state.sort = sortSel.value; apply(); });

    const fbtn = $('button[aria-controls="filters-panel"]');
    if (fbtn) {
      fbtn.insertAdjacentHTML("beforeend", '<span id="filter-count" class="rounded-full bg-coral-deep px-2 py-0.5 text-xs text-white" style="display:none">0</span>');
      const sel = (k, label, opts) => `<label class="block"><span class="eyebrow mb-2 block">${label}</span><select data-k="${k}" class="field py-2.5 text-sm"><option value="">All</option>${opts.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join("")}</select></label>`;
      const panel = document.createElement("div");
      panel.id = "filters-panel";
      panel.className = "animate-fade-up border-b border-line py-6";
      panel.hidden = true;
      panel.innerHTML = `<div class="grid grid-cols-2 gap-4 md:grid-cols-5">
        ${sel("availability", "Availability", [["available", "Available"], ["sold", "Sold / reserved"]])}
        ${sel("size", "Size", [["small", "Small (under 40 cm)"], ["medium", "Medium (40–80 cm)"], ["large", "Large (over 80 cm)"]])}
        ${sel("price", "Price", [["0-300", "Under $300"], ["300-700", "$300 – $700"], ["700-1200", "$700 – $1,200"], ["1200-", "Over $1,200"]])}
        ${sel("collection", "Collection", uniq(P.map((p) => p.collection)).map((c) => [c, c]))}
        ${sel("style", "Style", uniq(P.map((p) => p.style)).map((c) => [c, c]))}</div>
        <fieldset class="mt-6"><legend class="eyebrow mb-3">Color</legend><div class="flex flex-wrap gap-2">
        ${uniq(P.flatMap((p) => p.colors)).map((c) => `<button type="button" data-color="${c}" aria-pressed="false" class="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm capitalize"><span class="h-3.5 w-3.5 rounded-full border border-black/10" style="background:${sw[c] || "#ccc"}"></span>${c}</button>`).join("")}
        </div></fieldset><button type="button" id="clear-filters" class="mt-6 text-sm text-coral-deep">Clear all filters</button>`;
      fbtn.parentElement.after(panel);
      fbtn.addEventListener("click", () => { panel.hidden = !panel.hidden; fbtn.setAttribute("aria-expanded", String(!panel.hidden)); });
      $$("select[data-k]", panel).forEach((s) => s.addEventListener("change", () => { state[s.dataset.k] = s.value; apply(); }));
      $$("button[data-color]", panel).forEach((b) => b.addEventListener("click", () => {
        state.color = state.color === b.dataset.color ? "" : b.dataset.color;
        $$("button[data-color]", panel).forEach((x) => { const on = x.dataset.color === state.color; x.setAttribute("aria-pressed", on); x.classList.toggle("bg-ink", on); x.classList.toggle("text-white", on); x.classList.toggle("bg-paper", !on); });
        apply();
      }));
      $("#clear-filters", panel).addEventListener("click", () => {
        Object.assign(state, { availability: "", size: "", price: "", collection: "", style: "", color: "" });
        $$("select[data-k]", panel).forEach((s) => (s.value = ""));
        $$("button[data-color]", panel).forEach((x) => { x.setAttribute("aria-pressed", "false"); x.classList.remove("bg-ink", "text-white"); x.classList.add("bg-paper"); });
        apply();
      });
    }
  }

  /* ── Painting page: thumbnails, zoom, view in a room ── */
  if (page.startsWith("/paintings/")) {
    const p = P.find((x) => page.endsWith("/" + x.slug));
    const zoomBtn = $('button[aria-label^="Zoom into"]');
    const mainImg = zoomBtn?.querySelector("img");
    const thumbs = $$('[role="tablist"] button');
    thumbs.forEach((t, i) => t.addEventListener("click", () => {
      const src = t.querySelector("img")?.getAttribute("src");
      if (src && mainImg) { mainImg.src = src; mainImg.alt = t.getAttribute("aria-label").replace(/^Show image \d+: /, ""); }
      thumbs.forEach((x, j) => { x.setAttribute("aria-selected", i === j); x.classList.toggle("ring-2", i === j); x.classList.toggle("ring-ink", i === j); x.classList.toggle("opacity-70", i !== j); });
    }));

    const overlay = (inner, label) => {
      const o = document.createElement("div");
      o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", label);
      o.innerHTML = inner;
      document.body.appendChild(o);
      lockScroll(true);
      const close = () => { o.remove(); lockScroll(false); document.removeEventListener("keydown", onKey); };
      const onKey = (e) => e.key === "Escape" && close();
      document.addEventListener("keydown", onKey);
      o.querySelector("[data-close]").addEventListener("click", close);
      o.querySelector("[data-close]").focus();
      return o;
    };
    const X = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>';

    zoomBtn?.addEventListener("click", () => {
      const o = overlay(`<div class="fixed inset-0 z-[70] flex items-center justify-center p-4" style="background:#141312">
        <button type="button" data-close class="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white" aria-label="Close zoom">${X}</button>
        <div data-stage class="relative h-full w-full overflow-hidden cursor-zoom-in"><img src="${mainImg.getAttribute("src")}" alt="${esc(mainImg.alt)}" class="h-full w-full select-none object-contain transition-transform duration-300" draggable="false"></div>
        <p class="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs text-white/60">Tap anywhere to zoom in · tap again to zoom out</p></div>`, "Zoomed view");
      const stage = o.querySelector("[data-stage]"), img = stage.querySelector("img");
      let zoomed = false;
      const point = (e) => { const r = stage.getBoundingClientRect(); img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`; };
      stage.addEventListener("pointerdown", (e) => { point(e); zoomed = !zoomed; img.style.transform = zoomed ? "scale(2.6)" : ""; stage.style.touchAction = zoomed ? "none" : ""; });
      stage.addEventListener("pointermove", (e) => zoomed && point(e));
    });

    const roomBtn = $$("button").find((b) => b.textContent.includes("View in a room"));
    roomBtn?.addEventListener("click", () => {
      const w = p?.w || 60, h = p?.h || 75, hasSize = Boolean(p?.w && p?.h);
      const walls = [["Warm white", "#efe9df"], ["Sage", "#b9c4b0"], ["Terracotta", "#c98b6b"], ["Charcoal", "#3b3936"]];
      const o = overlay(`<div class="fixed inset-0 z-[70] flex flex-col bg-[#1a1918] p-3 sm:p-8">
        <div class="mx-auto flex w-full max-w-5xl items-center justify-between pb-3 text-white"><p class="font-serif text-xl italic">${esc(p?.title || "")}, in a living room</p>
        <button type="button" data-close class="rounded-full bg-white/10 p-2" aria-label="Close room view">${X}</button></div>
        <div class="mx-auto flex w-full max-w-5xl flex-1 items-center"><div data-wall class="relative aspect-[16/10] w-full overflow-hidden rounded-lg transition-colors duration-500" style="background:#efe9df">
          <div class="absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-black/10"></div>
          <div class="absolute inset-x-0 bottom-0 h-[14%] bg-[#b08a63]" style="background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.06) 0 1px,transparent 1px 12%)"></div>
          <div class="absolute inset-x-0 bottom-[14%] h-[1.2%] bg-white/70"></div>
          <div class="absolute left-1/2 -translate-x-1/2 shadow-[6px_14px_24px_-6px_rgba(0,0,0,0.45)]" style="width:${(w / 400) * 100}%;height:${(h / 250) * 100}%;bottom:50%"><img src="${p?.image}" alt="${esc(p?.alt || "")}" class="h-full w-full object-cover"></div>
          <svg viewBox="0 0 210 85" class="absolute bottom-[12%] left-1/2 w-[52.5%] -translate-x-1/2" aria-hidden="true"><rect x="8" y="10" width="194" height="42" rx="10" fill="#d9d2c5"/><rect x="0" y="30" width="26" height="45" rx="10" fill="#cfc7b8"/><rect x="184" y="30" width="26" height="45" rx="10" fill="#cfc7b8"/><rect x="20" y="44" width="170" height="28" rx="6" fill="#e3ddd1"/><line x1="105" y1="44" x2="105" y2="72" stroke="#cfc7b8" stroke-width="1.5"/><rect x="34" y="22" width="34" height="26" rx="6" fill="#e8664f" opacity=".85"/><rect x="146" y="24" width="30" height="24" rx="6" fill="#1f8a87" opacity=".8"/><rect x="14" y="74" width="5" height="10" fill="#6b5a48"/><rect x="191" y="74" width="5" height="10" fill="#6b5a48"/></svg>
          <svg viewBox="0 0 40 90" class="absolute bottom-[13%] right-[6%] w-[7%]" aria-hidden="true"><path d="M20 60 C 5 40, 2 20, 12 5 M20 60 C 30 38, 38 22, 30 8 M20 60 C 18 40, 20 25, 22 12" stroke="#4f7942" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M8 58 h24 l-4 30 h-16z" fill="#c98b6b"/></svg>
        </div></div>
        <div class="mx-auto mt-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 text-white">
          <div class="flex items-center gap-2" role="radiogroup" aria-label="Wall color">${walls.map(([n, c], i) => `<button type="button" role="radio" aria-checked="${i === 0}" aria-label="${n}" data-c="${c}" class="h-8 w-8 rounded-full border-2 ${i === 0 ? "border-white" : "border-white/30"}" style="background:${c}"></button>`).join("")}</div>
          <p class="text-xs text-white/70">${hasSize ? `Shown to scale above a 210 cm sofa (${w} × ${h} cm).` : "Approximate preview: exact size to be announced."}</p></div></div>`, "View in a room");
      $$("[data-c]", o).forEach((b) => b.addEventListener("click", () => {
        o.querySelector("[data-wall]").style.background = b.dataset.c;
        $$("[data-c]", o).forEach((x) => { const on = x === b; x.setAttribute("aria-checked", on); x.classList.toggle("border-white", on); x.classList.toggle("border-white/30", !on); });
      }));
    });
  }
}
