/* =====================================================================
   MELTORA — products.js
   THIS IS THE ONLY FILE YOU NEED TO EDIT FOR DAY-TO-DAY CHANGES.
   (prices, availability, delivery fee, WhatsApp number, areas, links)

   Tip for Android: open this file on GitHub in your mobile browser,
   tap the pencil (Edit) icon, change a value, then tap "Commit changes".
   Keep the quotes "" and commas , exactly as they are.
   ===================================================================== */

window.MELTORA_CONFIG = {
  /* ---------- BRAND ---------- */
  brandName: "Meltora",
  tagline: { en: "Melt Into Happiness.", ur: "خوشیوں میں گھل جائیں۔" },

  /* ---------- WHATSAPP (MOST IMPORTANT) ----------
     Replace with YOUR WhatsApp number in international format:
     - start with 92 (Pakistan)
     - NO plus sign, NO leading zero, NO spaces
     Example: if your number is 0300 1234567, write "923001234567"
     While it still contains XXXX the site shows a warning and will
     not open WhatsApp. */
  WHATSAPP_NUMBER: "92XXXXXXXXXX",

  /* ---------- CONTACT & SOCIAL ----------
     Leave a value as "" to hide it. Nothing here is invented. */
  contact: {
    phoneDisplay: "",            // e.g. "0300 1234567" (shown in Contact section)
    email: "",                   // e.g. "hello@yourdomain.com"
    instagramUrl: "",            // e.g. "https://instagram.com/yourpage"
    facebookUrl: "",             // optional
    hoursText: { en: "", ur: "" } // e.g. { en: "Mon–Sat, 10am–8pm", ur: "پیر تا ہفتہ، صبح 10 تا رات 8" }
  },

  /* ---------- LANGUAGE ---------- */
  defaultLanguage: "en",         // "en" or "ur"

  /* ---------- CURRENCY ---------- */
  currencyLabel: "Rs.",

  /* ---------- ANNOUNCEMENT BAR ----------
     Set show to false to hide the bar. */
  announcement: {
    show: true,
    en: "Now serving selected areas of Karachi.",
    ur: "اب کراچی کے منتخب علاقوں میں ڈیلیوری دستیاب ہے۔"
  },

  /* ---------- DELIVERY ---------- */
  delivery: {
    fee: 250,                    // PLACEHOLDER delivery fee in Rs. Change to your real fee.
    freeDeliveryAbove: 0,        // 0 = no free delivery. Only set a number if you really offer it.
    minimumOrder: 0,             // 0 = disabled. e.g. 1500 means orders under Rs. 1,500 are blocked.
    timing: {                    // PLACEHOLDER text — write your real delivery timing.
      en: "[Delivery timing: to be confirmed by our team on WhatsApp]",
      ur: "[ڈیلیوری کا وقت: ہماری ٹیم واٹس ایپ پر تصدیق کرے گی]"
    },
    handling: {                  // Shown in Delivery section. Edit to match what you really do.
      en: "Cheese is a temperature-sensitive product. Please be available to receive your order and refrigerate it as soon as it arrives. Our team will confirm how your order will be handled when they contact you.",
      ur: "پنیر درجہ حرارت کے لیے حساس پروڈکٹ ہے۔ براہ کرم آرڈر وصول کرنے کے لیے موجود رہیں اور پہنچتے ہی اسے فریج میں رکھیں۔ ہماری ٹیم رابطہ کرتے وقت آپ کو بتائے گی کہ آپ کا آرڈر کس طرح ڈیلیور کیا جائے گا۔"
    },
    /* Supported delivery areas. These are EXAMPLES — delete, rename or add
       your real ones. Each line: { en: "English name", ur: "اردو نام" }  */
    areas: [
      { en: "Clifton", ur: "کلفٹن" },
      { en: "DHA", ur: "ڈی ایچ اے" },
      { en: "Gulshan-e-Iqbal", ur: "گلشنِ اقبال" },
      { en: "Gulistan-e-Jauhar", ur: "گلستانِ جوہر" },
      { en: "North Nazimabad", ur: "نارتھ ناظم آباد" },
      { en: "PECHS", ur: "پی ای سی ایچ ایس" },
      { en: "Bahadurabad", ur: "بہادر آباد" },
      { en: "Saddar", ur: "صدر" }
    ]
  },

  /* ---------- PAYMENT ----------
     Cash on Delivery is subject to business confirmation. Set to false to hide. */
  payments: {
    cashOnDelivery: true
  },

  /* ---------- SEO (replace before publishing) ---------- */
  seo: {
    siteUrl: "https://YOUR-SITE.pages.dev/"  // used only as a reminder; also edit <link rel="canonical"> in index.html
  }
};

