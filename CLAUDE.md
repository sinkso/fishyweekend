# Fishy Weekend — Order Form

## Project Overview

A single-page HTML order form for a weekly fresh fish delivery service called **Fishy Weekend**. Customers select fish, choose how they want it prepared, pick a weight, and send the completed order via WhatsApp. There is no backend — WhatsApp is the delivery mechanism.

The finished file is a single self-contained `index.html`. No build tools, no dependencies, no server needed. It is hosted on GitHub Pages for free.

---

## 🐟 EDITABLE CONFIGURATION — MAINTAIN THIS SECTION

This is the section you edit when fish, preparations, prices, or weights change. Everything below maps directly to variables in the `<script>` block of `index.html`.

### Fish List

Edit the `FISH` array in the script. Each entry needs:
- `id` — a unique lowercase slug, no spaces (used internally)
- `name` — the display name shown to customers
- `emoji` — a relevant emoji shown on the card
- `available` - if te fish is available for delivery, if false, grey out the entry

```js
var FISH = [
  { id: 'anchovy',  name: 'Anchovy',            emoji: '🐟',  available: true  },
  { id: 'dorade',   name: 'Dorade',             emoji: '🐠',  available: true  },
  { id: 'pomfret',  name: 'Pomfret',            emoji: '🐟',  available: false },
  { id: 'prawns',   name: 'Prawns',             emoji: '🦐',  available: true  },
  { id: 'salmon',   name: 'Salmon',             emoji: '🍣',  available: true  },
  { id: 'sardine',  name: 'Sardine',            emoji: '🐠',  available: false },
  { id: 'zeebaars', name: 'Zeebaars',           emoji: '🐡',  available: true  },
];
```

> **To add a fish:** append a new line following the same format.
> **To remove a fish:** delete its line.

---

### Preparation Types

Edit the `PREPS` array. Each entry needs:
- `id` — unique lowercase slug
- `label` — display name shown to customers
- `icon` — emoji shown next to the label
- `minWeight` — minimum grams allowed for this preparation (enforced on weight buttons)

```js
var PREPS = [
  { id: 'cleaned',   label: 'Raw (Cleaned)',   icon: '✂️', minWeight: 500  },
  { id: 'curry',     label: 'Curry',        icon: '🍛', minWeight: 500  },
  { id: 'fry',     label: 'Fry',        icon: '🍳', minWeight: 500  },
];
```

> **Raw (Uncleaned & Whole Fish)** was removed from `PREPS` — Fishy Weekend no longer offers uncleaned/whole fish, only cleaned raw fish, curry, and fry. The `Fish` Google Sheet tab may still have an `uncleaned` price column; it's simply ignored now (harmless to leave or remove).

**Weight rules:**
- `Curry`, `Fry`, and `Raw Cleaned` — minimum 500g, all weight options available

> To change the minimum for a prep type, update its `minWeight` value.

**500g surcharge for Raw (Cleaned):** ordering Raw (Cleaned) fish at 500g adds a flat surcharge, set via `CLEANED_500G_SURCHARGE` (currently €1.00) near the `PREPS`/`WEIGHTS` config. It only applies when `prep.id === 'cleaned' && weight === 500` (see `getSurcharge()`); Curry, Fry, and 1kg+ Raw Cleaned orders are unaffected. The surcharge is shown directly on the 500g weight button (e.g. "500g (+€1.00)") and is added into the line total everywhere it's calculated — the order summary, the WhatsApp message, and the Google Sheets order log — each annotated with "(+€1.00 surcharge)" so it's never a silent price bump.

> To change the surcharge amount, edit `CLEANED_500G_SURCHARGE`. To remove it, set it to `0` (the 500g option stays enabled either way, since `minWeight` is now `500`).

---

### Pricing

Prices are **per 500g** and vary by fish and preparation type. They are defined in a `PRICES` dictionary at the top of the script. To update a price, find the fish row and change the value under the relevant prep column.

```js
var PRICES = {
  anchovy:  { cleaned: 8.00,  curry: 10.00, fry: 12.00 },
  dorade:   { cleaned: 10.00, curry: 11.50, fry: 14.00 },
  pomfret:  { cleaned: null,  curry: null,  fry: null  },
  prawns:   { cleaned: 11.00, curry: 12.50, fry: 15.00 },
  salmon:   { cleaned: 10.00, curry: 11.50, fry: 14.00 },
  sardien:  { cleaned: null,  curry: null,  fry: null  },
  zeebaars: { cleaned: 10.00, curry: 11.50, fry: 14.00 },
};
```

