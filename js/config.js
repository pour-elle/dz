/* =========================================================
   إعدادات المتجر — عدّل هذا الملف فقط لتخصيص متجرك
   ========================================================= */
const STORE_CONFIG = {
  name: "Pour Elle",
  slogan: "Parce qu'elle compte aussi.",
  currency: "دج",

  // رقم الهاتف (يظهر في الموقع) ورقم واتساب بالصيغة الدولية بدون + أو 00
  phone: "0555 11 22 33",
  whatsapp: "213555112233",

  // روابط مواقع التواصل (اتركها فارغة "" لإخفائها)
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "",

  // رابط Google Apps Script (مجاني): يستقبل الطلبات ويشغّل لوحة التحكم admin.html
  // راجع README.md لطريقة الحصول عليه. إذا تركته فارغاً: المنتجات من products.js والطلبات عبر واتساب فقط.
  apiUrl: "https://script.google.com/macros/s/AKfycbwuF6ZO88tcEneHlPLr3AIR5FPAoCrfe226BcASULX93Lzut-ONtN41T0Mt1RUZNuIv/exec",

  // فتح واتساب تلقائياً بعد تأكيد الطلب (لنسخة إضافية من الطلب)
  sendOrderToWhatsapp: true,

  // توصيل مجاني ابتداءً من هذا المبلغ (0 = معطّل)
  freeShippingFrom: 7000
};
