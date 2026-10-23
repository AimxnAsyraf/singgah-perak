// Tourism Perak dashboard: sample bookings + live demo bookings from this device.
const charts = {};
let map = null;
let mapLayer = null;

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function rm(n) {
  return `RM${Math.round(n).toLocaleString("en-MY")}`;
}

function aggregate(list) {
  const byOrigin = { th: 0, sg: 0, id: 0 };
  const byNights = { 1: 0, 2: 0, 3: 0 };
  const byDistrict = {};
  let nights = 0, total = 0, kampung = 0;
  for (const b of list) {
    byOrigin[b.origin]++;
    byNights[b.nights] = (byNights[b.nights] || 0) + 1;
    nights += b.nights;
    total += b.total;
    kampung += b.kampung;
    for (const [d, v] of Object.entries(b.byDistrict)) byDistrict[d] = (byDistrict[d] || 0) + v;
  }
  return { count: list.length, avgNights: list.length ? nights / list.length : 0, total, kampung, byOrigin, byNights, byDistrict };
}

function tile(value, label, live) {
  const card = document.createElement("div");
  card.className = "card tile";
  const v = document.createElement("div");
  v.className = "v";
  v.textContent = value;
  const k = document.createElement("div");
  k.className = "k";
  k.textContent = label;
  card.append(v, k);
  if (live) {
    const s = document.createElement("div");
    s.className = "src";
    const dot = document.createElement("span");
    dot.className = "live-dot";
    s.append(dot, `${live} ${t("live")}`);
    card.append(s);
  }
  return card;
}

const isNum = (c) => typeof c === "number" || /^RM/.test(c);

function fillTable(id, head, rows) {
  const tb = document.getElementById(id);
  tb.textContent = "";
  const numCols = head.map((_, i) => rows.length > 0 && isNum(rows[0][i]));
  const tr0 = document.createElement("tr");
  head.forEach((h, i) => {
    const th = document.createElement("th");
    th.textContent = h;
    if (numCols[i]) th.className = "num";
    tr0.append(th);
  });
  tb.append(tr0);
  for (const r of rows) {
    const tr1 = document.createElement("tr");
    r.forEach((c, i) => {
      const td = document.createElement("td");
      if (c instanceof Node) td.append(c);
      else td.textContent = c;
      if (numCols[i]) td.className = "num";
      tr1.append(td);
    });
    tb.append(tr1);
  }
}

function barChart(id, labels, data, opts = {}) {
  if (typeof Chart === "undefined") return;
  if (charts[id]) charts[id].destroy();
  const ink2 = css("--ink-2"), line = css("--line"), series = css("--series-1"), surface = css("--surface");
  charts[id] = new Chart(document.getElementById(id), {
    type: "bar",
    data: {
      labels,
      datasets: [{
        data, backgroundColor: series, hoverBackgroundColor: series,
        borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
        borderSkipped: "start", borderWidth: 0, maxBarThickness: 44,
      }],
    },
    options: {
      indexAxis: opts.horizontal ? "y" : "x",
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: surface, titleColor: ink2, bodyColor: css("--ink"),
          borderColor: css("--border"), borderWidth: 1, padding: 10, displayColors: false,
          bodyFont: { weight: "700" },
          callbacks: { label: (c) => (opts.money ? rm(c.raw) : `${c.raw} ${t("trips")}`) },
        },
      },
      scales: {
        x: { grid: { display: !!opts.horizontal, color: line }, ticks: { color: ink2 }, border: { color: css("--line") } },
        y: { grid: { display: !opts.horizontal, color: line }, ticks: { color: ink2 }, border: { display: false }, beginAtZero: true },
      },
    },
  });
}