- All prices are per 500g gross weight, as per the official Fishy Weekend price list
- `null` means the fish is not currently available in that preparation — the option should be hidden or disabled in the UI
- **Pomfret** and **Sardien** are fully greyed out for now; fill in their prices when they become available
- The prep keys (`cleaned`, `curry`, `fry`) must match the `id` fields in the `PREPS` array exactly
- Price for a given selection is looked up as `PRICES[fish.id][prep.id]`, then multiplied by `weight / 500`

**To update a price:** change the number in the relevant cell.
**To make a fish/prep available:** replace `null` with the price.
**To add a new fish:** add a new row to `PRICES` with the same `id` used in the `FISH` array.

---

### Available Weights

```js
var WEIGHTS = [500, 1000, 1500, 2000];
```

These are the selectable weights in grams. Add or remove values here to change what customers can choose. The `minWeight` rule on each prep type will automatically disable any options below the threshold.

---

### Spices

A separate section, styled and behaving exactly like Special Products, for whole/ground spices sourced from a specific origin. Each spice has **one fixed weight and one fixed price** (unlike fish/specials which offer multiple weight options), but the interaction pattern is identical: tap the pack-size chip to select it (revealing a quantity stepper), tap again — or step the quantity down to 0 — to deselect. This keeps both sections consistent for the customer and lets a spice later gain a second pack size without changing the interaction model.

Edit the `SPICES` array in the script. Each entry needs:
- `id` — unique lowercase slug
- `name` — display name
- `origin` — shown under the name (e.g. `'Wayanad, Kerala'`, `'Iran'`)
- `emoji` — icon shown on the card
- `available` — if false, the card is greyed out and disabled
- `weight` — the pack size in grams sold per unit (e.g. `50`, `100`, or `1` for saffron sold by the gram)
- `price` — price in EUR for that one pack (i.e. per `weight` grams, not per 500g/200g)

```js
var SPICES = [
  { id: 'cardamom', name: 'Cardamom', origin: 'Wayanad, Kerala', emoji: '🌿', available: true, weight: 50,  price: 1.00 },
  { id: 'cloves',   name: 'Cloves',   origin: 'Wayanad, Kerala', emoji: '🌸', available: true, weight: 50,  price: 1.00 },
  { id: 'cinnamon', name: 'Cinnamon', origin: 'Wayanad, Kerala', emoji: '🪵', available: true, weight: 50,  price: 1.00 },
  { id: 'pepper',   name: 'Pepper',   origin: 'Wayanad, Kerala', emoji: '⚫', available: true, weight: 100, price: 1.00 },
  { id: 'javithri', name: 'Javithri', origin: 'Wayanad, Kerala', emoji: '🍂', available: true, weight: 50,  price: 1.00 },
  { id: 'saffron',  name: 'Saffron',  origin: 'Iran',            emoji: '🌼', available: true, weight: 1,   price: 1.00 }
];
```

> All prices above are placeholder €1.00 values — update them to real prices before going live.
> To add a spice: append a new line following the same format.
> To remove a spice: delete its line.
> Line total for a spice = `price × quantity` (quantity is however many packs of `weight` grams the customer orders).

`SHOW_SPICES` (boolean, defaults to `true`) controls whether the whole Spices section renders, same pattern as `SHOW_FISH` / `SHOW_SPECIAL`.

**Google Sheet integration:** like Fish and Specials, the Spices list can be driven from a `Spices` tab in the same Google Sheet (see `SPICES_CSV_URL` / `SPREADSHEET_ID` in the script). If you want to manage spices from the sheet instead of editing code, add a tab named exactly `Spices` with these column headers in row 1:

| id | name | origin | emoji | available | weight | price |
|----|------|--------|-------|-----------|--------|-------|
| cardamom | Cardamom | Wayanad, Kerala | 🌿 | TRUE | 50 | 1.00 |
| cloves | Cloves | Wayanad, Kerala | 🌸 | TRUE | 50 | 1.00 |
| cinnamon | Cinnamon | Wayanad, Kerala | 🪵 | TRUE | 50 | 1.00 |
| pepper | Pepper | Wayanad, Kerala | ⚫ | TRUE | 100 | 1.00 |
| javithri | Javithri | Wayanad, Kerala | 🍂 | TRUE | 50 | 1.00 |
| saffron | Saffron | Iran | 🌼 | TRUE | 1 | 1.00 |

