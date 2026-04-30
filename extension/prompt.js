/**
 * CartCop Prompt Template
 * Generates the analysis prompt sent to the LLM.
 */

function buildPrompt({ url, title, price, rating, reviewCount }) {
  return `You are a brutally honest consumer product analyst. Analyze the Amazon product below and respond ONLY with valid JSON — no markdown, no explanation.

Product: ${title}
Price: ${price}
Rating: ${rating} (${reviewCount})
URL: ${url}

Respond with exactly this structure:
{
  "bsScore": <integer 0-100>,
  "brutalTruth": "<1-2 sentence honest verdict>",
  "alternatives": [
    {
      "name": "<product name>",
      "price": "<price string>",
      "whyBetter": "<short reason>",
      "link": "<amazon.com URL>"
    }
  ]
}

bsScore guide: 0-39 = genuine value, 40-69 = mediocre or overpriced, 70-100 = BS rebrand / pure markup.
Return exactly 3 alternatives. Output only the JSON object.`;
}
