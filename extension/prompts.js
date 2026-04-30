const PROMPTS = {
  pageComments(pageText) {
    return `You are a brutally honest consumer protection analyst. Analyze the e-commerce product page content below and respond ONLY with valid JSON — no markdown, no explanation.

## Page Content
${pageText.slice(0, 7000)}

Respond with exactly this structure:
{
  "verdict": "<CLEAN | WARNING | SUSPICIOUS>",
  "bsScore": <integer 0-100>,
  "category": "<product category or type, e.g. 'online-course', 'physical-product', 'subscription', 'ebook', 'software'>",
  "summary": "<1-2 sentence honest verdict>",
  "issues": [
    {
      "type": "<pricing | policy | quality | trust | claim>",
      "severity": "<high | medium | low>",
      "detail": "<specific observation>",
      "highlightId": "<id from highlights array, e.g. 'h1'>"
    }
  ]
}

IMPORTANT: For each highlight, text must be an EXACT substring copied verbatim from the Page Content above. Do not paraphrase or rephrase. Minimum 6 words, maximum 20 words.

bsScore guide: 0-39 = genuine value, 40-69 = mediocre or overpriced, 70-100 = BS / pure markup.
Issues to look for: inflated original prices, vague return/refund policies, suspicious review patterns, unverifiable claims, dark patterns, missing certifications.
Return only the JSON object.`;
  },

  alternativeQueries(title, pageText) {
    return `You are a product research assistant. Based on the product below, generate exactly 3 search queries to find better or cheaper alternatives on the web. Do not generate queries that could yield scummy products, scams, or get-rich-quick schemes.

Product: ${title}
Context: ${pageText.slice(0, 1000)}

Respond ONLY with a JSON array of 3 strings. Example:
["best alternatives to X under $50", "X competitor reviews 2025", "X vs similar products"]

Output only the JSON array.`;
  },

  alternativesFilter(originalTitle, results) {
    const resultsText = results
      .map(r => `URL: ${r.url}\nTitle: ${r.title}\nSnippet: ${r.content}`)
      .join('\n---\n');
    return `You are a product analyst. From the search results below, extract up to 3 of the most relevant and clearly better alternatives to "${originalTitle}".

CRITICAL RULES:
1. STRICTLY use the URLs provided in the search results. Do NOT hallucinate or fabricate links.
2. Do NOT recommend scummy products, scams, or "get rich quick" courses.
3. Do NOT recommend unrelated links, filler pages, or irrelevant articles.
4. It is better to return an empty array [] than to include low-quality, irrelevant, or fabricated results. Only include an alternative if it is genuinely helpful and reputable.

## Search Results
${resultsText.slice(0, 5000)}

Respond ONLY with a JSON array with exactly this structure:
[
  {
    "name": "<product name>",
    "service": "<store or platform name>",
    "price": "<price string or 'N/A'>",
    "whyBetter": "<one sentence reason>",
    "url": "<direct URL from search results>"
  }
]

Output only the JSON array.`;
  }
};