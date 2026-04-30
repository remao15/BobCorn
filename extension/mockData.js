/**
 * CartCop Mock Database
 * Maps Amazon product URLs to fake Perplexity-style outputs.
 * Used for hackathon demo before live API integration.
 */

const CARTCOP_MOCK_DB = {
  // Product 1: Cheap Bluetooth Earbuds (High BS Score)
  "https://www.amazon.com/dp/B09QH7Y919": {
    bsScore: 87,
    brutalTruth: "You're paying $40 for rebranded AliExpress plastic with a logo slapped on. Same chipset costs $12 on Alibaba.",
    alternatives: [
      {
        name: "Anker Soundcore P2i",
        price: "$19.99",
        whyBetter: "Same drivers, half the price, 2-year warranty, and actual customer support.",
        link: "https://www.amazon.com/dp/B0BHFKLN77"
      },
      {
        name: "JLab Go Air Pop",
        price: "$24.99",
        whyBetter: "Better battery life, IP55 water resistance, and US-based support team.",
        link: "https://www.amazon.com/dp/B09WM3R7FP"
      },
      {
        name: "SoundPEATS Free2 Classic",
        price: "$16.99",
        whyBetter: "Identical chipset, longer lifespan, and transparent pricing history.",
        link: "https://www.amazon.com/dp/B09QH7Y919"
      }
    ]
  },

  // Product 2: Overpriced "Smart" Water Bottle (Medium BS Score)
  "https://www.amazon.com/dp/B08Z7MJV4D": {
    bsScore: 64,
    brutalTruth: "$80 for a bottle that reminds you to drink water. Your phone already does this for free.",
    alternatives: [
      {
        name: "Hydro Flask Standard Mouth",
        price: "$34.95",
        whyBetter: "Double-wall vacuum insulation, lifetime warranty, no batteries to die.",
        link: "https://www.amazon.com/dp/B01ACAX0C2"
      },
      {
        name: "Simple Modern Summit",
        price: "$24.99",
        whyBetter: "Same insulation tech, half the price, 20+ color options.",
        link: "https://www.amazon.com/dp/B08Z7MJV4D"
      },
      {
        name: "CamelBak Eddy+",
        price: "$16.00",
        whyBetter: "BPA-free, leak-proof, and doesn't need a charging cable.",
        link: "https://www.amazon.com/dp/B07XY7MNDR"
      }
    ]
  },

  // Product 3: Genuine Good Product (Low BS Score — shows fairness)
  "https://www.amazon.com/dp/B08N5WRWNW": {
    bsScore: 12,
    brutalTruth: "Actually solid. Sony's WH-1000XM4 are the benchmark for a reason — great ANC, 30hr battery, and they last.",
    alternatives: [
      {
        name: "Sony WH-1000XM5",
        price: "$348.00",
        whyBetter: "Newer model with better noise cancellation and lighter build.",
        link: "https://www.amazon.com/dp/B09XS7JWHH"
      },
      {
        name: "Bose QuietComfort 45",
        price: "$279.00",
        whyBetter: "More comfortable for long wear, cleaner call quality.",
        link: "https://www.amazon.com/dp/B098FKXT8L"
      },
      {
        name: "Sennheiser Momentum 4",
        price: "$299.95",
        whyBetter: "Audiophile-grade sound, 60-hour battery life beast.",
        link: "https://www.amazon.com/dp/B0B6GHW1XK"
      }
    ]
  }
};

// Expose for content.js
if (typeof window !== 'undefined') {
  window.CARTCOP_MOCK_DB = CARTCOP_MOCK_DB;
}
