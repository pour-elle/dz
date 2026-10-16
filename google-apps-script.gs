/**
 * Pour Elle — الواجهة الخلفية المجانية (Google Sheets + Google Drive)
 * تستقبل الطلبات، وتخزّن المنتجات، وتشغّل لوحة التحكم admin.html
 *
 * التركيب:
 * 1) أنشئ Google Sheet جديد ← Extensions ← Apps Script
 * 2) الصق هذا الكود، وغيّر كلمة السر ADMIN_PASSWORD بالأسفل، ثم احفظ
 * 3) Deploy ← New deployment ← Web app
 *    Execute as: Me  |  Who has access: Anyone   ← ثم وافق على الصلاحيات
 * 4) انسخ رابط Web app وضعه في js/config.js داخل apiUrl
 * بعد أي تعديل على هذا الكود: Deploy ← Manage deployments ← Edit ← Version: New version
 */
const ADMIN_PASSWORD = "change-me-123"; // ⚠️ غيّرها إلى كلمة سر قوية
const IMAGES_FOLDER = "PourElle-Images";

const ORDER_SHEET = "Orders";
const ORDER_HEADERS = ["رقم الطلب","التاريخ","الاسم","الهاتف","الولاية","البلدية","العنوان","التوصيل","المنتجات","المجموع","سعر التوصيل","الإجمالي","ملاحظة","الحالة"];
const ORDER_KEYS = ["id","date","name","phone","wilaya","commune","address","delivery","items","subtotal","shipping","total","note","status"];
const STATUSES = ["جديد","مؤكد","تم الشحن","تم التسليم","ملغى","مرتجع"];

const PRODUCT_SHEET = "Products";
const PRODUCT_KEYS = ["id","category","name","price","oldPrice","badge","description","options","images","active","sort"];

/* ---------- Entry points ---------- */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "";
  if (action === "products") return json({ ok: true, products: readProducts().filter(p => p.active) });
  return json({ ok: true, name: "Pour Elle API" });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: "bad_request" }); }

  // طلب من المتجر (بدون action)
  if (!body.action) return json(createOrder(body));

  if (String(body.password || "") !== ADMIN_PASSWORD) return json({ ok: false, error: "unauthorized" });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    switch (body.action) {
      case "login":         return json({ ok: true });
      case "orders":        return json({ ok: true, orders: readOrders(), statuses: STATUSES });
      case "updateOrder":   return json(updateOrder(body.id, body.status));
      case "deleteOrder":   return json(deleteRowById(orderSheet(), body.id));
      case "allProducts":   return json({ ok: true, products: readProducts() });
      case "saveProduct":   return json(saveProduct(body.product));
      case "deleteProduct": return json(deleteRowById(productSheet(), body.id));
      case "importProducts":return json(importProducts(body.products || []));
      case "uploadImage":   return json(uploadImage(body));
      default:              return json({ ok: false, error: "unknown_action" });
    }
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Helpers ---------- */
function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
// يمنع حقن الصيغ في Google Sheets (نص يبدأ بـ = + - @)
function clean(v) {
  const s = String(v == null ? "" : v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.appendRow(headers);
    sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f6e1db");
    sh.setFrozenRows(1);
  }
  return sh;
}
const orderSheet = () => getSheet(ORDER_SHEET, ORDER_HEADERS);
const productSheet = () => getSheet(PRODUCT_SHEET, PRODUCT_KEYS);

function rows(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
}
function findRow(sh, id) {
  const data = rows(sh);
  for (let i = 0; i < data.length; i++) if (String(data[i][0]) === String(id)) return i + 2;
  return -1;
}
function deleteRowById(sh, id) {
  const r = findRow(sh, id);
  if (r < 0) return { ok: false, error: "not_found" };
  sh.deleteRow(r);
  return { ok: true };
}

/* ---------- Orders ---------- */
function createOrder(o) {
  if (!o || !o.name || !o.phone) return { ok: false, error: "missing_fields" };
  const sh = orderSheet();
  const id = clean(o.id || ("PE" + Date.now().toString(36).toUpperCase()));
  sh.appendRow([id, new Date(), clean(o.name), "'" + String(o.phone).replace(/[^\d+]/g, ""), clean(o.wilaya), clean(o.commune),
    clean(o.address), clean(o.delivery), clean(o.items), num(o.subtotal), num(o.shipping), num(o.total), clean(o.note), STATUSES[0]]);
  return { ok: true, id: id };
}

function readOrders() {
  return rows(orderSheet()).map(r => {
    const o = {};
    ORDER_KEYS.forEach((k, i) => { o[k] = r[i]; });
    o.date = o.date instanceof Date ? o.date.toISOString() : String(o.date || "");
    o.phone = String(o.phone).replace(/^'/, "");
    return o;
  }).reverse();
}

function updateOrder(id, status) {
  if (STATUSES.indexOf(status) < 0) return { ok: false, error: "bad_status" };
  const sh = orderSheet();
  const r = findRow(sh, id);
  if (r < 0) return { ok: false, error: "not_found" };
  sh.getRange(r, ORDER_KEYS.indexOf("status") + 1).setValue(status);
  return { ok: true };
}

/* ---------- Products ---------- */
function readProducts() {
  return rows(productSheet()).filter(r => r[0] !== "").map(r => {
    const p = {};
    PRODUCT_KEYS.forEach((k, i) => { p[k] = r[i]; });
    p.id = String(p.id);
    p.price = num(p.price);
    p.oldPrice = num(p.oldPrice) || null;
    p.options = String(p.options || "").split(/[,،\n]/).map(s => s.trim()).filter(String);
    p.images = String(p.images || "").split(/[\n,]+/).map(s => s.trim()).filter(String);
    p.image = p.images[0] || "assets/placeholder.svg";
    p.active = p.active === true || String(p.active).toUpperCase() === "TRUE";
    p.sort = num(p.sort);
    return p;
  }).sort((a, b) => a.sort - b.sort);
}

function productRow(p) {
  return [clean(p.id), clean(p.category), clean(p.name), num(p.price), num(p.oldPrice) || "", clean(p.badge),
    clean(p.description), clean((p.options || []).join(", ")), clean((p.images || []).join("\n")),
    p.active !== false, num(p.sort)];
}

function saveProduct(p) {
  if (!p || !p.id || !p.name) return { ok: false, error: "missing_fields" };
  const sh = productSheet();
  const r = findRow(sh, p.id);
  const row = productRow(p);
  if (r < 0) sh.appendRow(row);
  else sh.getRange(r, 1, 1, row.length).setValues([row]);
  return { ok: true };
}

function importProducts(list) {
  const sh = productSheet();
  let added = 0;
  list.forEach((p, i) => {
    if (findRow(sh, p.id) >= 0) return;
    if (p.sort == null) p.sort = i + 1;
    if (!p.images || !p.images.length) p.images = p.image ? [p.image] : [];
    sh.appendRow(productRow(p));
    added++;
  });
  return { ok: true, added: added };
}

/* ---------- Images (Google Drive) ---------- */
function uploadImage(b) {
  if (!b.data) return { ok: false, error: "no_data" };
  const it = DriveApp.getFoldersByName(IMAGES_FOLDER);
  const folder = it.hasNext() ? it.next() : DriveApp.createFolder(IMAGES_FOLDER);
  const blob = Utilities.newBlob(Utilities.base64Decode(b.data), b.mime || "image/jpeg", b.name || ("img-" + Date.now() + ".jpg"));
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, url: "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1200" };
}
