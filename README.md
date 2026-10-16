# 🌷 Pour Elle — متجر إلكتروني مجاني

> *Parce qu'elle compte aussi.*

متجر إلكتروني كامل وسريع، **مجاني 100%** (بدون استضافة مدفوعة ولا اشتراكات)، مصمم للسوق الجزائري:

- 🛍️ صفحة رئيسية، متجر بالفئات والبحث، صفحة لكل منتج، سلة تسوق
- 💵 **الدفع عند الاستلام** مع اختيار الولاية (58 ولاية) والبلدية
- 🚚 حساب سعر التوصيل تلقائياً (منزل / مكتب) + توصيل مجاني فوق مبلغ معيّن
- 📊 الطلبات تصلك في **Google Sheets** و/أو **واتساب**
- 📱 متجاوب مع الهاتف، باللغة العربية (RTL)

## 🚀 النشر مجاناً على GitHub Pages
1. في المستودع: **Settings ← Pages**
2. Source: **Deploy from a branch** ← اختر الفرع ثم المجلد `/ (root)` ← **Save**
3. بعد دقيقة يصبح متجرك متاحاً على: `https://<username>.github.io/dz/`

(يمكن أيضاً رفع المجلد مجاناً على Netlify أو Cloudflare Pages بالسحب والإفلات.)

## ⚙️ التخصيص
| الملف | ماذا تعدّل |
|---|---|
| `js/config.js` | الهاتف، واتساب، روابط التواصل، رابط الطلبات، التوصيل المجاني |
| `js/products.js` | المنتجات والفئات والأسعار والصور |
| `js/wilayas.js` | أسعار التوصيل لكل ولاية |
| `assets/` | الشعار `logo.jpg` والبانر `banner.jpg` وصور المنتجات |

**إضافة صور المنتجات:** ضع الصور في `assets/products/` (مثلاً `serum.jpg`) ثم في `products.js` اكتب `image: "assets/products/serum.jpg"`. يفضّل صور مربعة.

## 📊 استقبال الطلبات في Google Sheets (مجاني)
1. أنشئ Google Sheet جديد ← **Extensions ← Apps Script**
2. الصق محتوى الملف `google-apps-script.gs` واحفظ
3. **Deploy ← New deployment ← Web app** — Execute as: *Me*، Who has access: *Anyone*
4. انسخ الرابط وضعه في `js/config.js`:
   ```js
   ordersEndpoint: "https://script.google.com/macros/s/XXXX/exec",
   ```
كل طلب جديد يظهر كسطر في الجدول مع عمود "الحالة" لمتابعته.

## 🧪 التجربة محلياً
افتح `index.html` مباشرة في المتصفح، أو:
```bash
python3 -m http.server 8000
```
