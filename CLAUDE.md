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
  { id: 'uncleaned', label: 'Raw (Uncleaned & Whole Fish)', icon: '🐟', minWeight: 1000 },
  { id: 'cleaned',   label: 'Raw (Cleaned)',   icon: '✂️', minWeight: 1000 },
  { id: 'curry',     label: 'Curry',        icon: '🍛', minWeight: 500  },
  { id: 'fry',     label: 'Fry',        icon: '🍳', minWeight: 500  },
];
```

**Weight rules:**
- `Curry` and `Fry` — minimum 500g, all weight options available
- `Raw Uncleaned` and `Raw Cleaned` — minimum 1000g (500g button is greyed out and disabled)

> To change the minimum for a prep type, update its `minWeight` value.

---

### Pricing

Prices are **per 500g** and vary by fish and preparation type. They are defined in a `PRICES` dictionary at the top of the script. To update a price, find the fish row and change the value under the relevant prep column.

```js
var PRICES = {
  anchovy:  { cleaned: 8.00,  curry: 10.00, fry: 12.00, uncleaned: 6.00  },
  dorade:   { cleaned: 10.00, curry: 11.50, fry: 14.00, uncleaned: 8.00  },
  pomfret:  { cleaned: null,  curry: null,  fry: null,  uncleaned: null   },
  prawns:   { cleaned: 11.00, curry: 12.50, fry: 15.00, uncleaned: 9.00  },
  salmon:   { cleaned: 10.00, curry: 11.50, fry: 14.00, uncleaned: 8.00  },
  sardien:  { cleaned: null,  curry: null,  fry: null,  uncleaned: null   },
  zeebaars: { cleaned: 10.00, curry: 11.50, fry: 14.00, uncleaned: 8.00  },
};
```

- All prices are per 500g gross weight, as per the official Fishy Weekend price list
- `null` means the fish is not currently available in that preparation — the option should be hidden or disabled in the UI
- **Pomfret** and **Sardien** are fully greyed out for now; fill in their prices when they become available
- The prep keys (`cleaned`, `curry`, `fry`, `uncleaned`) must match the `id` fields in the `PREPS` array exactly
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
