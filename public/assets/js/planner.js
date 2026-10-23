// Trip planner page.
let currentPlan = null;

function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else n.setAttribute(k, v);
  }
  for (const c of children) if (c != null) n.append(c);
  return n;
}

function renderOrigins() {
  const box = document.getElementById("origins");
  const checked = box.querySelector("input:checked")?.value || "th";
  box.textContent = "";
  for (const [key, o] of Object.entries(ORIGINS)) {
    const input = el("input", { type: "radio", name: "origin", value: key });
    if (key === checked) input.checked = true;
    box.append(el("label", { class: "choice" }, input, el("span", {}, `${o.flag} ${tr(o.name)}`)));
  }
}

function readForm() {
  const f = document.getElementById("planner");
  return {
    origin: f.querySelector("input[name=origin]:checked").value,
    days: Number(f.querySelector("input[name=days]:checked").value),
    interests: [...f.querySelectorAll("input[name=interest]:checked")].map((x) => x.value),
    halal: f.querySelector("input[name=halal]").checked,
  };
}

function rm(n) {
  return `RM${n.toLocaleString("en-MY")}`;
}

function renderPlan() {
  const box = document.getElementById("plan");
  box.textContent = "";
  if (!currentPlan) {
    box.append(el("p", { class: "empty" }, t("empty_state")));
    return;
  }
  const p = currentPlan;
  const o = ORIGINS[p.origin];
  const pct = Math.round((p.kampung / p.total) * 100);

  box.append(
    el("div", { class: "plan-head" },
      el("div", { class: "stat highlight" }, el("div", { class: "v" }, String(p.nights)), el("div", { class: "k" }, t("nights_in_perak"))),
      el("div", { class: "stat" }, el("div", { class: "v" }, rm(p.total)), el("div", { class: "k" }, t("est_spend"))),
      el("div", { class: "stat" }, el("div", { class: "v" }, `${pct}%`), el("div", { class: "k" }, t("to_kampung"))),
      el("div", { class: "stat" }, el("div", { class: "v" }, String(Object.keys(p.byDistrict).length)), el("div", { class: "k" }, t("districts_visited"))),
    ),
  );

  // Singgah vs Bermalam: the core problem as one number.
  const stop = stopoverSpend();
  const maxBar = Math.max(stop, p.total);
  const bar = (label, value, cls) =>
    el("div", { class: "cmp-row" },
      el("div", { class: "cmp-label" }, label),
      el("div", { class: "cmp-track" }, el("div", { class: `cmp-bar ${cls}`, style: `width:${Math.max(4, (value / maxBar) * 100)}%` })),
      el("div", { class: "cmp-val" }, rm(value)),
    );
  box.append(
    el("div", { class: "cmp" },
      el("div", { class: "cmp-head" },
        el("strong", {}, t("cmp_title")),
        el("span", { class: "cmp-x" }, t("cmp_x", { x: (p.total / stop).toFixed(1) })),
      ),
      bar(t("cmp_stop"), stop, "stop"),
      bar(t("cmp_stay"), p.total, "stay"),
      el("div", { class: "note", style: "margin-top:6px" }, t("cmp_note")),
    ),
  );

  let lastDay = 0;
  for (const it of p.items) {
    if (it.day !== lastDay) {
      box.append(el("div", { class: "day" }, t("day_label", { n: it.day })));
      lastDay = it.day;
    }
    if (it.kind === "rail") {
      const leg = o[it.leg];
      box.append(
        el("div", { class: "item" },
          el("div", { class: "time" }, it.time),
          el("div", {},
            el("div", { class: "name" }, `🚆 ${tr(leg.title)}`),
            leg.desc ? el("div", { class: "desc" }, tr(leg.desc)) : null,
            trainLine(it.leg === "arrive" ? o.train : o.returnTrain),
            el("span", { class: "pill rail" }, t("rail_tag")),
          ),
          el("div", { class: "rm" }, ""),
        ),
      );
      continue;
    }
    const pills = [];
    if (it.stay) pills.push(el("span", { class: "pill" }, `🌙 ${t("stay_tag")}`));
    if (it.halal) pills.push(el("span", { class: "pill" }, t("halal_tag")));
    if (it.seller) {
      pills.push(el("span", { class: "pill kampung" }, `🏡 ${t("seller_label")}: ${SELLERS[it.seller].name}`));
      pills.push(el("span", { class: "pill sample" }, t("sample_badge")));
    }
    box.append(
      el("div", { class: "item" },
        el("div", { class: "time" }, it.time),
        el("div", {},
          el("div", { class: "name" }, it.name),
          el("div", { class: "desc" }, `${tr(it.desc)} · ${it.district}`),
          ...pills,
        ),
        el("div", { class: "rm" }, rm(it.spend)),
      ),
    );
  }

  renderExtras(box, p);

  box.append(
    el("div", { class: "pay" }, el("strong", {}, `💳 ${t("pay_label")}`), tr(o.pay)),
  );
  const bookBtn = el("button", { class: "btn gold", type: "button", style: "margin-top:16px" }, t("book_btn"));
  bookBtn.addEventListener("click", openBooking);
  box.append(bookBtn);
  box.append(el("p", { class: "note" }, `${t("proto_note")} ${t("verify_trains")}`));
}