function renderMap(byDistrict) {
  const box = document.getElementById("map");
  if (typeof L === "undefined") {
    box.textContent = "Map needs an internet connection.";
    return;
  }
  if (!map) {
    map = L.map(box, { scrollWheelZoom: false }).setView([4.65, 100.9], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }
  if (mapLayer) mapLayer.remove();
  mapLayer = L.layerGroup().addTo(map);
  const max = Math.max(...Object.values(byDistrict), 1);
  for (const [d, v] of Object.entries(byDistrict)) {
    const pos = DISTRICTS[d];
    if (!pos) continue;
    L.circleMarker(pos, {
      radius: 8 + 22 * Math.sqrt(v / max), color: "#ffffff", weight: 2,
      fillColor: css("--series-1"), fillOpacity: 0.8,
    }).bindTooltip(`${d}: ${rm(v)}`).addTo(mapLayer);
  }
}

// Impact calculator: defaults come from the prototype's own averages.
function renderImpact(a) {
  const nightsTotal = a.avgNights * a.count;
  const spendBox = document.getElementById("imp-spend");
  const kampungBox = document.getElementById("imp-kampung");
  if (!spendBox.value) spendBox.value = Math.round(a.total / nightsTotal / 10) * 10;
  if (!kampungBox.value) kampungBox.value = Math.round((a.kampung / a.total) * 100);

  const num = (id) => Math.max(0, Number(document.getElementById(id).value) || 0);
  const nights = num("imp-tourists") * (Math.min(num("imp-pct"), 100) / 100);
  const total = nights * num("imp-spend");
  const kampung = total * (Math.min(num("imp-kampung"), 100) / 100);
  const big = (n) => (n >= 1e6 ? `RM${(n / 1e6).toFixed(1)}M` : rm(n));

  const out = document.getElementById("imp-out");
  out.textContent = "";
  out.append(
    tile(Math.round(nights).toLocaleString("en-MY"), t("imp_nights")),
    tile(big(total), t("imp_total")),
    tile(big(kampung), t("imp_to_kampung")),
  );
}

let lastAgg = null;
for (const id of ["imp-tourists", "imp-pct", "imp-spend", "imp-kampung"]) {
  document.getElementById(id).addEventListener("input", () => lastAgg && renderImpact(lastAgg));
}

function render() {
  applyI18n();
  const live = loadBookings();
  const all = sampleBookings().concat(live);
  const a = aggregate(all);

  const m = document.getElementById("metrics");
  m.textContent = "";
  m.append(
    tile(String(a.count), t("m_bookings"), live.length ? `+${live.length}` : null),
    tile(a.avgNights.toFixed(1), t("m_nights")),
    tile(rm(a.total), t("m_spend")),
    tile(`${Math.round((a.kampung / a.total) * 100)}%`, t("m_kampung")),
  );

  const originLabels = Object.keys(a.byOrigin).map((k) => `${ORIGINS[k].flag} ${tr(ORIGINS[k].name).split(/ \(|（/)[0]}`);
  barChart("ch-origin", originLabels, Object.values(a.byOrigin));
  fillTable("tb-origin", [t("col_origin"), t("trips")], originLabels.map((l, i) => [l, Object.values(a.byOrigin)[i]]));

  const nightLabels = Object.keys(a.byNights).map((n) => t("nights_n", { n }));
  barChart("ch-nights", nightLabels, Object.values(a.byNights));
  fillTable("tb-nights", [t("col_nights"), t("trips")], nightLabels.map((l, i) => [l, Object.values(a.byNights)[i]]));

  const districts = Object.entries(a.byDistrict).sort((x, y) => y[1] - x[1]);
  barChart("ch-district", districts.map((d) => d[0]), districts.map((d) => d[1]), { horizontal: true, money: true });
  fillTable("tb-district", [t("c_district"), t("col_value")], districts.map(([d, v]) => [d, rm(v)]));

  renderMap(a.byDistrict);
  lastAgg = a;
  renderImpact(a);

  const recent = all.slice().sort((x, y) => y.ts - x.ts).slice(0, 10);
  fillTable("tb-recent",
    [t("col_time"), t("col_origin"), t("col_nights"), t("col_spend"), t("col_kampung")],
    recent.map((b) => {
      const when = document.createElement("span");
      if (b.live) {
        const dot = document.createElement("span");
        dot.className = "live-dot";
        when.append(dot);
      }
      when.append(new Date(b.ts).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: b.live ? "short" : undefined }));
      return [when, `${ORIGINS[b.origin].flag} ${tr(ORIGINS[b.origin].name)}`, b.nights, b.total, b.kampung];
    }),
  );
}

document.getElementById("lang").addEventListener("change", (e) => {
  setLang(e.target.value);
  render();
});
document.getElementById("reset").addEventListener("click", () => {
  clearBookings();
  render();
});
// Update when a booking is made in another tab (good for the live stage demo).
window.addEventListener("storage", render);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);

render();
