/* Pour Elle — منطق المتجر (سلة، صفحات، طلب) */
(() => {
  const C = STORE_CONFIG;
  const app = document.getElementById("app");
  const CART_KEY = "pourelle_cart";

  const ICONS = {
    lotus: '<path d="M12 20c-4 0-8-3-8-7 3 0 5 1 8 4 3-3 5-4 8-4 0 4-4 7-8 7z"/><path d="M12 17c-2-3-2-8 0-12 2 4 2 9 0 12z"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    bag: '<path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
    spark: '<path d="M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7z"/>'
  };

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => `${Number(n).toLocaleString("fr-DZ").replace(/ | /g, " ")} ${C.currency}`;
  const findProduct = id => PRODUCTS.find(p => p.id === id);
  const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || "";

  /* ---------- Cart ---------- */
  const load = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
  let cart = load().filter(i => findProduct(i.id));
  const save = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch {} updateCount(); };
  const lineKey = (id, opt) => `${id}__${opt || ""}`;

  function addToCart(id, qty = 1, option = "") {
    const key = lineKey(id, option);
    const line = cart.find(i => lineKey(i.id, i.option) === key);
    if (line) line.qty += qty; else cart.push({ id, qty, option });
    save();
    const el = document.getElementById("cartCount");
    el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
    toast("✓ تمت الإضافة إلى السلة");
  }
  function setQty(key, qty) {
    cart = cart.map(i => lineKey(i.id, i.option) === key ? { ...i, qty } : i).filter(i => i.qty > 0);
    save();
  }
  const subtotal = () => cart.reduce((s, i) => s + findProduct(i.id).price * i.qty, 0);
  function updateCount() { document.getElementById("cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0); }

  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------- Components ---------- */
  function card(p) {
    const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    return `<article class="card">
      ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
      ${off ? `<span class="badge sale">-${off}%</span>` : ""}
      <a href="#/product/${esc(p.id)}" class="thumb"><img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy"></a>
      <div class="body">
        <a href="#/product/${esc(p.id)}"><h3>${esc(p.name)}</h3></a>
        <div class="price"><b>${money(p.price)}</b>${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</div>
        <button class="btn outline" data-add="${esc(p.id)}">أضيفي للسلة</button>
      </div>
    </article>`;
  }
  const sectionTitle = (t, sub) => `<div class="section-title"><h2>${t}</h2><div class="divider">♥</div>${sub ? `<p class="script">${sub}</p>` : ""}</div>`;

  /* ---------- Pages ---------- */
  function home() {
    const featured = PRODUCTS.slice(0, 8);
    return `
      <section class="hero">
        <img src="assets/banner.jpg" alt="Pour Elle — Parce qu'elle compte aussi">
        <a href="#/shop" class="btn hero-cta">تسوّقي الآن</a>
      </section>

      <section class="section">
        ${sectionTitle("تسوّقي حسب الفئة")}
        <div class="cats">
          ${CATEGORIES.map(c => `<a class="cat" href="#/shop/${c.id}">
            <div class="ico"><svg viewBox="0 0 24 24">${ICONS[c.icon]}</svg></div>
            <b>${esc(c.name)}</b><small>${esc(c.fr)}</small></a>`).join("")}
        </div>
      </section>

      <section class="section">
        ${sectionTitle("منتجات مختارة لكِ", "Rien que pour vous")}
        <div class="grid">${featured.map(card).join("")}</div>
        <p style="text-align:center;margin-top:24px"><a href="#/shop" class="btn">عرض كل المنتجات</a></p>
      </section>

      <section class="section features">
        <div class="feature"><span>🚚</span><b>توصيل 58 ولاية</b><small>للمنزل أو المكتب</small></div>
        <div class="feature"><span>💵</span><b>الدفع عند الاستلام</b><small>ادفعي عند وصول طلبك</small></div>
        <div class="feature"><span>✨</span><b>جودة مضمونة</b><small>منتجات مختارة بعناية</small></div>
        <div class="feature"><span>💬</span><b>خدمة سريعة</b><small>نرد عليك عبر واتساب</small></div>
      </section>

      <section class="section quote">
        <p class="script">Tu es plus forte que tu ne le penses ♡</p>
        <p style="color:var(--muted);margin-top:6px">الاهتمام بنفسك هو أيضاً اهتمام بمن تحبين</p>
      </section>`;
  }

  function shop(catId = "") {
    return `
      <h1 class="page-title" style="text-align:center">${catId ? esc(catName(catId)) : "كل المنتجات"}</h1>
      <input class="search" id="search" type="search" placeholder="ابحثي عن منتج...">
      <div class="filters">
        <a class="chip ${!catId ? "active" : ""}" href="#/shop">الكل</a>
        ${CATEGORIES.map(c => `<a class="chip ${c.id === catId ? "active" : ""}" href="#/shop/${c.id}">${esc(c.name)}</a>`).join("")}
      </div>
      <div class="grid" id="shopGrid"></div>
      <div class="section"></div>`;
  }
  function renderShopGrid(catId, q = "") {
    q = q.trim().toLowerCase();
    const list = PRODUCTS.filter(p => (!catId || p.category === catId) && (!q || (p.name + p.description).toLowerCase().includes(q)));
    document.getElementById("shopGrid").innerHTML = list.length ? list.map(card).join("") : `<p class="empty" style="grid-column:1/-1">لا توجد منتجات مطابقة</p>`;
  }

  function product(id) {
    const p = findProduct(id);
    if (!p) return `<div class="empty"><h2>المنتج غير موجود</h2><p><a class="btn" href="#/shop">العودة للمتجر</a></p></div>`;
    const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
    return `
      <p class="breadcrumb"><a href="#/">الرئيسية</a> / <a href="#/shop/${p.category}">${esc(catName(p.category))}</a> / ${esc(p.name)}</p>
      <section class="product">
        <div>
          <div class="gallery"><img id="mainImg" src="${esc(p.image)}" alt="${esc(p.name)}"></div>
          ${p.images && p.images.length > 1 ? `<div class="thumbs">${p.images.map((src, i) => `<button class="${i === 0 ? "active" : ""}" data-img="${esc(src)}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
        </div>
        <div>
          ${p.badge ? `<span class="chip active" style="display:inline-block;margin-bottom:8px">${esc(p.badge)}</span>` : ""}
          <h1>${esc(p.name)}</h1>
          <div class="price" style="margin-top:8px"><b>${money(p.price)}</b>${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}</div>
          <p class="desc">${esc(p.description)}</p>
          ${p.options && p.options.length ? `<p class="opt-label">الاختيار:</p>
            <div class="options" id="opts">${p.options.map((o, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-opt="${esc(o)}">${esc(o)}</button>`).join("")}</div>` : ""}
          <p class="opt-label">الكمية:</p>
          <div class="qty"><button data-q="1">+</button><span id="qty">1</span><button data-q="-1">−</button></div>
          <div class="actions">
            <button class="btn" id="buyNow">اطلبي الآن</button>
            <button class="btn outline" id="addBtn">أضيفي للسلة</button>
          </div>
          <div class="trust">
            <span>💵 الدفع عند الاستلام</span>
            <span>🚚 توصيل إلى 58 ولاية خلال 24 – 72 ساعة</span>
            <span>📞 تأكيد الطلب بمكالمة هاتفية</span>
          </div>
        </div>
      </section>
      ${related.length ? `<section class="section">${sectionTitle("قد يعجبك أيضاً")}<div class="grid">${related.map(card).join("")}</div></section>` : ""}`;
  }

  function cartPage() {
    if (!cart.length) return `<div class="empty"><div class="success"><div class="check">🛍️</div><h2>سلتك فارغة</h2><p>اكتشفي منتجاتنا المختارة لكِ</p><p style="margin-top:16px"><a class="btn" href="#/shop">تسوّقي الآن</a></p></div></div>`;
    return `
      <h1 class="page-title">سلة التسوق</h1>
      <div class="cart-layout">
        <div class="panel">
          ${cart.map(i => {
            const p = findProduct(i.id), k = lineKey(i.id, i.option);
            return `<div class="cart-item">
              <img src="${esc(p.image)}" alt="">
              <div><h4>${esc(p.name)}</h4>${i.option ? `<small>${esc(i.option)}</small><br>` : ""}<small>${money(p.price)}</small></div>
              <div class="right">
                <div class="qty"><button data-k="${esc(k)}" data-d="1">+</button><span>${i.qty}</span><button data-k="${esc(k)}" data-d="-1">−</button></div>
                <b>${money(p.price * i.qty)}</b>
                <button class="remove" data-rm="${esc(k)}">حذف ✕</button>
              </div>
            </div>`;
          }).join("")}
        </div>
        <div class="panel">
          <div class="summary-row"><span>المجموع</span><b>${money(subtotal())}</b></div>
          <div class="summary-row"><span>التوصيل</span><small>يُحسب حسب الولاية</small></div>
          ${freeShipHint()}
          <a href="#/checkout" class="btn block" style="margin-top:14px">إتمام الطلب</a>
          <a href="#/shop" class="btn outline block" style="margin-top:8px">متابعة التسوق</a>
        </div>
      </div>`;
  }
  function freeShipHint() {
    if (!C.freeShippingFrom) return "";
    const left = C.freeShippingFrom - subtotal();
    return `<p style="font-size:.88rem;color:var(--rose);margin-top:6px">${left > 0 ? `أضيفي ${money(left)} للحصول على توصيل مجاني 🎁` : "🎉 مبروك! التوصيل مجاني"}</p>`;
  }

  function checkout() {
    if (!cart.length) { location.hash = "#/cart"; return ""; }
    return `
      <h1 class="page-title">إتمام الطلب — الدفع عند الاستلام</h1>
      <div class="cart-layout">
        <form class="panel form" id="orderForm" novalidate>
          <div class="row2">
            <div class="field"><label>الاسم واللقب *</label><input name="name" required autocomplete="name"><span class="err">يرجى إدخال الاسم الكامل</span></div>
            <div class="field"><label>رقم الهاتف *</label><input name="phone" type="tel" inputmode="numeric" required placeholder="05 / 06 / 07 ..." autocomplete="tel"><span class="err">رقم هاتف غير صحيح (مثال: 0555123456)</span></div>
          </div>
          <div class="row2">
            <div class="field"><label>الولاية *</label>
              <select name="wilaya" required><option value="">اختاري الولاية</option>
                ${WILAYAS.map(w => `<option value="${w.code}">${String(w.code).padStart(2, "0")} - ${esc(w.name)}</option>`).join("")}
              </select><span class="err">يرجى اختيار الولاية</span></div>
            <div class="field"><label>البلدية *</label><input name="commune" required><span class="err">يرجى إدخال البلدية</span></div>
          </div>
          <div class="field"><label>نوع التوصيل</label>
            <div class="delivery">
              <label><input type="radio" name="delivery" value="home" checked> 🏠 إلى المنزل <small id="feeHome"></small></label>
              <label><input type="radio" name="delivery" value="desk"> 🏢 إلى المكتب <small id="feeDesk"></small></label>
            </div>
          </div>
          <div class="field"><label>العنوان</label><input name="address" placeholder="الحي، الشارع، رقم المنزل"></div>
          <div class="field"><label>ملاحظة (اختياري)</label><textarea name="note" rows="2"></textarea></div>
          <button class="btn pink block" type="submit" id="submitBtn">✓ تأكيد الطلب</button>
          <small style="color:var(--muted);text-align:center">سنتصل بك لتأكيد الطلب قبل الإرسال</small>
        </form>
        <div class="panel">
          <h3 style="color:var(--brown);margin-bottom:10px">ملخص الطلب</h3>
          ${cart.map(i => { const p = findProduct(i.id); return `<div class="summary-row"><span>${esc(p.name)}${i.option ? ` (${esc(i.option)})` : ""} × ${i.qty}</span><span>${money(p.price * i.qty)}</span></div>`; }).join("")}
          <div class="summary-row" style="border-top:1px solid #f1e2dc;margin-top:6px;padding-top:10px"><span>المجموع</span><span>${money(subtotal())}</span></div>
          <div class="summary-row"><span>التوصيل</span><span id="shipFee">—</span></div>
          <div class="summary-row total"><span>الإجمالي</span><span id="grandTotal">${money(subtotal())}</span></div>
          ${freeShipHint()}
        </div>
      </div>`;
  }

  function shippingFee(code, type) {
    const w = WILAYAS.find(x => x.code === Number(code));
    if (!w) return null;
    if (C.freeShippingFrom && subtotal() >= C.freeShippingFrom) return 0;
    return type === "desk" ? w.desk : w.home;
  }

  function bindCheckout() {
    const f = document.getElementById("orderForm");
    if (!f) return;
    const refresh = () => {
      const code = f.wilaya.value, type = f.delivery.value;
      const w = WILAYAS.find(x => x.code === Number(code));
      const free = C.freeShippingFrom && subtotal() >= C.freeShippingFrom;
      document.getElementById("feeHome").textContent = w ? `(${free ? "مجاني" : money(w.home)})` : "";
      document.getElementById("feeDesk").textContent = w ? `(${free ? "مجاني" : money(w.desk)})` : "";
      const fee = shippingFee(code, type);
      document.getElementById("shipFee").textContent = fee === null ? "—" : fee === 0 ? "مجاني" : money(fee);
      document.getElementById("grandTotal").textContent = money(subtotal() + (fee || 0));
    };
    f.addEventListener("change", refresh);
    refresh();

    f.addEventListener("submit", async e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      d.phone = (d.phone || "").replace(/[\s.-]/g, "").replace(/^\+?213/, "0");
      const checks = {
        name: d.name.trim().length >= 3,
        phone: /^0[5-7]\d{8}$/.test(d.phone) || /^0[2-4]\d{7}$/.test(d.phone),
        wilaya: !!d.wilaya,
        commune: d.commune.trim().length >= 2
      };
      let ok = true;
      for (const [k, v] of Object.entries(checks)) {
        f[k].closest(".field").classList.toggle("invalid", !v);
        if (!v) ok = false;
      }
      if (!ok) { f.querySelector(".invalid input, .invalid select").focus(); return; }

      const btn = document.getElementById("submitBtn");
      btn.disabled = true; btn.textContent = "جاري الإرسال...";

      const w = WILAYAS.find(x => x.code === Number(d.wilaya));
      const fee = shippingFee(d.wilaya, d.delivery);
      const order = {
        id: "PE" + Date.now().toString(36).toUpperCase(),
        date: new Date().toLocaleString("fr-DZ"),
        name: d.name.trim(), phone: d.phone,
        wilaya: `${w.code} - ${w.name}`, commune: d.commune.trim(), address: d.address.trim(),
        delivery: d.delivery === "desk" ? "مكتب" : "منزل",
        items: cart.map(i => { const p = findProduct(i.id); return `${p.name}${i.option ? ` (${i.option})` : ""} x${i.qty}`; }).join(" | "),
        subtotal: subtotal(), shipping: fee, total: subtotal() + fee, note: d.note.trim()
      };

      let sent = false;
      if (C.ordersEndpoint) {
        try {
          await fetch(C.ordersEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(order) });
          sent = true;
        } catch (err) { console.error(err); }
      }
      if (C.whatsapp && (C.sendOrderToWhatsapp || !sent)) {
        const msg = `🌷 طلب جديد ${order.id}\n👤 ${order.name}\n📞 ${order.phone}\n📍 ${order.wilaya} - ${order.commune}\n🏠 ${order.address || "-"} (${order.delivery})\n🛍️ ${order.items}\n💰 المجموع: ${money(order.total)} (التوصيل ${money(order.shipping)})${order.note ? `\n📝 ${order.note}` : ""}`;
        window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
      }

      cart = []; save();
      app.innerHTML = `<div class="success panel">
        <div class="check">🌷</div>
        <h2>شكراً ${esc(order.name)}! تم استلام طلبك</h2>
        <p style="margin:8px 0">رقم الطلب: <b>${order.id}</b></p>
        <p style="color:var(--muted)">سنتصل بك قريباً على الرقم <b dir="ltr">${esc(order.phone)}</b> لتأكيد الطلب.<br>الإجمالي عند الاستلام: <b>${money(order.total)}</b></p>
        <p class="script" style="margin-top:14px">Parce qu'elle compte aussi.</p>
        <a href="#/" class="btn" style="margin-top:16px">العودة للرئيسية</a>
      </div>`;
      window.scrollTo(0, 0);
    });
  }

  /* ---------- Router ---------- */
  function route() {
    const [, page = "", arg = ""] = location.hash.replace(/^#/, "").split("/");
    document.querySelectorAll("#nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#/${page}${arg && page === "shop" ? "/" + arg : ""}`));
    switch (page) {
      case "shop": app.innerHTML = shop(arg); renderShopGrid(arg);
        document.getElementById("search").addEventListener("input", e => renderShopGrid(arg, e.target.value)); break;
      case "product": app.innerHTML = product(decodeURIComponent(arg)); break;
      case "cart": app.innerHTML = cartPage(); break;
      case "checkout": app.innerHTML = checkout(); bindCheckout(); break;
      default: app.innerHTML = home();
    }
    window.scrollTo(0, 0);
  }

  /* ---------- Events (delegated) ---------- */
  app.addEventListener("click", e => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.add) {
      const p = findProduct(t.dataset.add);
      if (p.options && p.options.length) { location.hash = `#/product/${p.id}`; return; }
      addToCart(p.id);
    } else if (t.dataset.img) {
      document.getElementById("mainImg").src = t.dataset.img;
      document.querySelectorAll(".thumbs button").forEach(b => b.classList.toggle("active", b === t));
    } else if (t.dataset.opt !== undefined) {
      document.querySelectorAll("#opts .chip").forEach(c => c.classList.toggle("active", c === t));
    } else if (t.dataset.q) {
      const q = document.getElementById("qty");
      q.textContent = Math.max(1, Math.min(20, +q.textContent + +t.dataset.q));
    } else if (t.id === "addBtn" || t.id === "buyNow") {
      const id = decodeURIComponent(location.hash.split("/")[2]);
      const opt = document.querySelector("#opts .chip.active");
      addToCart(id, +document.getElementById("qty").textContent, opt ? opt.dataset.opt : "");
      if (t.id === "buyNow") location.hash = "#/checkout";
    } else if (t.dataset.k) {
      const line = cart.find(i => lineKey(i.id, i.option) === t.dataset.k);
      setQty(t.dataset.k, line.qty + +t.dataset.d); app.innerHTML = cartPage();
    } else if (t.dataset.rm) {
      setQty(t.dataset.rm, 0); app.innerHTML = cartPage();
    }
  });

  /* ---------- Init ---------- */
  document.getElementById("nav").innerHTML =
    `<a href="#/">الرئيسية</a><a href="#/shop">المتجر</a>` +
    CATEGORIES.map(c => `<a href="#/shop/${c.id}">${esc(c.name)}</a>`).join("");
  document.getElementById("footerCats").innerHTML = CATEGORIES.map(c => `<li><a href="#/shop/${c.id}">${esc(c.name)}</a></li>`).join("");
  document.getElementById("footerContact").innerHTML = [
    C.phone && `<li>📞 <a href="tel:${esc(C.phone.replace(/\s/g, ""))}" dir="ltr">${esc(C.phone)}</a></li>`,
    C.whatsapp && `<li>💬 <a href="https://wa.me/${esc(C.whatsapp)}" target="_blank" rel="noopener">واتساب</a></li>`,
    C.instagram && `<li>📸 <a href="${esc(C.instagram)}" target="_blank" rel="noopener">Instagram</a></li>`,
    C.facebook && `<li>👍 <a href="${esc(C.facebook)}" target="_blank" rel="noopener">Facebook</a></li>`,
    C.tiktok && `<li>🎵 <a href="${esc(C.tiktok)}" target="_blank" rel="noopener">TikTok</a></li>`
  ].filter(Boolean).join("");
  document.getElementById("year").textContent = new Date().getFullYear();
  const wa = document.getElementById("waFloat");
  if (C.whatsapp) wa.href = `https://wa.me/${C.whatsapp}`; else wa.remove();
  if (C.freeShippingFrom) document.getElementById("freeShipNote").textContent = `· 🎁 توصيل مجاني ابتداءً من ${money(C.freeShippingFrom)}`;

  updateCount();
  window.addEventListener("hashchange", route);
  route();
})();
