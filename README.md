# CartCop: BS Detector & Subscription Auditor

## The Core Concept
A two-pronged financial reality-check tool built to save users from frictionless buying and subscription amnesia.
* **The BS Detector (Free Extension):** A brutal, on-the-spot product evaluator. You view an item; the extension instantly aggregates sentiment, calls out fake reviews, grades the product's actual quality, and pushes verified, superior alternatives to the screen.
* **The Subscription Auditor (Paid Platform):** A web dashboard that scans your recurring charges, flags overpriced services, and actively suggests migrations (e.g., "Drop X, move to Y and save $15/mo").

## The Pain Points Addressed
* **Review Manipulation:** Product reviews are rigged. Buyers need an instant, unbiased reality check before pulling the trigger.
* **Service Complacency:** People stick with bloated subscriptions because researching cheaper, better alternatives takes too much effort.

## Business Model
* **Free Tier:** Affiliate revenue. When the extension tells them the current product is garbage and they buy your recommended alternative, you take a cut.
* **Paid Tier:** Subscription fee. Automates the financial audit and provides direct cancellation or migration workflows.

---

## Hackathon Pitch & SDLC Pipeline

**1. Plan & Analyze (The Problem)**
We identified that frictionless 1-click buying and fake reviews trick users into wasting money. The problem matters because consumers lack an instant, unbiased reality check at the point of sale.

**2. Design (The Solution & UX)**
We designed a disruptive but clean UX: a 'BS Detector' overlay that injects itself directly onto Amazon/Shopify pages right before checkout, forcing a moment of reflection with better alternatives.

**3. Develop (What we built & HOW BOB HELPED)**
We built a Manifest V3 browser extension and a web dashboard. We used Bob extensively here: Bob generated our DOM-scraping logic for Amazon, built our extension boilerplate, and helped us structure the mock JSON databases to simulate our API endpoints.

**4. Test (Validation)**
We validated the prototype locally, testing the DOM injection on live Amazon pages to ensure our overlay triggers correctly on target URLs without breaking the host site's CSS or functionality.

**5. Deploy (Shipping it)**
To ship to real users, our deployment plan involves publishing the extension to the Chrome Web Store and swapping our mock JSON files for live Perplexity and Plaid API integrations.

**6. Maintain (The Demo)**
Live demonstration of the "Golden Path": Open the mocked Amazon URL -> show the BS Detector overlay -> click the alternative -> switch to the Subscription dashboard.

---

## Technical Execution & Agent Workflow
This project was built rapidly in a 2-hour hackathon environment using parallel agent branches:

* **Branch 1 (Extension Foundation):** Setup `manifest.json` (Manifest V3) and basic `content.js` file for Amazon URL targeting.
* **Branch 2 (The BS Detector Overlay):** UI injection logic, creating a high-contrast HTML `<div>` directly into the DOM above the "Add to Cart" button.
* **Branch 3 (Mock Data Engine):** Hardcoded JSON generation (`mock_alternatives.json` and `mock_subscriptions.json`) to simulate Perplexity outputs and Plaid banking data.
* **Branch 4 (The Subscription Dashboard):** Single HTML page dashboard built with Tailwind CDN to parse JSON data, calculate "Total Wasted", and render migration UI.

---
