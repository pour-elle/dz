/**
 * Pour Elle — استقبال الطلبات في Google Sheets (مجاني)
 * 1) أنشئ Google Sheet جديد ← Extensions ← Apps Script
 * 2) الصق هذا الكود واحفظ
 * 3) Deploy ← New deployment ← Web app
 *    Execute as: Me  |  Who has access: Anyone
 * 4) انسخ رابط Web app وضعه في js/config.js داخل ordersEndpoint
 */
const HEADERS = ["رقم الطلب","التاريخ","الاسم","الهاتف","الولاية","البلدية","العنوان","التوصيل","المنتجات","المجموع","سعر التوصيل","الإجمالي","ملاحظة","الحالة"];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#f6e1db");
    sheet.setFrozenRows(1);
  }
  const o = JSON.parse(e.postData.contents);
  sheet.appendRow([o.id, o.date, o.name, "'" + o.phone, o.wilaya, o.commune, o.address, o.delivery,
    o.items, o.subtotal, o.shipping, o.total, o.note, "جديد"]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