// "🎫 EP 9275 · Padang Besar 09:45 → Ipoh 12:44 · source" under a rail leg.
function trainLine(tr) {
  if (!tr) return null;
  return el("div", { class: "desc" },
    `🎫 ${tr.code} · ${tr.from} ${tr.dep} → ${tr.to || "Ipoh"} ${tr.arr} · `,
    el("a", { href: tr.url, target: "_blank", rel: "noopener" },
      t(tr.official ? "train_src_official" : "train_src", { src: tr.src })));
}

// Sellers registered on seller.html whose district is on this route.
function renderExtras(box, p) {
  const route = new Set(p.items.filter((x) => x.kind === "stop").map((x) => x.district));
  const onRoute = loadRegisteredSellers().filter((s) => route.has(s.district));
  if (!onRoute.length) return;

  const list = el("div", { class: "extras" }, el("strong", {}, `🏡 ${t("extras_title")}`));
  for (const s of onRoute) {
    const added = p.extras.some((x) => x.id === s.id);
    const btn = el("button", { class: `btn ${added ? "secondary" : ""}`, type: "button" }, added ? t("extras_remove") : t("extras_add"));
    btn.addEventListener("click", () => {
      if (added) p.extras = p.extras.filter((x) => x.id !== s.id);
      else p.extras.push({ id: s.id, name: s.name, district: s.district, spend: s.price, seller: s.id, desc: s.desc });
      Object.assign(p, planTotals(p));
      renderPlan();
    });
    list.append(
      el("div", { class: "extra" },
        el("div", {},
          el("div", { class: "name" }, s.name),
          el("div", { class: "desc" }, `${t("type_" + s.type)} · ${s.district} · ${rm(s.price)}${s.desc ? " · " + s.desc : ""}`),
        ),
        btn,
      ),
    );
  }
  box.append(list);
}

// Placeholder QR-like pattern. Not a real payment code.
function drawFakeQR(seed) {
  const c = document.getElementById("qr");
  const ctx = c.getContext("2d");
  const n = 25, s = c.width / n;
  let x = seed || 7;
  const rand = () => ((x = (x * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#222";
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (rand() < 0.45) ctx.fillRect(i * s, j * s, s, s);
  const finder = (cx, cy) => {
    ctx.fillStyle = "#222"; ctx.fillRect(cx * s, cy * s, 7 * s, 7 * s);
    ctx.fillStyle = "#fff"; ctx.fillRect((cx + 1) * s, (cy + 1) * s, 5 * s, 5 * s);
    ctx.fillStyle = "#222"; ctx.fillRect((cx + 2) * s, (cy + 2) * s, 3 * s, 3 * s);
  };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
}

function openBooking() {
  const p = currentPlan;
  const sum = document.getElementById("book-summary");
  sum.textContent = "";
  sum.append(
    el("p", { style: "margin:0 0 8px" }, `${ORIGINS[p.origin].flag} ${tr(ORIGINS[p.origin].name)} · ${t("dur_" + p.days)}`),
    el("p", { style: "margin:0 0 8px;font-weight:700" }, `${t("total")}: ${rm(p.total)} · ${t("to_kampung")}: ${rm(p.kampung)}`),
    el("ul", { class: "seller-list" },
      ...p.sellers.map((n) => el("li", {}, `${n} (${t("sample_badge")})`)),
      ...p.extras.map((x) => el("li", {}, x.name))),
  );
  drawFakeQR(p.total * 31 + p.days);
  document.getElementById("book").showModal();
}

function toast(msg) {
  const n = el("div", { class: "toast", role: "status" }, msg);
  document.body.append(n);
  setTimeout(() => n.remove(), 3500);
}

function init() {
  applyI18n();
  renderOrigins();

  document.getElementById("lang").addEventListener("change", (e) => {
    setLang(e.target.value);
    applyI18n();
    renderOrigins();
    renderPlan();
  });

  document.getElementById("planner").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = readForm();
    currentPlan = buildPlan(f.origin, f.days, f.interests, f.halal);
    renderPlan();
    if (window.innerWidth < 860) document.getElementById("plan").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("book-cancel").addEventListener("click", () => document.getElementById("book").close());
  document.getElementById("book-confirm").addEventListener("click", () => {
    saveBooking(currentPlan);
    document.getElementById("book").close();
    toast(t("booked_toast"));
  });
}

init();
