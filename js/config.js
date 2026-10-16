/* =========================================================
   إعدادات المتجر — عدّل هذا الملف فقط لتخصيص متجرك
   ========================================================= */
const STORE_CONFIG = {
  name: "Pour Elle",
  slogan: "Parce qu'elle compte aussi.",
  currency: "دج",

  // رقم الهاتف (يظهر في الموقع) ورقم واتساب بالصيغة الدولية بدون + أو 00
  phone: "0555 00 00 00",
  whatsapp: "213555000000",

  // روابط مواقع التواصل (اتركها فارغة "" لإخفائها)
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "",

  // رابط Google Apps Script (مجاني): يستقبل الطلبات ويشغّل لوحة التحكم admin.html
  // راجع README.md لطريقة الحصول عليه. إذا تركته فارغاً: المنتجات من products.js والطلبات عبر واتساب فقط.
  apiUrl: "https://script.google.com/macros/s/AKfycbwboN6H77rN_aOiNCiZ8vVs6plAXutUucFVHxNtyD2exdncW8RXqhi_MGF-5fRK5rI9/exec",

  // فتح واتساب تلقائياً بعد تأكيد الطلب (لنسخة إضافية من الطلب)
  sendOrderToWhatsapp: true,

  // توصيل مجاني ابتداءً من هذا المبلغ (0 = معطّل)
  freeShippingFrom: 8000
};
