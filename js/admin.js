/* Pour Elle — لوحة التحكم (الطلبات والمنتجات) */
(() => {
  const C = STORE_CONFIG;
  const API = C.apiUrl;
  const PW_KEY = "pourelle_admin_pw";
  const STATUS_COLORS = { "جديد": "#c96f80", "مؤكد": "#2e7dd1", "تم الشحن": "#d48a1e", "تم التسليم": "#2a9d5b", "ملغى": "#8d6e66", "مرتجع": "#b23b3b" };
  let STATUSES = Object.keys(STATUS_COLORS);

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => `${Number(n || 0).toLocaleString("fr-DZ").replace(/ | /g, " ")} ${C.currency}`;
  const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || id || "—";
  const fmtDate = d => { const x = new Date(d); return isNaN(x) ? String(d || "") : x.toLocaleString("fr-DZ", { dateStyle: "short", timeStyle: "short" }); };

  let password = "";
  try { password = sessionStorage.getItem(PW_KEY) || ""; } catch {}
  let orders = [], products = [], statusFilter = "", editing = null, editImages = [];

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2400);
  }

  async function api(action, data = {}) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, password, ...data })
    });
    const j = await res.json();
    if (!j.ok) {
      if (j.error === "unauthorized") { logout(); throw new Error("كلمة السر غير صحيحة"); }
      throw new Error(j.error || "حدث خطأ");
    }
    return j;
  }

  /* ---------- Auth ---------- */
  function showDash() { $("loginView").hidden = true; $("dashView").hidden = false; loadOrders(); loadProducts(); }
  function logout() {
    password = "";
    try { sessionStorage.removeItem(PW_KEY); } catch {}
    $("dashView").hidden = true; $("loginView").hidden = false;
  }
  $("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    $("loginError").textContent = "";
    if (!API) { $("loginError").textContent = "يجب إضافة apiUrl في js/config.js أولاً"; return; }
    password = e.target.password.value;
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    try {
      await api("login");
      try { sessionStorage.setItem(PW_KEY, password); } catch {}
      e.target.reset();
      showDash();
    } catch (err) {
      $("loginError").textContent = err.message === "Failed to fetch" ? "تعذّر الاتصال بالخادم — تحققي من apiUrl" : "كلمة السر غير صحيحة";
      password = "";
    } finally { btn.disabled = false; }
  });
  $("logoutBtn").addEventListener("click", logout);

  /* ---------- Tabs ---------- */
  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === t));
    $("ordersTab").hidden = t.dataset.tab !== "orders";
    $("productsTab").hidden = t.dataset.tab !== "products";
  }));

  /* ---------- Orders ---------- */
  async function loadOrders() {
    $("ordersList").innerHTML = `<p class="empty">جاري تحميل الطلبات...</p>`;
    try {
      const j = await api("orders");
      orders = j.orders || [];
      if (j.statuses) STATUSES = j.statuses;
      renderOrders();
    } catch (err) { $("ordersList").innerHTML = `<p class="empty">${esc(err.message)}</p>`; }
  }

  function renderStats() {
    const today = new Date().toDateString();
    const delivered = orders.filter(o => o.status === "تم التسليم");
    const active = orders.filter(o => !["ملغى", "مرتجع"].includes(o.status));
    const n = orders.filter(o => o.status === "جديد").length;
    $("newBadge").textContent = n || "";
    $("stats").innerHTML = [
      ["طلبات اليوم", orders.filter(o => new Date(o.date).toDateString() === today).length],
      ["طلبات جديدة تنتظر التأكيد", n],
      ["مجموع الطلبات (غير الملغاة)", active.length],
      ["المداخيل (تم التسليم)", money(delivered.reduce((s, o) => s + Number(o.total || 0), 0))]
    ].map(([l, v]) => `<div class="stat"><small>${l}</small><b>${v}</b></div>`).join("");
  }

  function filteredOrders() {
    const q = $("orderSearch").value.trim().toLowerCase();
    return orders.filter(o => (!statusFilter || o.status === statusFilter) &&
      (!q || [o.id, o.name, o.phone, o.wilaya, o.commune, o.items].join(" ").toLowerCase().includes(q)));
  }

  function renderOrders() {
    renderStats();
    $("statusFilters").innerHTML = [["", "الكل", orders.length], ...STATUSES.map(s => [s, s, orders.filter(o => o.status === s).length])]
      .map(([v, l, c]) => `<button class="chip ${v === statusFilter ? "active" : ""}" data-status="${esc(v)}">${esc(l)}<span class="count">${c}</span></button>`).join("");
    const list = filteredOrders();
    if (!list.length) { $("ordersList").innerHTML = `<p class="empty">${orders.length ? "لا توجد طلبات مطابقة" : "لا توجد طلبات بعد 🌷"}</p>`; return; }
    $("ordersList").innerHTML = list.map(o => {
      const phone = String(o.phone || "");
      const wa = phone.replace(/^0/, "213");
      return `<article class="order" style="--st:${STATUS_COLORS[o.status] || "var(--pink)"}">
        <div>
          <h3>${esc(o.name)}</h3>
          <div class="meta">${esc(o.id)} · ${esc(fmtDate(o.date))}</div>
          <div class="contact" style="margin-top:8px">
            <a href="tel:${esc(phone)}" dir="ltr">📞 ${esc(phone)}</a>
            <a class="wa" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener">واتساب</a>
          </div>
        </div>
        <div>
          <div class="items">🛍️ ${esc(o.items)}</div>
          <div class="meta">📍 ${esc(o.wilaya)} — ${esc(o.commune)}${o.address ? ` — ${esc(o.address)}` : ""} · ${esc(o.delivery)}</div>
          ${o.note ? `<div class="meta">📝 ${esc(o.note)}</div>` : ""}
          <div class="total">${money(o.total)} <small class="muted">(منها التوصيل ${money(o.shipping)})</small></div>
        </div>
        <div class="side">
          <select data-order="${esc(o.id)}" aria-label="الحالة">${STATUSES.map(s => `<option ${s === o.status ? "selected" : ""}>${esc(s)}</option>`).join("")}</select>
          <button class="del-order" data-del-order="${esc(o.id)}">حذف</button>
        </div>
      </article>`;
    }).join("");
  }

  $("statusFilters").addEventListener("click", e => {
    const b = e.target.closest("[data-status]");
    if (b) { statusFilter = b.dataset.status; renderOrders(); }
  });
  $("orderSearch").addEventListener("input", renderOrders);
  $("refreshOrders").addEventListener("click", loadOrders);

  $("ordersList").addEventListener("change", async e => {
    const sel = e.target.closest("select[data-order]");
    if (!sel) return;
    const o = orders.find(x => String(x.id) === sel.dataset.order);
    const prev = o.status;
    o.status = sel.value; renderOrders();
    try { await api("updateOrder", { id: o.id, status: o.status }); toast(`✓ ${o.id}: ${o.status}`); }
    catch (err) { o.status = prev; renderOrders(); toast("✕ " + err.message); }
  });
  $("ordersList").addEventListener("click", async e => {
    const b = e.target.closest("[data-del-order]");
    if (!b || !confirm("حذف هذا الطلب نهائياً؟")) return;
    try { await api("deleteOrder", { id: b.dataset.delOrder }); orders = orders.filter(o => String(o.id) !== b.dataset.delOrder); renderOrders(); toast("تم حذف الطلب"); }
    catch (err) { toast("✕ " + err.message); }
  });

  $("exportCsv").addEventListener("click", () => {
    const cols = [["id", "رقم الطلب"], ["date", "التاريخ"], ["name", "الاسم"], ["phone", "الهاتف"], ["wilaya", "الولاية"], ["commune", "البلدية"],
      ["address", "العنوان"], ["delivery", "التوصيل"], ["items", "المنتجات"], ["subtotal", "المجموع"], ["shipping", "التوصيل (دج)"], ["total", "الإجمالي"], ["note", "ملاحظة"], ["status", "الحالة"]];
    const cell = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = "﻿" + [cols.map(c => cell(c[1])).join(","),
      ...filteredOrders().map(o => cols.map(([k]) => cell(k === "date" ? fmtDate(o[k]) : k === "phone" ? `\t${o[k]}` : o[k])).join(","))].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  /* ---------- Products ---------- */
  async function loadProducts() {
    $("productsList").innerHTML = `<p class="empty">جاري التحميل...</p>`;
    try { products = (await api("allProducts")).products || []; renderProducts(); }
    catch (err) { $("productsList").innerHTML = `<p class="empty">${esc(err.message)}</p>`; }
  }
  function renderProducts() {
    $("importBox").hidden = products.length > 0;
    const q = $("productSearch").value.trim().toLowerCase();
    const list = products.filter(p => !q || p.name.toLowerCase().includes(q));
    $("productsList").innerHTML = list.length ? list.map(p => `
      <div class="ap ${p.active ? "" : "off"}">
        <img src="${esc(p.image)}" alt="" loading="lazy">
        <div>
          <h4>${esc(p.name)}</h4>
          <small class="muted">${esc(catName(p.category))} · <b style="color:var(--rose)">${money(p.price)}</b>${p.active ? "" : " · مخفي"}</small>
          <div class="row">
            <button data-edit="${esc(p.id)}">✎ تعديل</button>
            <button data-toggle="${esc(p.id)}">${p.active ? "إخفاء" : "إظهار"}</button>
            <button data-del="${esc(p.id)}">🗑 حذف</button>
          </div>
        </div>
      </div>`).join("") : (products.length ? `<p class="empty">لا توجد نتائج</p>` : "");
  }
  $("productSearch").addEventListener("input", renderProducts);

  $("importBtn").addEventListener("click", async () => {
    const btn = $("importBtn"); btn.disabled = true;
    try {
      const j = await api("importProducts", { products: PRODUCTS.map((p, i) => ({ ...p, images: p.images || [p.image], sort: i + 1, active: true })) });
      toast(`✓ تم استيراد ${j.added} منتج`); await loadProducts();
    } catch (err) { toast("✕ " + err.message); }
    finally { btn.disabled = false; }
  });

  $("productsList").addEventListener("click", async e => {
    const b = e.target.closest("button");
    if (!b) return;
    const id = b.dataset.edit || b.dataset.toggle || b.dataset.del;
    const p = products.find(x => x.id === id);
    if (!p) return;
    if (b.dataset.edit) openDialog(p);
    else if (b.dataset.toggle) {
      try { await api("saveProduct", { product: { ...p, active: !p.active } }); p.active = !p.active; renderProducts(); toast(p.active ? "المنتج ظاهر الآن" : "تم إخفاء المنتج"); }
      catch (err) { toast("✕ " + err.message); }
    } else if (b.dataset.del && confirm(`حذف «${p.name}» نهائياً؟`)) {
      try { await api("deleteProduct", { id }); products = products.filter(x => x.id !== id); renderProducts(); toast("تم حذف المنتج"); }
      catch (err) { toast("✕ " + err.message); }
    }
  });

  /* ---------- Product dialog ---------- */
  const dlg = $("productDialog"), form = $("productForm");
  $("catSelect").innerHTML = CATEGORIES.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  dlg.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", () => dlg.close()));
  $("addProduct").addEventListener("click", () => openDialog(null));

  function openDialog(p) {
    editing = p;
    form.reset();
    $("productError").textContent = ""; $("uploadStatus").textContent = "";
    $("dialogTitle").textContent = p ? "تعديل المنتج" : "منتج جديد";
    if (p) {
      for (const k of ["name", "category", "badge", "price", "oldPrice", "description", "sort"]) form[k].value = p[k] ?? "";
      form.options.value = (p.options || []).join(", ");
      form.active.checked = !!p.active;
    } else {
      form.sort.value = products.reduce((m, x) => Math.max(m, Number(x.sort) || 0), 0) + 1;
      form.active.checked = true;
    }
    editImages = p ? [...(p.images && p.images.length ? p.images : [p.image])].filter(Boolean) : [];
    renderImages();
    dlg.showModal();
  }

  function renderImages() {
    $("imgList").innerHTML = editImages.map((src, i) => `<div class="img-item">
      <img src="${esc(src)}" alt="">
      <button type="button" data-rm-img="${i}" aria-label="حذف">✕</button>
      ${i > 0 ? `<button type="button" class="mv" data-main-img="${i}" title="اجعليها الرئيسية">★</button>` : ""}
    </div>`).join("") || `<small class="muted">لا توجد صور بعد</small>`;
  }
  $("imgList").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.rmImg !== undefined) editImages.splice(+b.dataset.rmImg, 1);
    else if (b.dataset.mainImg !== undefined) editImages.unshift(...editImages.splice(+b.dataset.mainImg, 1));
    renderImages();
  });
  $("addImgUrl").addEventListener("click", () => {
    const v = $("imgUrl").value.trim();
    if (!v) return;
    editImages.push(v); $("imgUrl").value = ""; renderImages();
  });

  // تصغير الصورة قبل الرفع (أسرع وأخف على الهاتف)
  function compress(file, max = 1200) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL("image/jpeg", 0.85).split(",")[1]);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  $("imgUpload").addEventListener("change", async e => {
    const files = [...e.target.files];
    e.target.value = "";
    const save = $("saveProduct");
    save.disabled = true;
    for (let i = 0; i < files.length; i++) {
      $("uploadStatus").textContent = `جاري رفع الصورة ${i + 1} من ${files.length}...`;
      try {
        const data = await compress(files[i]);
        const j = await api("uploadImage", { data, mime: "image/jpeg", name: files[i].name.replace(/\.\w+$/, "") + ".jpg" });
        editImages.push(j.url); renderImages();
      } catch (err) { toast("✕ فشل رفع " + files[i].name); }
    }
    $("uploadStatus").textContent = "";
    save.disabled = false;
  });

  const slug = s => (s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)) || "p";

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = form.name.value.trim(), price = Number(form.price.value);
    if (!name || !(price > 0)) { $("productError").textContent = "الاسم والسعر مطلوبان"; return; }
    let id = editing ? editing.id : slug(name);
    if (!editing && products.some(p => p.id === id)) id += "-" + Date.now().toString(36).slice(-4);
    const product = {
      id, name, price,
      category: form.category.value,
      oldPrice: Number(form.oldPrice.value) || null,
      badge: form.badge.value.trim(),
      description: form.description.value.trim(),
      options: form.options.value.split(/[,،]/).map(s => s.trim()).filter(Boolean),
      images: editImages,
      image: editImages[0] || "assets/placeholder.svg",
      active: form.active.checked,
      sort: Number(form.sort.value) || 0
    };
    const btn = $("saveProduct"); btn.disabled = true; btn.textContent = "جاري الحفظ...";
    try {
      await api("saveProduct", { product });
      if (editing) Object.assign(editing, product); else products.push(product);
      products.sort((a, b) => a.sort - b.sort);
      renderProducts(); dlg.close(); toast("✓ تم حفظ المنتج");
    } catch (err) { $("productError").textContent = err.message; }
    finally { btn.disabled = false; btn.textContent = "حفظ"; }
  });

  /* ---------- Init ---------- */
  if (!API) $("setupNote").hidden = false;
  if (API && password) showDash();
})();
