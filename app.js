/* =====================================================================
   MELTORA — app.js
   Store logic: language, products, cart, checkout, WhatsApp order.
   You normally do NOT need to edit this file.
   Prices, products, delivery fee and the WhatsApp number live in products.js.
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. CONFIG + PRODUCT VALIDATION
     ------------------------------------------------------------------ */
  var CFG = window.MELTORA_CONFIG || {};
  var DEL = CFG.delivery || {};
  var CONTACT = CFG.contact || {};
  var ANN = CFG.announcement || {};
  var CURRENCY = typeof CFG.currencyLabel === 'string' && CFG.currencyLabel ? CFG.currencyLabel : 'Rs.';
  var MAX_QTY = 20; // safety limit per product

  function toMoney(v) {
    var n = Number(v);
    return v !== null && v !== '' && isFinite(n) && n >= 0 ? Math.round(n) : null;
  }
  var FEE = toMoney(DEL.fee) === null ? 0 : toMoney(DEL.fee);
  var FREE_ABOVE = toMoney(DEL.freeDeliveryAbove) || 0;
  var MIN_ORDER = toMoney(DEL.minimumOrder) || 0;
  var AREAS = Array.isArray(DEL.areas) ? DEL.areas.filter(function (a) { return a && (a.en || a.ur); }) : [];
  var COD_ON = !(CFG.payments && CFG.payments.cashOnDelivery === false);

  var PRODUCTS = [];
  var BY_ID = new Map();
  (Array.isArray(window.MELTORA_PRODUCTS) ? window.MELTORA_PRODUCTS : []).forEach(function (p) {
    if (!p || typeof p.id !== 'string' || !p.id || BY_ID.has(p.id)) return;
    var price = toMoney(p.price);
    if (price === null) return; // skip products with an invalid price
    var sale = toMoney(p.salePrice);
    var stock = p.stock === null || p.stock === undefined ? null : toMoney(p.stock);
    var item = {
      id: p.id,
      category: typeof p.category === 'string' ? p.category : 'other',
      name: p.name || {},
      description: p.description || {},
      weight: p.weight || {},
      price: price,
      salePrice: sale !== null && sale < price ? sale : null,
      available: p.available !== false,
      stock: stock,
      image: typeof p.image === 'string' ? p.image : ''
    };
    PRODUCTS.push(item);
    BY_ID.set(item.id, item);
  });

  function unitPrice(p) { return p.salePrice !== null ? p.salePrice : p.price; }
  function isAvailable(p) { return p.available && (p.stock === null || p.stock > 0); }
  function maxFor(p) { return p.stock === null ? MAX_QTY : Math.min(MAX_QTY, p.stock); }

  /* ------------------------------------------------------------------
     2. TRANSLATIONS (central dictionary)
     ------------------------------------------------------------------ */
  var I18N = {
    en: {
      title: 'Meltora | Cheddar & Mozzarella Cheese in Karachi',
      meta_desc: 'Meltora offers cheddar and mozzarella cheese for pizza nights, burgers, sandwiches and homemade recipes. Order via WhatsApp in selected areas of Karachi.',
      skip: 'Skip to products',
      nav_home: 'Home', nav_shop: 'Shop', nav_about: 'About Us', nav_delivery: 'Delivery Information', nav_contact: 'Contact',
      switch_lang: 'Switch language',
      hero_eyebrow: 'Melt Into Happiness.',
      hero_title: 'Bring More Cheese to Every Bite.',
      hero_text: 'Discover cheddar and mozzarella for pizza nights, burgers, sandwiches and your favourite homemade recipes.',
      hero_cta1: 'Shop Cheese', hero_cta2: 'Explore Products',
      hero_note: 'Orders are placed through WhatsApp.',
      hero_alt: 'Melted cheese on a freshly baked pizza',
      cat_title: 'Shop by Category',
      cat_all: 'All', cat_cheddar: 'Cheddar Cheese', cat_mozzarella: 'Mozzarella Cheese', cat_combo: 'Combo Deals',
      shop_title: 'Our Cheese',
      shop_empty: 'No products to show right now.',
      shop_note: 'Prices are in Pakistani Rupees (Rs.). Please check the product label for full details.',
      add_to_cart: 'Add to Cart', out_of_stock: 'Out of stock', sale: 'Sale', added: 'Added to cart',
      about_title: 'About Meltora',
      about_p1: 'Meltora is a cheese brand created for people who love good food at home. We offer cheddar and mozzarella in practical pack sizes for pizza nights, burgers, sandwiches and everyday cooking.',
      about_p2: 'We are just getting started in Karachi, and we keep ordering simple: choose your cheese, send your order on WhatsApp and our team will confirm the details with you personally.',
      del_title: 'Delivery Information',
      del_area_h: 'Service area', del_area_t: 'Selected areas of Karachi.',
      del_fee_h: 'Delivery fee', del_fee_text: '{fee} per order. The final charge is confirmed by our team.',
      del_free_over: ' Delivery is free on orders of {amount} or more.',
      del_min_h: 'Minimum order', del_min_text: 'The minimum order value is {min}.',
      del_time_h: 'Delivery timing', del_handling_h: 'Handling',
      del_confirm_h: 'Is my area covered?',
      del_confirm_t: 'Choose your area at checkout. If it is not listed, message us on WhatsApp and we will tell you whether we can deliver to you.',
      del_areas_h: 'Areas we currently list',
      faq_title: 'Frequently Asked Questions', faq_title_short: 'FAQ',
      faq1_q: 'What is the difference between cheddar and mozzarella?',
      faq1_a: 'Cheddar is a firm cheese with a fuller, sharper flavour that suits burgers, sandwiches and grating. Mozzarella is milder and is known for stretching when melted, which is why it is popular on pizza and in baked pasta.',
      faq2_q: 'Which cheese is suitable for pizza?',
      faq2_a: 'Mozzarella is the classic choice for pizza because it melts and stretches well. Many people also blend in a little cheddar for extra flavour.',
      faq3_q: 'How can I place an order?',
      faq3_a: 'Add products to your cart, tap Proceed to Checkout, fill in your delivery details and send the prepared message on WhatsApp. Your order is confirmed only after our team replies.',
      faq4_q: 'Which areas do you deliver to?',
      faq4_a: 'We currently deliver to selected areas of Karachi. See the Delivery Information section for the areas we list, or message us on WhatsApp to check yours.',
      faq5_q: 'What payment methods are available?',
      pay_faq_cod: 'Cash on Delivery is offered, subject to confirmation by our team. Other payment methods: [to be confirmed].',
      pay_faq_none: '[Payment methods will be confirmed by our team on WhatsApp.]',
      faq6_q: 'How should I store my cheese?',
      faq6_a: 'Please follow the storage instructions printed on the product label. Cheese is generally kept refrigerated, but the label is the final guide for your pack.',
      faq7_q: 'How can I contact customer support?',
      faq7_a: 'Message us on WhatsApp using the button on this page and our team will help you.',
      contact_title: 'Contact Us',
      contact_text: 'Questions about products or delivery? Message us on WhatsApp.',
      whatsapp_btn: 'Chat on WhatsApp',
      wa_greeting: 'Hello Meltora, I have a question.',
      c_phone: 'Phone', c_email: 'Email', c_hours: 'Hours', c_instagram: 'Instagram', c_facebook: 'Facebook',
      privacy_title: 'Privacy Notice',
      privacy_text: 'This website does not send your details to any server. Your cart and language choice are saved only in your own browser. When you check out, the details you type are placed into a WhatsApp message that you review and send yourself. We use them only to process your order.',
      terms_title: 'Terms and Conditions',
      terms_text: 'Orders sent through this website are requests only. An order is confirmed after our team verifies product availability, delivery charges and delivery timing. Prices and availability may change. [Add your own return, refund and cancellation policy here.]',
      footer_links: 'Quick links', footer_delivery_h: 'Delivery',
      footer_social_note: 'Follow our updates on Instagram.',
      rights: 'All rights reserved.',
      cart_title: 'Your Cart', checkout_title: 'Checkout',
      cart_empty: 'Your cart is empty. Pick your favourite cheese!',
      back_shop: 'Back to shopping',
      each: 'each',
      subtotal: 'Subtotal', delivery: 'Delivery fee', total: 'Grand total', free: 'Free',
      cart_wa_note: 'Checkout currently works through WhatsApp. Your order is not confirmed until our team confirms availability and delivery.',
      proceed: 'Proceed to Checkout',
      back_to_cart: '← Back to cart',
      f_name: 'Full name', f_phone: 'Mobile number', f_area: 'Delivery area', f_area_ph: 'Select your area',
      f_address: 'Complete delivery address', f_notes: 'Delivery instructions (optional)', f_payment: 'Payment method',
      hint_area: 'Area not listed? Ask us on WhatsApp first.',
      pay_cod: 'Cash on Delivery (subject to our team’s confirmation)',
      pay_confirm: 'Payment method to be confirmed on WhatsApp',
      summary: 'Order summary',
      checkout_notice: 'Your order is not confirmed until our team verifies product availability, delivery charges and delivery timing.',
      send_order: 'Send Order on WhatsApp',
      e_name: 'Please enter your full name.',
      e_phone: 'Please enter a valid Pakistani mobile number (example: 0300 1234567).',
      e_area: 'Please select a delivery area.',
      e_address: 'Please enter your complete address (at least 10 characters).',
      e_payment: 'Please choose a payment method.',
      e_cart_empty: 'Your cart is empty.',
      e_unavailable: 'Your cart has a product that is no longer available. Please remove it.',
      e_min: 'The minimum order is {min}. Please add more products.',
      e_wa_config: 'The store WhatsApp number is not set up yet, so orders cannot be sent right now. (Owner: edit WHATSAPP_NUMBER in products.js.)',
      e_fix: 'Please fix the highlighted fields.',
      adjusted: 'Quantity of {name} was adjusted to available stock.',
      stock_limit: 'That is the maximum available quantity for this product.',
      sent_title: 'Finish in WhatsApp',
      sent_text: 'Your order message is ready. Review it in WhatsApp and press Send. Our team does not receive it until you send it, and your order is not confirmed until our team verifies availability, delivery charges and timing.',
      sent_ref: 'Order reference:',
      sent_open: 'Open WhatsApp again',
      sent_popup: 'If WhatsApp did not open by itself, tap the button below.',
      sent_back: 'Continue shopping',
      clear_cart: 'Start a new order (clear cart)',
      dec: 'Decrease quantity', inc: 'Increase quantity', remove: 'Remove',
      view_cart: 'View cart', open_menu: 'Open menu', close_menu: 'Close menu', close: 'Close', open_cart: 'Open cart',
      cart_label: 'Open cart, {n} items',
      m_title: 'NEW MELTORA ORDER', m_ref: 'Order ref', m_date: 'Date', m_lang: 'Customer language', m_lang_val: 'English',
      m_customer: 'CUSTOMER', m_name: 'Name', m_phone: 'Phone', m_area: 'Area', m_address: 'Address', m_notes: 'Notes',
      m_items: 'ITEMS', m_subtotal: 'Subtotal', m_delivery: 'Delivery fee', m_total: 'TOTAL', m_payment: 'Payment',
      m_footer: 'Please confirm availability, delivery charges and delivery timing.',
      m_free: 'Free'
    },
    ur: {
      title: 'میلٹورا | کراچی میں چیڈر اور موزریلا پنیر',
      meta_desc: 'میلٹورا پیزا، برگر، سینڈوچ اور گھر کی ڈشز کے لیے چیڈر اور موزریلا پنیر پیش کرتا ہے۔ کراچی کے منتخب علاقوں میں واٹس ایپ پر آرڈر کریں۔',
      skip: 'مصنوعات پر جائیں',
      nav_home: 'ہوم', nav_shop: 'شاپ', nav_about: 'ہمارے بارے میں', nav_delivery: 'ڈیلیوری کی معلومات', nav_contact: 'رابطہ',
      switch_lang: 'زبان تبدیل کریں',
      hero_eyebrow: 'خوشیوں میں گھل جائیں۔',
      hero_title: 'ہر نوالے میں مزید پنیر۔',
      hero_text: 'ہر نوالے میں مزید ذائقہ! پیزا، برگر، سینڈوچ اور گھر کی پسندیدہ ڈشز کے لیے چیڈر اور موزریلا منتخب کریں۔',
      hero_cta1: 'پنیر خریدیں', hero_cta2: 'مصنوعات دیکھیں',
      hero_note: 'آرڈر واٹس ایپ کے ذریعے کیے جاتے ہیں۔',
      hero_alt: 'تازہ بیک کیے گئے پیزا پر پگھلا ہوا پنیر',
      cat_title: 'زمرے کے مطابق خریداری',
      cat_all: 'سب', cat_cheddar: 'چیڈر پنیر', cat_mozzarella: 'موزریلا پنیر', cat_combo: 'کومبو ڈیلز',
      shop_title: 'ہمارا پنیر',
      shop_empty: 'فی الحال دکھانے کے لیے کوئی پروڈکٹ موجود نہیں۔',
      shop_note: 'قیمتیں پاکستانی روپے (Rs.) میں ہیں۔ مکمل تفصیلات کے لیے براہ کرم پروڈکٹ کا لیبل دیکھیں۔',
      add_to_cart: 'کارٹ میں شامل کریں', out_of_stock: 'اسٹاک ختم', sale: 'سیل', added: 'کارٹ میں شامل ہو گیا',
      about_title: 'میلٹورا کے بارے میں',
      about_p1: 'میلٹورا ایک پنیر برانڈ ہے جو گھر پر اچھے کھانے سے محبت کرنے والوں کے لیے بنایا گیا ہے۔ ہم پیزا نائٹ، برگر، سینڈوچ اور روزمرہ کھانوں کے لیے چیڈر اور موزریلا مناسب پیک سائز میں پیش کرتے ہیں۔',
      about_p2: 'ہم کراچی میں ابھی آغاز کر رہے ہیں اور آرڈر کا طریقہ سادہ رکھتے ہیں: اپنا پنیر منتخب کریں، واٹس ایپ پر آرڈر بھیجیں اور ہماری ٹیم آپ سے تفصیلات کی تصدیق کرے گی۔',
      del_title: 'ڈیلیوری کی معلومات',
      del_area_h: 'سروس ایریا', del_area_t: 'کراچی کے منتخب علاقے۔',
      del_fee_h: 'ڈیلیوری فیس', del_fee_text: '{fee} فی آرڈر۔ حتمی چارجز ہماری ٹیم تصدیق کرے گی۔',
      del_free_over: ' {amount} یا اس سے زیادہ کے آرڈر پر ڈیلیوری مفت ہے۔',
      del_min_h: 'کم از کم آرڈر', del_min_text: 'کم از کم آرڈر کی مالیت {min} ہے۔',
      del_time_h: 'ڈیلیوری کا وقت', del_handling_h: 'ہینڈلنگ',
      del_confirm_h: 'کیا میرا علاقہ شامل ہے؟',
      del_confirm_t: 'چیک آؤٹ پر اپنا علاقہ منتخب کریں۔ اگر آپ کا علاقہ فہرست میں نہیں ہے تو واٹس ایپ پر پیغام بھیجیں، ہم بتائیں گے کہ ڈیلیوری ممکن ہے یا نہیں۔',
      del_areas_h: 'فی الحال درج علاقے',
      faq_title: 'اکثر پوچھے گئے سوالات', faq_title_short: 'سوالات',
      faq1_q: 'چیڈر اور موزریلا میں کیا فرق ہے؟',
      faq1_a: 'چیڈر ایک سخت پنیر ہے جس کا ذائقہ گہرا اور تیز ہوتا ہے، اور یہ برگر، سینڈوچ اور کدوکش کرنے کے لیے موزوں ہے۔ موزریلا ہلکے ذائقے کا ہوتا ہے اور پگھلنے پر کھنچتا ہے، اسی لیے پیزا اور بیکڈ پاستا میں مقبول ہے۔',
      faq2_q: 'پیزا کے لیے کون سا پنیر موزوں ہے؟',
      faq2_a: 'پیزا کے لیے موزریلا روایتی انتخاب ہے کیونکہ یہ اچھی طرح پگھلتا اور کھنچتا ہے۔ بہت سے لوگ زیادہ ذائقے کے لیے تھوڑا چیڈر بھی ملا لیتے ہیں۔',
      faq3_q: 'میں آرڈر کیسے کروں؟',
      faq3_a: 'مصنوعات کارٹ میں شامل کریں، “چیک آؤٹ پر جائیں” دبائیں، ڈیلیوری کی تفصیلات بھریں اور تیار شدہ پیغام واٹس ایپ پر بھیج دیں۔ آپ کا آرڈر ہماری ٹیم کے جواب کے بعد ہی کنفرم ہوگا۔',
      faq4_q: 'آپ کن علاقوں میں ڈیلیوری کرتے ہیں؟',
      faq4_a: 'ہم فی الحال کراچی کے منتخب علاقوں میں ڈیلیوری کرتے ہیں۔ درج علاقے ڈیلیوری کی معلومات کے سیکشن میں دیکھیں، یا اپنا علاقہ چیک کرنے کے لیے واٹس ایپ پر پیغام بھیجیں۔',
      faq5_q: 'ادائیگی کے کون سے طریقے دستیاب ہیں؟',
      pay_faq_cod: 'کیش آن ڈیلیوری فراہم کی جاتی ہے، جو ہماری ٹیم کی تصدیق سے مشروط ہے۔ دیگر ادائیگی کے طریقے: [تصدیق ہونا باقی]۔',
      pay_faq_none: '[ادائیگی کے طریقے ہماری ٹیم واٹس ایپ پر بتائے گی۔]',
      faq6_q: 'پنیر کو کیسے محفوظ رکھا جائے؟',
      faq6_a: 'براہ کرم پروڈکٹ کے لیبل پر درج ہدایات پر عمل کریں۔ پنیر عموماً فریج میں رکھا جاتا ہے، لیکن آپ کے پیک کے لیے حتمی رہنمائی لیبل ہی ہے۔',
      faq7_q: 'کسٹمر سپورٹ سے کیسے رابطہ کروں؟',
      faq7_a: 'اس صفحے پر موجود بٹن سے ہمیں واٹس ایپ پر پیغام بھیجیں، ہماری ٹیم آپ کی مدد کرے گی۔',
      contact_title: 'ہم سے رابطہ کریں',
      contact_text: 'مصنوعات یا ڈیلیوری کے بارے میں سوال ہے؟ ہمیں واٹس ایپ پر پیغام بھیجیں۔',
      whatsapp_btn: 'واٹس ایپ پر چیٹ کریں',
      wa_greeting: 'Hello Meltora, I have a question. / السلام علیکم! مجھے میلٹورا کے بارے میں ایک سوال ہے۔',
      c_phone: 'فون', c_email: 'ای میل', c_hours: 'اوقات', c_instagram: 'انسٹاگرام', c_facebook: 'فیس بک',
      privacy_title: 'پرائیویسی نوٹس',
      privacy_text: 'یہ ویب سائٹ آپ کی معلومات کسی سرور کو نہیں بھیجتی۔ آپ کا کارٹ اور زبان کا انتخاب صرف آپ کے اپنے براؤزر میں محفوظ ہوتا ہے۔ چیک آؤٹ پر آپ جو تفصیلات لکھتے ہیں وہ واٹس ایپ پیغام میں شامل ہو جاتی ہیں جسے آپ خود دیکھ کر بھیجتے ہیں۔ ہم انہیں صرف آپ کا آرڈر پورا کرنے کے لیے استعمال کرتے ہیں۔',
      terms_title: 'شرائط و ضوابط',
      terms_text: 'اس ویب سائٹ کے ذریعے بھیجے گئے آرڈر صرف درخواست ہیں۔ آرڈر اس وقت کنفرم ہوتا ہے جب ہماری ٹیم مصنوعات کی دستیابی، ڈیلیوری چارجز اور ڈیلیوری کے وقت کی تصدیق کر لے۔ قیمتیں اور دستیابی تبدیل ہو سکتی ہیں۔ [یہاں اپنی واپسی، رقم کی واپسی اور منسوخی کی پالیسی لکھیں۔]',
      footer_links: 'فوری لنکس', footer_delivery_h: 'ڈیلیوری',
      footer_social_note: 'ہماری تازہ ترین اپڈیٹس کے لیے انسٹاگرام پر فالو کریں۔',
      rights: 'جملہ حقوق محفوظ ہیں۔',
      cart_title: 'آپ کا کارٹ', checkout_title: 'چیک آؤٹ',
      cart_empty: 'آپ کا کارٹ خالی ہے۔ اپنی پسند کا پنیر منتخب کریں!',
      back_shop: 'خریداری پر واپس جائیں',
      each: 'فی عدد',
      subtotal: 'سب ٹوٹل', delivery: 'ڈیلیوری فیس', total: 'کل رقم', free: 'مفت',
      cart_wa_note: 'فی الحال چیک آؤٹ واٹس ایپ کے ذریعے ہوتا ہے۔ آپ کا آرڈر اس وقت تک کنفرم نہیں ہوتا جب تک ہماری ٹیم دستیابی اور ڈیلیوری کی تصدیق نہ کر دے۔',
      proceed: 'چیک آؤٹ پر جائیں',
      back_to_cart: '← کارٹ پر واپس',
      f_name: 'پورا نام', f_phone: 'موبائل نمبر', f_area: 'ڈیلیوری ایریا', f_area_ph: 'اپنا علاقہ منتخب کریں',
      f_address: 'مکمل ڈیلیوری ایڈریس', f_notes: 'ڈیلیوری ہدایات (اختیاری)', f_payment: 'ادائیگی کا طریقہ',
      hint_area: 'آپ کا علاقہ درج نہیں؟ پہلے واٹس ایپ پر ہم سے پوچھ لیں۔',
      pay_cod: 'کیش آن ڈیلیوری (ہماری ٹیم کی تصدیق سے مشروط)',
      pay_confirm: 'ادائیگی کا طریقہ واٹس ایپ پر طے کیا جائے گا',
      summary: 'آرڈر کا خلاصہ',
      checkout_notice: 'آپ کا آرڈر ہماری ٹیم کی جانب سے مصنوعات کی دستیابی، ڈیلیوری چارجز اور وقت کی تصدیق کے بعد کنفرم ہوگا۔',
      send_order: 'واٹس ایپ پر آرڈر بھیجیں',
      e_name: 'براہ کرم اپنا پورا نام لکھیں۔',
      e_phone: 'براہ کرم درست پاکستانی موبائل نمبر لکھیں (مثال: 0300 1234567)۔',
      e_area: 'براہ کرم ڈیلیوری ایریا منتخب کریں۔',
      e_address: 'براہ کرم مکمل ایڈریس لکھیں (کم از کم 10 حروف)۔',
      e_payment: 'براہ کرم ادائیگی کا طریقہ منتخب کریں۔',
      e_cart_empty: 'آپ کا کارٹ خالی ہے۔',
      e_unavailable: 'کارٹ میں ایسی پروڈکٹ ہے جو اب دستیاب نہیں۔ براہ کرم اسے ہٹا دیں۔',
      e_min: 'کم از کم آرڈر {min} ہے۔ براہ کرم مزید مصنوعات شامل کریں۔',
      e_wa_config: 'اسٹور کا واٹس ایپ نمبر ابھی سیٹ نہیں ہوا، اس لیے فی الحال آرڈر نہیں بھیجا جا سکتا۔ (مالک: products.js میں WHATSAPP_NUMBER تبدیل کریں۔)',
      e_fix: 'براہ کرم نمایاں کی گئی غلطیاں درست کریں۔',
      adjusted: '{name} کی مقدار دستیاب اسٹاک کے مطابق کر دی گئی ہے۔',
      stock_limit: 'اس پروڈکٹ کی دستیاب مقدار اتنی ہی ہے۔',
      sent_title: 'واٹس ایپ میں آرڈر مکمل کریں',
      sent_text: 'آپ کے آرڈر کا پیغام تیار ہے۔ واٹس ایپ میں اسے دیکھیں اور بھیجیں دبائیں۔ جب تک آپ پیغام نہ بھیجیں ہماری ٹیم کو نہیں ملتا، اور آرڈر ہماری ٹیم کی جانب سے دستیابی، ڈیلیوری چارجز اور وقت کی تصدیق کے بعد ہی کنفرم ہوگا۔',
      sent_ref: 'آرڈر ریفرنس:',
      sent_open: 'واٹس ایپ دوبارہ کھولیں',
      sent_popup: 'اگر واٹس ایپ خود نہیں کھلا تو نیچے دیا گیا بٹن دبائیں۔',
      sent_back: 'خریداری جاری رکھیں',
      clear_cart: 'نیا آرڈر شروع کریں (کارٹ خالی کریں)',
      dec: 'مقدار کم کریں', inc: 'مقدار بڑھائیں', remove: 'ہٹائیں',
      view_cart: 'کارٹ دیکھیں', open_menu: 'مینو کھولیں', close_menu: 'مینو بند کریں', close: 'بند کریں', open_cart: 'کارٹ کھولیں',
      cart_label: 'کارٹ کھولیں، {n} آئٹم',
      m_title: 'NEW MELTORA ORDER', m_ref: 'Order ref', m_date: 'Date', m_lang: 'Customer language', m_lang_val: 'Urdu (اردو)',
      m_customer: 'CUSTOMER', m_name: 'Name', m_phone: 'Phone', m_area: 'Area', m_address: 'Address', m_notes: 'Notes',
      m_items: 'ITEMS', m_subtotal: 'Subtotal', m_delivery: 'Delivery fee', m_total: 'TOTAL', m_payment: 'Payment',
      m_footer: 'Please confirm availability, delivery charges and delivery timing.',
      m_free: 'Free'
    }
  };

  /* ------------------------------------------------------------------
     3. SMALL HELPERS
     ------------------------------------------------------------------ */
  var LS_CART = 'meltora_cart_v1';
  var LS_LANG = 'meltora_lang_v1';

  function $(id) { return document.getElementById(id); }

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* storage blocked: ignore */ }
  }

  var lang = 'en';
  (function initLang() {
    var saved = storageGet(LS_LANG);
    if (saved === 'en' || saved === 'ur') { lang = saved; return; }
    lang = CFG.defaultLanguage === 'ur' ? 'ur' : 'en';
  })();

  function tr(key) {
    var d = I18N[lang];
    if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    return Object.prototype.hasOwnProperty.call(I18N.en, key) ? I18N.en[key] : '';
  }
  function trf(key, vars) {
    return tr(key).replace(/\{(\w+)\}/g, function (m, k) {
      return vars && vars[k] !== undefined ? vars[k] : m;
    });
  }
  /* pick the text for the current language from {en, ur} (or a plain string) */
  function pick(obj) {
    if (typeof obj === 'string') return obj;
    if (!obj || typeof obj !== 'object') return '';
    return obj[lang] || obj.en || obj.ur || '';
  }
  /* English-only text for the WhatsApp message (so the business reads it easily) */
  function pickEn(obj) {
    if (typeof obj === 'string') return obj;
    if (!obj || typeof obj !== 'object') return '';
    return obj.en || obj.ur || '';
  }

  function money(n) { return CURRENCY + ' ' + Number(n).toLocaleString('en-US'); }

  function el(tag, props, children) {
    var node = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else if (v === true) node.setAttribute(k, '');
        else if (v !== false && v !== null && v !== undefined) node.setAttribute(k, v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  /* Latin text/numbers stay left-to-right inside Urdu; Urdu words (like "200 گرام") flow naturally. */
  function numSpan(text) { return el('span', { class: /[\u0600-\u06FF]/.test(String(text)) ? 'iso' : 'num', text: text }); }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function cleanText(s) {
    return String(s || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function safeUrl(u) {
    if (typeof u !== 'string' || !u.trim()) return '';
    try {
      var parsed = new URL(u.trim());
      return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
    } catch (e) { return ''; }
  }

  var toastTimer = null;
  function toast(msg) {
    var node = $('toast');
    node.textContent = msg;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.hidden = true; }, 2600);
  }

  /* ------------------------------------------------------------------
     4. WHATSAPP CONFIG CHECK
     ------------------------------------------------------------------ */
  function waNumber() {
    var n = String(CFG.WHATSAPP_NUMBER || '').trim();
    return /^[1-9]\d{9,14}$/.test(n) ? n : '';
  }
  function waConfigured() { return waNumber() !== ''; }
  function waUrl(text) {
    return 'https://wa.me/' + waNumber() + '?text=' + encodeURIComponent(text);
  }
  function openWhatsApp(url) {
    var w = null;
    try { w = window.open(url, '_blank'); } catch (e) { w = null; }
    if (w) { try { w.opener = null; } catch (e2) { /* ignore */ } }
    return !!w;
  }

  /* ------------------------------------------------------------------
     5. CART STATE
     ------------------------------------------------------------------ */
  var cart = Object.create(null);
  var pendingNotices = [];

  function loadCart() {
    cart = Object.create(null);
    var raw = storageGet(LS_CART);
    if (!raw) return;
    try {
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) return;
      Object.keys(data).forEach(function (id) {
        if (!BY_ID.has(id)) return;
        var q = Math.floor(Number(data[id]));
        if (isFinite(q) && q >= 1) cart[id] = Math.min(q, MAX_QTY);
      });
    } catch (e) { cart = Object.create(null); }
  }
  function saveCart() {
    var plain = {};
    Object.keys(cart).forEach(function (id) { plain[id] = cart[id]; });
    storageSet(LS_CART, JSON.stringify(plain)); // only IDs + quantities are stored, never prices
  }

  /* Rebuild the cart from CURRENT products.js data (never trust saved prices). */
  function compute() {
    var lines = [];
    var subtotal = 0;
    var count = 0;
    var hasUnavailable = false;

    PRODUCTS.forEach(function (p) {
      var qty = cart[p.id];
      if (!qty) return;
      var line = { product: p, qty: qty, unavailable: false, unit: unitPrice(p), total: 0 };
      if (!isAvailable(p)) {
        line.unavailable = true;
        hasUnavailable = true;
      } else {
        var max = maxFor(p);
        if (qty > max) {
          qty = max;
          cart[p.id] = qty;
          line.qty = qty;
          pendingNotices.push(trf('adjusted', { name: pick(p.name) + ' ' + pick(p.weight) }));
        }
        line.total = line.unit * qty;
        subtotal += line.total;
      }
      count += qty;
      lines.push(line);
    });

    var activeLines = lines.filter(function (l) { return !l.unavailable; });
    var fee = 0;
    if (subtotal > 0) fee = FREE_ABOVE > 0 && subtotal >= FREE_ABOVE ? 0 : FEE;
    var belowMin = MIN_ORDER > 0 && subtotal > 0 && subtotal < MIN_ORDER;

    return {
      lines: lines,
      activeLines: activeLines,
      subtotal: subtotal,
      fee: fee,
      total: subtotal + fee,
      count: count,
      hasUnavailable: hasUnavailable,
      belowMin: belowMin,
      canCheckout: activeLines.length > 0 && !hasUnavailable && !belowMin
    };
  }

  /* ------------------------------------------------------------------
     6. RENDER: STATIC TEXT, HEADER, FOOTER, DELIVERY, CONTACT
     ------------------------------------------------------------------ */
  function applyStaticText() {
    var root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
    document.title = tr('title');
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', tr('meta_desc'));

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var s = tr(node.getAttribute('data-i18n'));
      if (s) node.textContent = s;
    });

    $('langToggle').textContent = lang === 'ur' ? 'English' : 'اردو';
    $('langToggle').setAttribute('lang', lang === 'ur' ? 'en' : 'ur');
    $('langToggle').setAttribute('aria-label', tr('switch_lang'));
    $('heroImg').setAttribute('alt', tr('hero_alt'));
    $('drawerClose').setAttribute('aria-label', tr('close'));
    updateMenuLabel();

    // announcement
    var ann = $('announcement');
    var annText = pick(ANN);
    if (ANN.show !== false && annText) {
      $('announcementText').textContent = annText;
      ann.hidden = false;
    } else {
      ann.hidden = true;
    }

    // footer tagline + year
    $('footerTagline').textContent = pick(CFG.tagline) || tr('hero_eyebrow');
    $('year').textContent = String(new Date().getFullYear());
  }

  function renderDeliverySection() {
    var feeText = trf('del_fee_text', { fee: money(FEE) });
    if (FREE_ABOVE > 0) feeText += trf('del_free_over', { amount: money(FREE_ABOVE) });
    if (FEE === 0) feeText = tr('free') + '.';
    $('delFee').textContent = feeText;

    $('delMinRow').hidden = MIN_ORDER <= 0;
    if (MIN_ORDER > 0) $('delMin').textContent = trf('del_min_text', { min: money(MIN_ORDER) });

    $('delTiming').textContent = pick(DEL.timing);
    $('delHandling').textContent = pick(DEL.handling);

    var chips = $('areaChips');
    clear(chips);
    AREAS.forEach(function (a) { chips.appendChild(el('li', { text: pick(a) })); });

    $('faq5Answer').textContent = COD_ON ? tr('pay_faq_cod') : tr('pay_faq_none');
  }

  function renderContact() {
    var list = $('contactList');
    clear(list);
    var items = [];
    var phone = cleanText(CONTACT.phoneDisplay);
    if (phone) {
      var digits = phone.replace(/[^\d+]/g, '');
      items.push(el('li', null, [tr('c_phone') + ': ', el('a', { href: 'tel:' + digits, dir: 'ltr' , text: phone })]));
    }
    var email = cleanText(CONTACT.email);
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      items.push(el('li', null, [tr('c_email') + ': ', el('a', { href: 'mailto:' + email, text: email })]));
    }
    var hours = pick(CONTACT.hoursText);
    if (hours) items.push(el('li', { text: tr('c_hours') + ': ' + hours }));
    var ig = safeUrl(CONTACT.instagramUrl);
    if (ig) items.push(el('li', null, [el('a', { href: ig, target: '_blank', rel: 'noopener noreferrer', text: tr('c_instagram') })]));
    var fb = safeUrl(CONTACT.facebookUrl);
    if (fb) items.push(el('li', null, [el('a', { href: fb, target: '_blank', rel: 'noopener noreferrer', text: tr('c_facebook') })]));
    items.forEach(function (i) { list.appendChild(i); });

    // footer Instagram link + note (shown only when a real URL is configured)
    var fi = $('footerInstagram');
    var note = $('footerSocialNote');
    if (ig) {
      $('footerInstagramLink').setAttribute('href', ig);
      $('footerInstagramLink').textContent = tr('c_instagram');
      fi.hidden = false;
      note.hidden = false;
    } else {
      fi.hidden = true;
      note.hidden = true;
    }
  }

  /* ------------------------------------------------------------------
     7. RENDER: CATEGORIES, FILTERS, PRODUCTS
     ------------------------------------------------------------------ */
  var CATEGORIES = [
    { id: 'cheddar', emoji: '🧀', key: 'cat_cheddar' },
    { id: 'mozzarella', emoji: '🍕', key: 'cat_mozzarella' },
    { id: 'combo', emoji: '🎁', key: 'cat_combo' }
  ];
  var filter = 'all';

  function visibleCategories() {
    return CATEGORIES.filter(function (c) {
      return PRODUCTS.some(function (p) { return p.category === c.id; });
    });
  }

  function renderCategories() {
    var grid = $('categoryGrid');
    clear(grid);
    visibleCategories().forEach(function (c) {
      grid.appendChild(el('button', {
        type: 'button', class: 'category-card',
        'aria-pressed': filter === c.id ? 'true' : 'false',
        dataset: { cat: c.id }
      }, [el('span', { class: 'emoji', 'aria-hidden': 'true', text: c.emoji }), el('span', { text: tr(c.key) })]));
    });
  }

  function renderFilters() {
    var bar = $('filterBar');
    clear(bar);
    var cats = visibleCategories();
    if (cats.length < 2) { bar.hidden = true; return; }
    bar.hidden = false;
    bar.appendChild(el('button', { type: 'button', class: 'chip-btn', 'aria-pressed': filter === 'all' ? 'true' : 'false', dataset: { cat: 'all' }, text: tr('cat_all') }));
    cats.forEach(function (c) {
      bar.appendChild(el('button', { type: 'button', class: 'chip-btn', 'aria-pressed': filter === c.id ? 'true' : 'false', dataset: { cat: c.id }, text: tr(c.key) }));
    });
  }

  function attachImage(media, src, alt) {
    var fallback = el('div', { class: 'img-fallback', 'aria-hidden': 'true' }, [el('span', { text: '🧀' })]);
    media.appendChild(fallback);
    if (!src) { media.classList.add('no-img'); return; }
    var img = document.createElement('img');
    img.addEventListener('error', function () { media.classList.add('no-img'); });
    img.setAttribute('alt', alt);
    img.setAttribute('loading', 'lazy');
    img.setAttribute('decoding', 'async');
    img.setAttribute('width', '600');
    img.setAttribute('height', '450');
    img.src = src;
    media.appendChild(img);
  }

  function productCard(p) {
    var avail = isAvailable(p);
    var nameText = pick(p.name);
    var weightText = pick(p.weight);

    var media = el('div', { class: 'product-media' });
    attachImage(media, p.image, nameText + ' ' + weightText);
    if (!avail) media.appendChild(el('span', { class: 'badge sold', text: tr('out_of_stock') }));
    else if (p.salePrice !== null) media.appendChild(el('span', { class: 'badge', text: tr('sale') }));

    var priceRow = el('div', { class: 'price-row' }, [
      el('span', { class: 'price num', text: money(unitPrice(p)) })
    ]);
    if (p.salePrice !== null) priceRow.appendChild(el('span', { class: 'price-old num', text: money(p.price) }));

    var btn = el('button', {
      type: 'button', class: 'btn ' + (avail ? 'btn-primary' : 'btn-outline'),
      dataset: { add: p.id }, text: avail ? tr('add_to_cart') : tr('out_of_stock')
    });
    if (!avail) { btn.disabled = true; btn.setAttribute('aria-disabled', 'true'); }

    return el('article', { class: 'product-card' }, [
      media,
      el('div', { class: 'product-body' }, [
        el('h3', { text: nameText }),
        el('span', { class: 'weight ' + (/[\u0600-\u06FF]/.test(weightText) ? 'iso' : 'num'), text: weightText }),
        el('p', { class: 'product-desc', text: pick(p.description) }),
        priceRow,
        btn
      ])
    ]);
  }

  function renderProducts() {
    var grid = $('productGrid');
    clear(grid);
    var shown = PRODUCTS.filter(function (p) { return filter === 'all' || p.category === filter; });
    shown.forEach(function (p) { grid.appendChild(productCard(p)); });
    $('shopEmpty').hidden = shown.length > 0;
  }

  function setFilter(id) {
    var valid = id === 'all' || visibleCategories().some(function (c) { return c.id === id; });
    filter = valid ? id : 'all';
    renderCategories();
    renderFilters();
    renderProducts();
  }

  /* ------------------------------------------------------------------
     8. RENDER: CART, SUMMARY, BADGES
     ------------------------------------------------------------------ */
  function renderBadges(c) {
    $('cartCount').textContent = String(c.count);
    $('cartButton').setAttribute('aria-label', trf('cart_label', { n: c.count }));
    var sticky = $('stickyCart');
    if (c.count > 0 && !drawerOpen) {
      $('stickyCartLabel').textContent = tr('view_cart') + ' (' + c.count + ')';
      $('stickyCartTotal').textContent = money(c.total);
      sticky.hidden = false;
    } else {
      sticky.hidden = true;
    }
  }

  function renderCart(c) {
    var empty = c.lines.length === 0;
    $('cartEmpty').hidden = !empty;
    $('cartFilled').hidden = empty;
    $('cartEmptyText').textContent = tr('cart_empty');
    $('cartEmptyBtn').textContent = tr('back_shop');
    if (empty) return;

    var list = $('cartItems');
    clear(list);
    c.lines.forEach(function (l) {
      var p = l.product;
      var top = el('div', { class: 'ci-top' }, [
        el('div', null, [
          el('div', { class: 'ci-name', text: pick(p.name) }),
          el('div', { class: 'ci-meta' }, [numSpan(pick(p.weight)), ' · ', numSpan(money(l.unit)), ' ' + tr('each')])
        ]),
        el('div', { class: 'line-total num', text: l.unavailable ? tr('out_of_stock') : money(l.total) })
      ]);

      var dec = el('button', { type: 'button', 'aria-label': tr('dec'), dataset: { act: 'dec', id: p.id }, text: '−' });
      if (l.qty <= 1 || l.unavailable) dec.disabled = true;
      var inc = el('button', { type: 'button', 'aria-label': tr('inc'), dataset: { act: 'inc', id: p.id }, text: '+' });
      if (l.unavailable || l.qty >= maxFor(p)) inc.disabled = true;

      var qty = el('div', { class: 'qty', role: 'group', 'aria-label': pick(p.name) + ' ' + pick(p.weight) }, [
        dec, el('output', { text: String(l.qty) }), inc
      ]);
      var bottom = el('div', { class: 'ci-bottom' }, [
        qty,
        el('button', { type: 'button', class: 'remove-btn', dataset: { act: 'remove', id: p.id }, text: tr('remove') })
      ]);
      list.appendChild(el('li', { class: 'cart-item' }, [top, bottom]));
    });

    // notices
    var notices = $('cartNotices');
    clear(notices);
    pendingNotices.splice(0).forEach(function (m) { notices.appendChild(el('p', { class: 'warning-box', text: m })); });
    if (c.hasUnavailable) notices.appendChild(el('p', { class: 'warning-box', text: tr('e_unavailable') }));
    if (c.belowMin) notices.appendChild(el('p', { class: 'warning-box', text: trf('e_min', { min: money(MIN_ORDER) }) }));

    // totals
    $('lblSubtotal').textContent = tr('subtotal');
    $('lblDelivery').textContent = tr('delivery');
    $('lblTotal').textContent = tr('total');
    $('valSubtotal').textContent = money(c.subtotal);
    $('valDelivery').textContent = c.fee === 0 ? tr('free') : money(c.fee);
    $('valTotal').textContent = money(c.total);
    ['valSubtotal', 'valDelivery', 'valTotal'].forEach(function (id) { $(id).classList.add('num'); });

    $('cartWhatsappNote').textContent = tr('cart_wa_note');
    var btn = $('checkoutBtn');
    btn.textContent = tr('proceed');
    btn.disabled = !c.canCheckout;
  }

  function renderSummary(c) {
    $('summaryTitle').textContent = tr('summary');
    var ul = $('summaryItems');
    clear(ul);
    c.activeLines.forEach(function (l) {
      ul.appendChild(el('li', null, [
        el('span', null, [pick(l.product.name) + ' ', numSpan(pick(l.product.weight)), ' × ', numSpan(String(l.qty))]),
        numSpan(money(l.total))
      ]));
    });
    $('slSubtotal').textContent = tr('subtotal');
    $('slDelivery').textContent = tr('delivery');
    $('slTotal').textContent = tr('total');
    $('svSubtotal').textContent = money(c.subtotal);
    $('svDelivery').textContent = c.fee === 0 ? tr('free') : money(c.fee);
    $('svTotal').textContent = money(c.total);
    ['svSubtotal', 'svDelivery', 'svTotal'].forEach(function (id) { $(id).classList.add('num'); });
  }

  /* ------------------------------------------------------------------
     9. CHECKOUT FORM LABELS, OPTIONS, VALIDATION
     ------------------------------------------------------------------ */
  function renderCheckoutLabels() {
    $('backToCart').textContent = tr('back_to_cart');
    $('lblName').textContent = tr('f_name');
    $('lblPhone').textContent = tr('f_phone');
    $('lblArea').textContent = tr('f_area');
    $('lblAddress').textContent = tr('f_address');
    $('lblNotes').textContent = tr('f_notes');
    $('lblPayment').textContent = tr('f_payment');
    $('hintArea').textContent = tr('hint_area');
    $('checkoutNotice').textContent = tr('checkout_notice');
    $('sendOrderBtn').textContent = tr('send_order');

    // delivery area options (keep current selection)
    var sel = $('custArea');
    var prev = sel.value;
    clear(sel);
    sel.appendChild(el('option', { value: '', text: tr('f_area_ph') }));
    AREAS.forEach(function (a, i) { sel.appendChild(el('option', { value: String(i), text: pick(a) })); });
    if (prev !== '' && Number(prev) < AREAS.length) sel.value = prev;

    // payment options (keep current selection)
    var box = $('paymentOptions');
    var checked = box.querySelector('input:checked');
    var prevPay = checked ? checked.value : '';
    clear(box);
    var methods = COD_ON ? [{ id: 'cod', key: 'pay_cod' }] : [{ id: 'confirm', key: 'pay_confirm' }];
    methods.forEach(function (m, i) {
      var input = el('input', { type: 'radio', name: 'payment', id: 'pay_' + m.id, value: m.id });
      if (m.id === prevPay || (methods.length === 1 && !prevPay)) input.checked = true;
      box.appendChild(el('label', { class: 'radio', for: 'pay_' + m.id }, [input, el('span', { text: tr(m.key) })]));
    });

    // WhatsApp configuration warning
    var warn = $('configWarning');
    if (waConfigured()) { warn.hidden = true; }
    else { warn.textContent = tr('e_wa_config'); warn.hidden = false; }
  }

  function setFieldError(inputId, errId, msg) {
    var err = $(errId);
    err.textContent = msg || '';
    var field = $(inputId) ? $(inputId).closest('.field') : err.closest('.field');
    if (field) field.classList.toggle('invalid', !!msg);
    var input = $(inputId);
    if (input) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
  }
  function clearErrors() {
    setFieldError('custName', 'errName', '');
    setFieldError('custPhone', 'errPhone', '');
    setFieldError('custArea', 'errArea', '');
    setFieldError('custAddress', 'errAddress', '');
    setFieldError('', 'errPayment', '');
    var fe = $('formError');
    fe.hidden = true; fe.textContent = '';
  }

  /* Returns the 10-digit national number (3XXXXXXXXX) or '' if invalid. */
  function normalizePkMobile(raw) {
    var s = String(raw || '').trim();
    if (/[^\d\s\-+()]/.test(s)) return '';
    var d = s.replace(/\D/g, '');
    if (d.indexOf('0092') === 0) d = d.slice(4);
    else if (d.indexOf('92') === 0 && d.length === 12) d = d.slice(2);
    else if (d.indexOf('0') === 0 && d.length === 11) d = d.slice(1);
    return /^3\d{9}$/.test(d) ? d : '';
  }

  function readForm() {
    var payChecked = $('paymentOptions').querySelector('input:checked');
    return {
      name: cleanText($('custName').value).slice(0, 80),
      phoneRaw: $('custPhone').value,
      areaIndex: $('custArea').value,
      address: cleanText($('custAddress').value).slice(0, 300),
      notes: cleanText($('custNotes').value).slice(0, 200),
      payment: payChecked ? payChecked.value : ''
    };
  }

  function validateForm(data) {
    var errors = {};
    if (data.name.length < 2 || !/[A-Za-z؀-ۿ]/.test(data.name)) errors.name = tr('e_name');
    var national = normalizePkMobile(data.phoneRaw);
    if (!national) errors.phone = tr('e_phone');
    var idx = data.areaIndex === '' ? -1 : Number(data.areaIndex);
    if (!(idx >= 0 && idx < AREAS.length && Math.floor(idx) === idx)) errors.area = tr('e_area');
    if (data.address.length < 10) errors.address = tr('e_address');
    if (data.payment !== 'cod' && data.payment !== 'confirm') errors.payment = tr('e_payment');
    else if (data.payment === 'cod' && !COD_ON) errors.payment = tr('e_payment');
    return { errors: errors, national: national, areaIdx: idx };
  }

  /* ------------------------------------------------------------------
     10. ORDER MESSAGE + WHATSAPP
     ------------------------------------------------------------------ */
  function makeOrderRef() {
    var d = new Date();
    var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var datePart = String(d.getFullYear()).slice(2) + p2(d.getMonth() + 1) + p2(d.getDate());
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var rand = '';
    var bytes = null;
    try {
      if (window.crypto && window.crypto.getRandomValues) {
        bytes = new Uint8Array(4);
        window.crypto.getRandomValues(bytes);
      }
    } catch (e) { bytes = null; }
    for (var i = 0; i < 4; i++) {
      var r = bytes ? bytes[i] : Math.floor(Math.random() * 256);
      rand += alphabet.charAt(r % alphabet.length);
    }
    return 'MEL-' + datePart + '-' + rand;
  }

  function buildMessage(ref, data, v, c) {
    var L = I18N.en; // message is always English so the business can read it easily
    var phoneShown = '0' + v.national.slice(0, 3) + ' ' + v.national.slice(3);
    var lines = [];
    lines.push('*' + L.m_title + '*');
    lines.push(L.m_ref + ': ' + ref);
    lines.push(L.m_date + ': ' + new Date().toLocaleString('en-GB'));
    lines.push(L.m_lang + ': ' + (lang === 'ur' ? I18N.ur.m_lang_val : L.m_lang_val));
    lines.push('');
    lines.push('*' + L.m_customer + '*');
    lines.push(L.m_name + ': ' + data.name);
    lines.push(L.m_phone + ': ' + phoneShown);
    lines.push(L.m_area + ': ' + pickEn(AREAS[v.areaIdx]));
    lines.push(L.m_address + ': ' + data.address);
    if (data.notes) lines.push(L.m_notes + ': ' + data.notes);
    lines.push('');
    lines.push('*' + L.m_items + '*');
    c.activeLines.forEach(function (l, i) {
      lines.push((i + 1) + '. ' + pickEn(l.product.name) + ' ' + pickEn(l.product.weight) + ' x ' + l.qty +
        ' @ ' + money(l.unit) + ' = ' + money(l.total));
    });
    lines.push('');
    lines.push(L.m_subtotal + ': ' + money(c.subtotal));
    lines.push(L.m_delivery + ': ' + (c.fee === 0 ? L.m_free : money(c.fee)));
    lines.push('*' + L.m_total + ': ' + money(c.total) + '*');
    lines.push(L.m_payment + ': ' + (data.payment === 'cod' ? 'Cash on Delivery' : 'To be confirmed on WhatsApp'));
    lines.push('');
    lines.push(L.m_footer);
    return lines.join('\n');
  }

  var submitting = false;
  function onSubmitOrder(e) {
    e.preventDefault();
    if (submitting) return;
    clearErrors();

    var data = readForm();
    var v = validateForm(data);
    var errs = v.errors;
    var firstId = '';
    if (errs.name) { setFieldError('custName', 'errName', errs.name); firstId = firstId || 'custName'; }
    if (errs.phone) { setFieldError('custPhone', 'errPhone', errs.phone); firstId = firstId || 'custPhone'; }
    if (errs.area) { setFieldError('custArea', 'errArea', errs.area); firstId = firstId || 'custArea'; }
    if (errs.address) { setFieldError('custAddress', 'errAddress', errs.address); firstId = firstId || 'custAddress'; }
    if (errs.payment) { setFieldError('', 'errPayment', errs.payment); firstId = firstId || 'pay_' + (COD_ON ? 'cod' : 'confirm'); }
    if (firstId) {
      showFormError(tr('e_fix'));
      var f = $(firstId); if (f) f.focus();
      return;
    }

    // re-validate the cart with the current product configuration
    var c = compute();
    renderAllCartParts(c);
    if (c.lines.length === 0) { showFormError(tr('e_cart_empty')); return; }
    if (c.hasUnavailable) { showFormError(tr('e_unavailable')); return; }
    if (c.belowMin) { showFormError(trf('e_min', { min: money(MIN_ORDER) })); return; }
    if (!c.canCheckout) { showFormError(tr('e_cart_empty')); return; }

    if (!waConfigured()) { showFormError(tr('e_wa_config')); return; }

    submitting = true;
    var ref = makeOrderRef();
    var message = buildMessage(ref, data, v, c);
    var url = waUrl(message);
    var opened = openWhatsApp(url);

    $('sentRef').textContent = ref;
    $('sentLink').setAttribute('href', url);
    $('sentFallback').hidden = opened; // helper text only needed if the pop-up was blocked
    showView('sent');
    setTimeout(function () { submitting = false; }, 1500);
  }

  function showFormError(msg) {
    var fe = $('formError');
    fe.textContent = msg;
    fe.hidden = false;
  }

  /* ------------------------------------------------------------------
     11. DRAWER (cart / checkout / sent)
     ------------------------------------------------------------------ */
  var drawerOpen = false;
  var lastFocus = null;
  var view = 'cart';

  function renderSentLabels() {
    $('sentText').textContent = tr('sent_text');
    $('sentRefLabel').textContent = tr('sent_ref');
    $('sentFallback').textContent = tr('sent_popup');
    $('sentLink').textContent = tr('sent_open');
    $('sentBack').textContent = tr('sent_back');
    $('sentTitle').textContent = tr('sent_title');
    var clr = $('sentClear');
    if (clr) clr.textContent = tr('clear_cart');
  }

  function showView(name) {
    view = name;
    $('cartView').hidden = name !== 'cart';
    $('checkoutForm').hidden = name !== 'checkout';
    $('sentView').hidden = name !== 'sent';
    $('drawerTitle').textContent = name === 'cart' ? tr('cart_title') : (name === 'checkout' ? tr('checkout_title') : tr('sent_title'));
    if (name === 'checkout') { renderCheckoutLabels(); renderSummary(compute()); }
    if (name === 'sent') renderSentLabels();
    $('drawer').querySelector('.drawer-body').scrollTop = 0;
  }

  function openDrawer(name) {
    lastFocus = document.activeElement;
    drawerOpen = true;
    var c = compute();
    renderAllCartParts(c);
    showView(name || 'cart');
    $('overlay').hidden = false;
    $('drawer').classList.add('open');
    $('drawer').setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    renderBadges(c);
    setTimeout(function () { $('drawerClose').focus(); }, 30);
  }

  function closeDrawer() {
    if (!drawerOpen) return;
    drawerOpen = false;
    $('overlay').hidden = true;
    $('drawer').classList.remove('open');
    $('drawer').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    renderBadges(compute());
    if (lastFocus && typeof lastFocus.focus === 'function') { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
  }

  function trapFocus(e) {
    if (!drawerOpen || e.key !== 'Tab') return;
    var nodes = Array.prototype.filter.call(
      $('drawer').querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (n) { return !n.disabled && !n.closest('[hidden]') && n.offsetParent !== null; }
    );
    if (!nodes.length) return;
    var first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ------------------------------------------------------------------
     12. CART ACTIONS
     ------------------------------------------------------------------ */
  function renderAllCartParts(c) {
    c = c || compute();
    renderBadges(c);
    renderCart(c);
    if (view === 'checkout') renderSummary(c);
    saveCart();
  }

  function addToCart(id) {
    var p = BY_ID.get(id);
    if (!p || !isAvailable(p)) return;
    var cur = cart[id] || 0;
    if (cur + 1 > maxFor(p)) { toast(tr('stock_limit')); return; }
    cart[id] = cur + 1;
    renderAllCartParts();
    toast(tr('added') + ': ' + pick(p.name) + ' ' + pick(p.weight));
  }

  function changeQty(id, delta) {
    var p = BY_ID.get(id);
    if (!p || !cart[id]) return;
    var next = cart[id] + delta;
    if (next < 1) return;
    if (next > maxFor(p)) { toast(tr('stock_limit')); return; }
    cart[id] = next;
    renderAllCartParts();
  }

  function removeFromCart(id) {
    if (!cart[id]) return;
    delete cart[id];
    var c = compute();
    renderAllCartParts(c);
    if (c.lines.length === 0 && view === 'checkout') showView('cart');
  }

  /* ------------------------------------------------------------------
     13. MENU, LANGUAGE, EVENTS
     ------------------------------------------------------------------ */
  function updateMenuLabel() {
    var open = $('mainNav').classList.contains('open');
    $('menuToggle').setAttribute('aria-label', open ? tr('close_menu') : tr('open_menu'));
    $('menuToggle').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function setMenu(open) {
    $('mainNav').classList.toggle('open', open);
    updateMenuLabel();
  }

  function renderAll() {
    applyStaticText();
    renderDeliverySection();
    renderContact();
    renderCategories();
    renderFilters();
    renderProducts();
    var c = compute();
    renderAllCartParts(c);
    if (view === 'checkout') { renderCheckoutLabels(); clearErrors(); }
    if (view === 'sent') renderSentLabels();
    $('drawerTitle').textContent = view === 'cart' ? tr('cart_title') : (view === 'checkout' ? tr('checkout_title') : tr('sent_title'));
  }

  function setLanguage(next) {
    lang = next === 'ur' ? 'ur' : 'en';
    storageSet(LS_LANG, lang);
    renderAll();
  }

  function onWhatsAppContact() {
    if (!waConfigured()) { toast(tr('e_wa_config')); return; }
    var opened = openWhatsApp(waUrl(tr('wa_greeting')));
    if (!opened) window.location.href = waUrl(tr('wa_greeting'));
  }

  function init() {
    // hero image fallback (the image may already have failed before this script ran)
    var heroImg = $('heroImg');
    var heroBox = $('heroVisual');
    heroImg.addEventListener('error', function () { heroBox.classList.add('no-img'); });
    if (heroImg.complete && heroImg.naturalWidth === 0) heroBox.classList.add('no-img');

    // extra "clear cart" button on the sent view (created once)
    $('sentView').appendChild(el('button', { type: 'button', class: 'link-btn', id: 'sentClear', text: '' }));

    loadCart();
    renderAll();

    // Product grid / categories / filters (event delegation, attached once)
    $('productGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]');
      if (b && !b.disabled) addToCart(b.getAttribute('data-add'));
    });
    $('categoryGrid').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      setFilter(b.getAttribute('data-cat'));
      $('shop').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    $('filterBar').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (b) setFilter(b.getAttribute('data-cat'));
    });

    // Cart list actions
    $('cartItems').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b || b.disabled) return;
      var id = b.getAttribute('data-id');
      var act = b.getAttribute('data-act');
      if (act === 'inc') changeQty(id, 1);
      else if (act === 'dec') changeQty(id, -1);
      else if (act === 'remove') removeFromCart(id);
    });

    // Drawer open/close + navigation between views
    $('cartButton').addEventListener('click', function () { openDrawer('cart'); });
    $('stickyCart').addEventListener('click', function () { openDrawer('cart'); });
    $('drawerClose').addEventListener('click', closeDrawer);
    $('overlay').addEventListener('click', closeDrawer);
    $('cartEmptyBtn').addEventListener('click', function () {
      closeDrawer();
      $('shop').scrollIntoView({ behavior: 'smooth' });
    });
    $('checkoutBtn').addEventListener('click', function () {
      var c = compute();
      renderAllCartParts(c);
      if (c.canCheckout) { clearErrors(); showView('checkout'); }
    });
    $('backToCart').addEventListener('click', function () { showView('cart'); renderAllCartParts(); });
    $('checkoutForm').addEventListener('submit', onSubmitOrder);
    $('sentBack').addEventListener('click', closeDrawer);
    $('sentView').addEventListener('click', function (e) {
      if (e.target && e.target.id === 'sentClear') {
        cart = Object.create(null);
        renderAllCartParts();
        showView('cart');
        closeDrawer();
      }
    });

    // Clear field errors as the person types
    [['custName', 'errName'], ['custPhone', 'errPhone'], ['custAddress', 'errAddress']].forEach(function (pair) {
      $(pair[0]).addEventListener('input', function () { setFieldError(pair[0], pair[1], ''); });
    });
    $('custArea').addEventListener('change', function () { setFieldError('custArea', 'errArea', ''); });

    // Language + menu
    $('langToggle').addEventListener('click', function () { setLanguage(lang === 'ur' ? 'en' : 'ur'); });
    $('menuToggle').addEventListener('click', function () { setMenu(!$('mainNav').classList.contains('open')); });
    $('mainNav').addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });

    // WhatsApp contact buttons
    document.querySelectorAll('[data-action="whatsapp-contact"]').forEach(function (b) {
      b.addEventListener('click', onWhatsAppContact);
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (drawerOpen) closeDrawer();
        else if ($('mainNav').classList.contains('open')) { setMenu(false); $('menuToggle').focus(); }
      }
      trapFocus(e);
    });

    // Keep the cart in sync if it is changed in another tab
    window.addEventListener('storage', function (e) {
      if (e.key === LS_CART) { loadCart(); renderAllCartParts(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
