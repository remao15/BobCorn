<p align="center">
  <img src="0.png" alt="AdCheck Logo" width="128" height="128">
</p>

<h1 align="center">AdCheck: BS Detector</h1>

<p align="center">
  <strong>A browser extension that automatically detects e-commerce product pages and analyzes them in real time.</strong>
</p>

<p align="center">
  🛡️ Flags pricing tricks &nbsp;•&nbsp; 🚨 Spots bad policies &nbsp;•&nbsp; 🔍 Surfaces verified alternatives with live prices
</p>

---

## Overview

AdCheck (also known as **AdCheck**) is a Manifest V3 browser extension that silently monitors the pages you visit. When it detects a product page, it runs two AI pipelines in parallel to:

- **Analyze** the page for BS — inflated claims, shady pricing tactics, weak return policies, and trust issues.
- **Find** real, grounded alternatives with current prices from across the web.

All analysis happens via a background service worker. No page content is modified until you choose to open the popup.

---

## How It Works

1. **Local heuristics** in `content.js` silently check every page for product signals (Schema.org, OpenGraph, URL patterns, cart buttons, price elements). No API call is made unless ≥2 signals fire.
2. When a product page is confirmed, two AI pipelines run **in parallel** via background service worker:
   - **Page Analysis** — Nemotron 3 Super reads the full page text offline and returns a structured verdict: BS score, issues by severity, and an honest summary.
   - **Alternatives** — an agentic flow generates search queries, runs them through Tavily, then filters the results to return 3 real, grounded alternatives with prices and links.
3. The extension icon badges `...` → `✓` (or `!` on error). Click the icon to open the popup and read the analysis.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension | Manifest V3, Chrome APIs |
| Detection | Local heuristics (zero cost, zero latency) |
| AI model | `nvidia/nemotron-3-super-120b-a12b` via OpenRouter |
| Web search | Tavily Search API |
| Prompts | `prompts.js` — fully editable |

---

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/remao15/BobCorn.git
cd BobCorn
git checkout phase1
```

### 2. Configure API keys

Copy the example keys file and fill in your credentials:

```bash
cp extension/keys.example.js extension/keys.js
```

Then open `extension/keys.js` and replace the placeholders:

```js
const OPENROUTER_KEY = 'sk-or-YOUR_KEY_HERE';  // https://openrouter.ai/keys
const TAVILY_KEY     = 'tvly-YOUR_KEY_HERE';   // https://app.tavily.com
```

> `keys.js` is gitignored and will never be committed.

**Alternatively**, set keys at runtime via the Chrome service worker console:

1. Go to `chrome://extensions`
2. Find AdCheck → click **Inspect service worker**
3. Run in the console:

```js
chrome.storage.local.set({
  openrouterKey: 'sk-or-YOUR_KEY_HERE',
  tavilyKey: 'tvly-YOUR_KEY_HERE'
});
```

### 3. Load the extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder inside this repo

---

## Usage

1. Navigate to any product page (Amazon, Zalando, MediaMarkt, Shopify stores, etc.)
2. The extension icon will badge `...` — analysis is running
3. When it turns `✓`, click the icon to open the AdCheck popup
4. Read the verdict, issues, and alternatives

---

## Customizing Prompts

All AI prompts are in `extension/prompts.js`. Edit the three functions to change how the model analyzes pages or generates alternatives — no other file needs touching.

| Prompt | Purpose |
|---|---|
| `PROMPTS.pageComments(pageText)` | Offline page analysis — verdict, BS score, issues |
| `PROMPTS.alternativeQueries(title, pageText)` | Generates 3 Tavily search queries |
| `PROMPTS.alternativesFilter(title, results)` | Filters search results into 3 structured alternatives |

---

## Project Structure

```
extension/
├── manifest.json       # Extension config, permissions, popup declaration
├── content.js          # Local heuristic product detection (no DOM changes)
├── background.js       # Service worker — runs both AI pipelines
├── prompts.js          # All editable AI prompt templates
├── popup.html          # Popup UI shell
├── popup.js            # Popup rendering and polling logic
├── keys.js             # Your API keys (gitignored — do not commit)
└── keys.example.js     # Keys template to copy from
```

---

## Output Schema

### Page Analysis
```json
{
  "verdict": "CLEAN | WARNING | SUSPICIOUS",
  "bsScore": 0,
  "summary": "One honest sentence about this product.",
  "issues": [
    {
      "type": "pricing | policy | quality | trust | claim",
      "severity": "high | medium | low",
      "detail": "Specific observation."
    }
  ]
}
```

### Alternatives
```json
[
  {
    "name": "Product Name",
    "service": "Platform or Store",
    "price": "€29.99",
    "whyBetter": "One sentence reason.",
    "url": "https://..."
  }
]
```

---

## Team

- **Aldo** — [@heron4gf](https://github.com/heron4gf)
- **Suter Gabriel** — [@SuterGabriel](https://github.com/SuterGabriel)
- **Rémi Khani** -
- **Baptiste Lucas** - 
