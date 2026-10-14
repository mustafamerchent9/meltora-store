# Meltora Store — Beginner Guide (Android friendly)

A complete static cheese store: English + Urdu, cart, checkout, and WhatsApp ordering.
No backend, no database, no paid tools, no build step.

```
meltora-store/
├── index.html      page structure and SEO tags
├── style.css       colours and layout (brand colours are at the top)
├── app.js          cart, language, checkout, WhatsApp logic (you rarely edit this)
├── products.js     ALL settings: WhatsApp number, prices, delivery, areas, links
├── README.md       this guide
└── assets/
    ├── logo.svg    favicon / logo file
    └── images/     your photos go here
```

The header/footer logo is text + a small "M" badge made with HTML/CSS. To use an image later,
open `index.html`, find the comment "Easy to replace" inside `<a class="logo">`, and follow it.

---

## PART 1 — Before you publish: what YOU must change

Everything below is in **`products.js`** unless stated.

| # | What | Where | Notes |
|---|------|-------|-------|
| 1 | **WhatsApp number** | `WHATSAPP_NUMBER: "92XXXXXXXXXX"` | International format, **no + and no leading 0**. Example: 0300 1234567 → `"923001234567"`. Until you change it, checkout shows a warning and will NOT open WhatsApp. |
| 2 | **Prices** | each product's `price:` | All prices are **placeholders** (marked "PLACEHOLDER — change me"). Set your real retail prices. |
| 3 | **Delivery fee** | `delivery.fee` | `250` is a placeholder. |
| 4 | Free delivery / minimum order | `freeDeliveryAbove`, `minimumOrder` | `0` means switched off (default). Only set a number if you really offer it. |
| 5 | **Delivery areas** | `delivery.areas` | The list is an **example**. Delete/rename/add your real areas. |
| 6 | Delivery timing and handling text | `delivery.timing`, `delivery.handling` | Timing is a bracketed placeholder. Write only what is true. |
| 7 | Cash on Delivery | `payments.cashOnDelivery` | `true`/`false`. |
| 8 | Instagram / Facebook / phone / email | `contact` section | Leave `""` to hide. Nothing is invented. |
| 9 | Announcement bar | `announcement` | Set `show: false` to hide. |
| 10 | Product availability / stock | `available: true/false`, `stock: number or null` | `false` = shows "Out of stock" and blocks ordering. |
| 11 | Sale price | `salePrice:` | A number lower than `price`, or `null`. |
| 12 | Photos | `assets/images/` | File names must match the `image:` values, e.g. `cheddar-200g.jpg`, plus `hero.jpg`. Missing photos show a designed placeholder, not a broken image. |
| 13 | Returns / refund policy | `terms_text` in `app.js` | The Terms text has a `[Add your own ... policy here.]` placeholder. Edit it in both the English and Urdu sections. |

Use only photos you own or have the right to use. Do not use another brand's pictures.

### SEO values to replace (in `index.html`)
Search for `YOUR-SITE.pages.dev` and replace it with your real live address (3 places):
1. `<link rel="canonical" ...>`
2. `<meta property="og:url" ...>`
3. `<meta property="og:image" ...>` (this should point to your real `hero.jpg`)

Also check the `<title>` and `<meta name="description">` read the way you want.
The site does not contain fake ratings, reviews, addresses or business schema, so add none unless they are real.

### The Urdu text
The Urdu is written to be simple and natural, but have an Urdu-speaking friend read it once before launch.
All text lives in the `I18N` dictionary at the top of `app.js` (`en:` and `ur:` sections).

---

## PART 2 — How ordering works (and its limits)

1. Customer adds cheese to the cart and taps **Proceed to Checkout**.
2. They fill in name, mobile, area, address, payment.
3. The site re-checks the cart, recalculates prices/delivery from `products.js`, makes an order reference like `MEL-261014-ANBU`, and opens a WhatsApp chat with the order message already typed.
4. The customer must press **Send** in WhatsApp. **Nothing is sent automatically.**
5. You reply on WhatsApp to confirm availability, delivery charge and timing. The site clearly tells customers the order is not confirmed until you do.

The order message is always written in English so you can read it easily; it also states the customer's language.

**Limits of a static website (please read):**
- **No server-side inventory.** `stock` only limits what one browser can add; it does not count real sales. Update stock by hand.
- **No automatic order records.** Orders exist only in your WhatsApp chats. Keep your own order list.
- **No server-side price validation.** Prices are checked in the customer's browser. A technically skilled person could edit the message before sending, so **always check the total when you confirm**.
- **No payment processing.** Cash on Delivery or arrangements you make on WhatsApp only.
- The cart is saved in the customer's own browser (localStorage) and is not shared between devices.

---

## PART 3 — Publish from an Android phone (free)

Use **Chrome** on Android. Tip: for GitHub's file pages, open Chrome's menu (⋮) and tick **Desktop site** if buttons are missing. Website menus change over time, so if a button name below differs slightly, look for the equivalent option.

### Step 1 — Create a GitHub account
1. Go to **github.com** → **Sign up**.
2. Use your email, a strong password and a username. Verify your email.

### Step 2 — Create a repository
1. Tap **+** (top right) → **New repository**.
2. Repository name: `meltora-store`.
3. Choose **Public** (needed for the simplest free hosting).
4. Tick **Add a README file** (so the repository is not empty). Tap **Create repository**.

### Step 3 — Add the files
For each text file (`index.html`, `style.css`, `app.js`, `products.js`, `assets/logo.svg`):
1. In the repository tap **Add file** → **Create new file**.
2. In the name box type the exact file name. For the logo type `assets/logo.svg` (typing `assets/` creates the folder).
3. Paste the full contents of the file.
4. Tap **Commit changes** → **Commit changes** again.

