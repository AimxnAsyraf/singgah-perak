// Seller sign-up page. Listings are saved on this device and show up in trip plans.

function renderSelects() {
  const type = document.getElementById("f-type");
  const district = document.getElementById("f-district");
  const keepType = type.value, keepDistrict = district.value;
  type.textContent = "";
  for (const k of SELLER_TYPES) type.append(new Option(t("type_" + k), k));
  if (!district.options.length) for (const d of Object.keys(DISTRICTS)) district.append(new Option(d, d));
  if (keepType) type.value = keepType;
  if (keepDistrict) district.value = keepDistrict;
}

function renderList() {
  const box = document.getElementById("seller-list");
  box.textContent = "";
  const list = loadRegisteredSellers();
  if (!list.length) {
    const p = document.createElement("p");
    p.className = "note";
    p.textContent = t("sel_empty");
    box.append(p);
    return;
  }
  for (const s of list) {
    const row = document.createElement("div");
    row.className = "extra";
    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = s.name;
    const desc = document.createElement("div");
    desc.className = "desc";
    desc.textContent = `${t("type_" + s.type)} · ${s.district} · RM${s.price}${s.desc ? " · " + s.desc : ""}`;
    info.append(name, desc);
    const btn = document.createElement("button");
    btn.className = "btn secondary";
    btn.type = "button";
    btn.textContent = t("sel_remove");
    btn.addEventListener("click", () => {
      saveRegisteredSellers(loadRegisteredSellers().filter((x) => x.id !== s.id));
      renderList();
    });
    row.append(info, btn);
    box.append(row);
  }
}

function render() {
  applyI18n();
  renderSelects();
  renderList();
}

document.getElementById("seller-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const seller = {
    id: "reg_" + Date.now(),
    name: String(f.get("name")).trim(),
    type: f.get("type"),
    district: f.get("district"),
    price: Math.round(Number(f.get("price"))),
    desc: String(f.get("desc") || "").trim(),
  };
  saveRegisteredSellers(loadRegisteredSellers().concat(seller));
  e.target.reset();
  renderList();
  const n = document.createElement("div");
  n.className = "toast";
  n.setAttribute("role", "status");
  n.textContent = t("sel_saved", { d: seller.district });
  document.body.append(n);
  setTimeout(() => n.remove(), 4000);
});

document.getElementById("lang").addEventListener("change", (e) => {
  setLang(e.target.value);
  render();
});

render();