/* =====================================================================
   PRODUCTS
   - price: PLACEHOLDER prices in Rs. Change every "price" to your real retail price.
   - salePrice: optional. Set a number lower than price to show a sale price, or null.
   - available: true / false. false shows "Out of stock" and blocks ordering.
   - stock: optional number (how many you have) or null for "not tracked".
     When stock is a number, customers cannot add more than that quantity.
   - image: put your photo in assets/images/ with exactly this file name.
     If the photo is missing, a designed placeholder is shown instead.
   - category: "cheddar", "mozzarella" or "combo".
   ===================================================================== */
window.MELTORA_PRODUCTS = [
  {
    id: "cheddar-200g",
    category: "cheddar",
    name: { en: "Cheddar Cheese", ur: "چیڈر پنیر" },
    description: {
      en: "Cheddar cheese for burgers, sandwiches and everyday recipes.",
      ur: "برگر، سینڈوچ اور روزمرہ کی ڈشز کے لیے چیڈر پنیر۔"
    },
    weight: { en: "200 g", ur: "200 گرام" },
    price: 999,          // PLACEHOLDER — change me
    salePrice: null,
    available: true,
    stock: null,
    image: "assets/images/cheddar-200g.jpg"
  },
  {
    id: "cheddar-500g",
    category: "cheddar",
    name: { en: "Cheddar Cheese", ur: "چیڈر پنیر" },
    description: {
      en: "Cheddar cheese for burgers, sandwiches and everyday recipes.",
      ur: "برگر، سینڈوچ اور روزمرہ کی ڈشز کے لیے چیڈر پنیر۔"
    },
    weight: { en: "500 g", ur: "500 گرام" },
    price: 1999,         // PLACEHOLDER — change me
    salePrice: null,
    available: true,
    stock: null,
    image: "assets/images/cheddar-500g.jpg"
  },
  {
    id: "cheddar-1kg",
    category: "cheddar",
    name: { en: "Cheddar Cheese", ur: "چیڈر پنیر" },
    description: {
      en: "Cheddar cheese for burgers, sandwiches and everyday recipes.",
      ur: "برگر، سینڈوچ اور روزمرہ کی ڈشز کے لیے چیڈر پنیر۔"
    },
    weight: { en: "1 kg", ur: "1 کلو" },
    price: 3799,         // PLACEHOLDER — change me
    salePrice: null,
    available: true,
    stock: null,
    image: "assets/images/cheddar-1kg.jpg"
  },
  {
    id: "mozzarella-200g",
    category: "mozzarella",
    name: { en: "Mozzarella Cheese", ur: "موزریلا پنیر" },
    description: {
      en: "Mozzarella cheese for pizza nights, pasta and baked dishes.",
      ur: "پیزا، پاستا اور بیکڈ ڈشز کے لیے موزریلا پنیر۔"
    },
    weight: { en: "200 g", ur: "200 گرام" },
    price: 899,          // PLACEHOLDER — change me
    salePrice: null,
    available: true,
    stock: null,
    image: "assets/images/mozzarella-200g.jpg"
  },
  {
    id: "mozzarella-500g",
    category: "mozzarella",
    name: { en: "Mozzarella Cheese", ur: "موزریلا پنیر" },
    description: {
      en: "Mozzarella cheese for pizza nights, pasta and baked dishes.",
      ur: "پیزا، پاستا اور بیکڈ ڈشز کے لیے موزریلا پنیر۔"
    },
    weight: { en: "500 g", ur: "500 گرام" },
    price: 1799,         // PLACEHOLDER — change me
    salePrice: null,
    available: true,
    stock: null,
    image: "assets/images/mozzarella-500g.jpg"
  },
  {
    id: "mozzarella-1kg",
    category: "mozzarella",
    name: { en: "Mozzarella Cheese", ur: "موزریلا پنیر" },
    description: {
      en: "Mozzarella cheese for pizza nights, pasta and baked dishes.",
      ur: "پیزا، پاستا اور بیکڈ ڈشز کے لیے موزریلا پنیر۔"
    },
    weight: { en: "1 kg", ur: "1 کلو" },
    price: 3499,         // PLACEHOLDER — change me
    salePrice: null,
    available: true,
    stock: null,
    image: "assets/images/mozzarella-1kg.jpg"
  }

  /* COMBO DEALS: none configured, so the "Combo Deals" category stays hidden.
     To add one, copy a product block above, add a comma after the previous block,
     and set category: "combo". Example:

  ,{
    id: "combo-pizza-night",
    category: "combo",
    name: { en: "Pizza Night Combo", ur: "پیزا نائٹ کومبو" },
    description: { en: "Describe exactly what is included.", ur: "بالکل واضح لکھیں کہ کیا شامل ہے۔" },
    weight: { en: "500 g + 500 g", ur: "500 گرام + 500 گرام" },
    price: 3000,
    salePrice: null,
    available: true,
    stock: null,
    image: "assets/images/combo-pizza-night.jpg"
  }
  */
];