Replace the auto-created `README.md` the same way (open it → pencil icon → paste this file).

### Step 4 — Upload product images
1. Make the folder: **Add file → Create new file**, name it `assets/images/.gitkeep`, commit.
2. Open the `assets/images` folder you just made.
3. Tap **Add file → Upload files** and pick your photos. They upload into the folder you are in.
4. Name them exactly: `hero.jpg`, `cheddar-200g.jpg`, `cheddar-500g.jpg`, `cheddar-1kg.jpg`, `mozzarella-200g.jpg`, `mozzarella-500g.jpg`, `mozzarella-1kg.jpg`. Commit.
5. Keep photos small (under about 300 KB each) so the site loads fast on mobile data. JPG or WebP works; if you use another extension, change the `image:` value in `products.js` to match.

### Step 5 — Connect to Cloudflare Pages
1. Create a free account at **dash.cloudflare.com**.
2. Find **Workers & Pages** in the left menu → **Create** → choose the **Pages** option → **Connect to Git**.
3. Authorise GitHub and select the `meltora-store` repository.
4. Deployment settings for a plain site:
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** leave empty or enter `/` (the files are in the repository root)
   - **Production branch:** `main`
5. Tap **Save and Deploy**.

If Cloudflare's screens look different, look for: connect a Git repository → pick the repo → no framework → no build command → output = root folder.

**Simpler alternative — GitHub Pages:** In your repository open **Settings → Pages**, set **Source: Deploy from a branch**, branch `main`, folder `/ (root)`, **Save**. Your address will look like `https://YOUR-USERNAME.github.io/meltora-store/`. (Both options are free and HTTPS.)

### Step 6 — Find your live address
- Cloudflare: after the deployment finishes, open the project; the address looks like `https://meltora-store.pages.dev` (the exact name is shown on screen).
- Put that address into the three `YOUR-SITE.pages.dev` places in `index.html` (Part 1) and commit.

### Step 7 — Update things later
Open the file on GitHub → pencil (✎) icon → edit → **Commit changes**. Cloudflare/GitHub Pages republishes automatically in about a minute.
- Prices, availability, delivery, areas, links → `products.js`
- Text and translations → `I18N` in `app.js`
- Images → upload a new file with the **same name** (Add file → Upload files inside `assets/images`).
- Careful with commas and quotes in `products.js`; if the site goes blank after an edit, undo it (Troubleshooting below).

### Step 8 — Test WhatsApp checkout on Android (do this before telling customers)
1. Make sure `WHATSAPP_NUMBER` is set, then open your live HTTPS address.
2. Add products, tap the cart, **Proceed to Checkout**, fill the form with your own details, tap **Send Order on WhatsApp**.
3. WhatsApp should open on a chat with your number and a ready message. Check the items, subtotal, delivery fee and total. **Send it to yourself/your business number** and reply to confirm.
4. Switch to **اردو** and check the page still looks right.
5. Test with Chrome and, if you can, a second phone.

### Troubleshooting
| Problem | Fix |
|---|---|
| Orange/red warning at checkout about the WhatsApp number | `WHATSAPP_NUMBER` still contains `XXXX` or is wrong. Use 92 + 10 digits, no `+`, no spaces. |
| WhatsApp does not open | Allow pop-ups for the site, or tap the green **Open WhatsApp** button that appears after checkout. Make sure WhatsApp is installed. |
| Page is blank / products missing after an edit | A comma or quote was broken in `products.js`. On GitHub open the file → **History** → open the last good version → restore it. |
| Changes not showing | Wait 1–2 minutes, then refresh. Chrome menu → **Settings → Privacy → Clear browsing data** → cached images and files. |
| Picture not showing | File name or extension differs from the `image:` value (names are case-sensitive: `Cheddar-200g.JPG` ≠ `cheddar-200g.jpg`). |
| Cart empty after refresh | Private/incognito mode or blocked site storage can prevent saving. The store still works for that visit. |
| Cloudflare build fails | Build command must be empty and framework "None". |

---

## PART 4 — Test report

**Tests actually performed** (automatic checks in headless Chromium: 360 × 740 mobile emulation and 1280 × 800 desktop, served over local HTTP — 64 of 64 passed):
- Navigation anchors, mobile menu open/close (and closes after tapping a link)
- Category cards and filter chips; combo category hidden when no combo exists, appears when one is configured
- All 6 products can be added; quantity +/−, minimum quantity 1, remove
- Subtotal, delivery fee (Rs. 250 placeholder), grand total; free-delivery threshold; minimum-order block
- Cart survives refresh; only product IDs and quantities are stored (no prices); corrupted/invalid saved data, unknown IDs, negative/decimal/oversized quantities handled safely
- English ⇄ Urdu: `lang`/`dir` switch to `ur`/`rtl`, text translated, cart kept, preference saved, no horizontal overflow at 360 px in either language; drawer opens correctly in RTL
- Checkout validation (name, phone, area, address, bad phone), empty cart cannot be checked out, out-of-stock products cannot be added or ordered
- Missing WhatsApp number shows a clear warning and blocks sending
- With a test number, `https://wa.me/<number>?text=…` is produced once, with a correct, fully encoded message: reference, customer details, items, subtotal, delivery fee, total, payment
- Missing product/hero images show the designed fallback
- No JavaScript errors in the main flow

**Still needs YOUR manual verification:**
- The real WhatsApp app opening on your Android phone and your real number (I could only verify the generated link)
- Real photos, real prices, real delivery areas and fee (all placeholders now)
- Appearance in several real Android phones/browsers
- Live deployment over HTTPS on GitHub/Cloudflare, and the canonical/Open Graph address (the site is **not** deployed yet)
- A native Urdu reader's review of the translations