`available` must be the literal text `TRUE` (any other value, including blank, is treated as unavailable). If the `Spices` tab is missing or empty, the hardcoded defaults above are used instead — same fallback behavior as Fish/Specials.

---

## Technical Specification

### Architecture

- **Single file:** `index.html` (rename from `fishy-weekend-order.html` before deploying)
- **No framework**, no build step, no npm — plain HTML, CSS, and vanilla JavaScript
- **No backend** — orders are sent as a pre-formatted WhatsApp message via the `wa.me` URL scheme
- **Fonts** loaded from Google Fonts CDN: `Fredoka One` (headings) and `Nunito` (body)

### How the UI Works

The page has few sections:
1. **Customer info** - a/ Name of Customer b/ Customer Phone number fron Netherlands starting with +31 and c/ Address Postal Code & Door number (ex: `1363VS` & `88`).

2. **Fish grid** — one card per fish, full width, stacked vertically. Clicking the card header toggles it selected/deselected. When selected, four preparation blocks expand horizontally beneath the header. Clicking a prep block toggles it active; weight buttons then appear inside it.

3. **Other questions** - a/ "Do you need Fish head?" - yes or no b/ If `curry` or `fry` is selected, then "What Spicy Level do you need?" - Low, Medium, High, No preference.

4. **Order summary** — live-updates as selections are made. Shows each selected fish, its active preps, the chosen weight, and the price. A grand total is shown at the bottom. The WhatsApp button stays disabled until at least one complete selection (fish + prep + weight) exists.

### State Management

State is held in three flat JavaScript objects (not a framework, not localStorage):

```js
var fishSelected = {};   // fishSelected['salmon'] = true/false
var prepActive   = {};   // prepActive['salmon_curry'] = true/false
var prepWeight   = {};   // prepWeight['salmon_curry'] = 1000 or null
```

Keys for prep state are `fishId + '_' + prepId` (e.g. `'salmon_curry'`).

Every interaction calls `renderAll()`, which wipes and redraws the entire grid and summary from scratch. This is intentionally simple — no partial re-renders, no virtual DOM.

### Why Old-Style JavaScript

The script uses `var` and immediately-invoked functions `(function(id){ })(value)` instead of modern `const`/`let` and arrow functions. This is deliberate — it avoids a classic loop-closure bug where all cards would share the same variable reference. When Claude Code rewrites this, keep the same pattern or use `let` carefully with block scope.

### Color Scheme

Light ocean theme. CSS variables are defined in `:root`:

```css
:root {
  --ocean-deep: #dbeeff;   /* page background — pale sky blue */
  --ocean-mid:  #b8d9f8;   /* card/summary background */
  --gold:       #e67e00;   /* primary accent — warm orange */
  --gold-light: #f59500;   /* lighter accent for hover/prices */
  --orange:     #c45c00;   /* darker orange for shadows/warnings */
  --white:      #1a3a5c;   /* main text — dark navy (inverted from dark theme) */
}
```

Header uses a medium blue gradient `#5b9fd6 → #3a7bbf` with white text, so it has contrast without being dark.

### WhatsApp Integration

The send button opens `https://wa.me/31645846028?text=...` with the order pre-encoded. This opens WhatsApp for the user to choose a contact. To send directly to a specific number, change the URL to:

```
https://wa.me/316XXXXXXXX?text=...
```

Replace `316XXXXXXXX` with the international format number (Netherlands: `316` + 8-digit mobile number, no leading zero).

---

## Deployment (GitHub Pages)

1. Rename `fishy-weekend-order.html` → `index.html`
2. Push `index.html` to the `main` branch in Github repository
3. Go to **Settings → Pages**, set source to `main` branch, root folder
4. Site goes live at `https://yourusername.github.io/fishy-weekend`

Share this URL in the WhatsApp group. No server, no cost, no maintenance.

### Updating the site after changes

Edit `index.html` locally, then push the updated file to GitHub. GitHub Pages redeploys automatically within ~30 seconds.

---

## Future Enhancements (Not Yet Built)

- **Per-fish pricing** — add `pricePerKg` to each fish in `FISH` array and update the price formula
- **Per-prep pricing** — add `priceMultiplier` to each prep and factor it in
- **Order logging** — replace or supplement WhatsApp with Formspree (`formspree.io`) to receive orders as emails; free tier is sufficient for weekly volume
- **Availability toggle** — add `available: false` to a fish entry and skip rendering it, useful for weeks when something is out of stock (e.g. Pomfret)
- **Customer name field** — a simple text input above the fish grid, included in the WhatsApp message
