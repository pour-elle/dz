/* =========================================================
   المنتجات — أضف / عدّل / احذف منتجاتك هنا
   image: ضع صورة المنتج في مجلد assets/products/ واكتب مسارها
   oldPrice: السعر قبل التخفيض (اختياري)
   ========================================================= */
const CATEGORIES = [
  { id: "beaute",      name: "جمال",           fr: "Beauté",                 icon: "lotus" },
  { id: "bien-etre",   name: "عناية وراحة",     fr: "Bien-être",              icon: "heart" },
  { id: "accessoires", name: "إكسسوارات عملية", fr: "Accessoires pratiques",  icon: "bag" },
  { id: "quotidien",   name: "حلول يومية",      fr: "Solutions au quotidien", icon: "spark" }
];

const PRODUCTS = [
  { id: "serum-rose", category: "beaute", name: "سيروم الورد للوجه", price: 2900, oldPrice: 3500,
    image: "assets/placeholder.svg", badge: "الأكثر مبيعاً",
    description: "سيروم مرطّب بخلاصة الورد وحمض الهيالورونيك، يمنح بشرتك نضارة وإشراقة طبيعية من أول استعمال. مناسب لجميع أنواع البشرة.",
    options: [] },
  { id: "kit-maquillage", category: "beaute", name: "طقم فرش المكياج الذهبي", price: 3200,
    image: "assets/placeholder.svg",
    description: "طقم من 12 فرشاة ناعمة جداً بمقابض ذهبية أنيقة مع حقيبة حفظ. مثالي للمكياج اليومي والمناسبات.",
    options: [] },
  { id: "parfum-elle", category: "beaute", name: "عطر Elle الزهري 50ml", price: 4500, oldPrice: 5200,
    image: "assets/placeholder.svg", badge: "جديد",
    description: "عطر أنثوي بنفحات الورد والياسمين والمسك الأبيض، ثبات طويل يدوم طوال اليوم.",
    options: [] },
  { id: "bougie-relax", category: "bien-etre", name: "شمعة معطّرة للاسترخاء", price: 1800,
    image: "assets/placeholder.svg",
    description: "شمعة من شمع الصويا الطبيعي بعطر اللافندر والفانيليا، تدوم حتى 40 ساعة. لحظة هدوء خاصة بك.",
    options: ["لافندر", "فانيليا", "ورد"] },
  { id: "masque-yeux", category: "bien-etre", name: "قناع النوم الحريري", price: 1500,
    image: "assets/placeholder.svg",
    description: "قناع عيون من الحرير الناعم يحجب الضوء تماماً ويحافظ على بشرة المنطقة حول العينين.",
    options: ["وردي", "بيج", "أسود"] },
  { id: "brosse-demelante", category: "accessoires", name: "فرشاة الشعر المضادة للتشابك", price: 1900, oldPrice: 2400,
    image: "assets/placeholder.svg",
    description: "فرشاة بشعيرات مرنة تفك التشابك بلطف دون تقصّف، مناسبة للشعر الرطب والجاف.",
    options: [] },
  { id: "trousse", category: "accessoires", name: "حقيبة مستحضرات التجميل", price: 2200,
    image: "assets/placeholder.svg",
    description: "حقيبة أنيقة مقاومة للماء بعدة جيوب لتنظيم أغراضك في البيت أو السفر.",
    options: ["وردي", "بيج"] },
  { id: "mug-citation", category: "quotidien", name: "كوب «Prendre soin de soi»", price: 1600,
    image: "assets/placeholder.svg", badge: "هدية مثالية",
    description: "كوب سيراميك وردي بعبارة ملهمة، هدية رقيقة لها أو لنفسك. سعة 350ml.",
    options: [] },
  { id: "organisateur", category: "quotidien", name: "منظّم الطاولة الرخامي", price: 2600,
    image: "assets/placeholder.svg",
    description: "منظّم بتصميم رخامي وذهبي لترتيب مستحضراتك ومجوهراتك بأناقة.",
    options: [] }
];
