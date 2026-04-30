/**
 * CartCop Prompts
 * Two-pipeline design: summary (streamed, macro) + highlights (async, micro)
 */

const PROMPTS = {
  /**
   * Summary prompt — streamed to popup.
   * Returns: { verdict, bsScore, category, summary, alternatives }
   */
  summary(pageText) {
    return `You are a brutally honest consumer protection analyst. Analyze the e-commerce product page content below and respond ONLY with valid JSON — no markdown, no explanation.

## Page Content
${pageText.slice(0, 7000)}

Respond with exactly this structure:
{
  "verdict": "<CLEAN | WARNING | SUSPICIOUS>",
  "bsScore": <integer 0-100>,
  "category": "<product category or type, e.g. 'online-course', 'physical-product', 'subscription', 'ebook', 'software'>",
  "summary": "<1-2 sentence honest verdict>",
  "alternatives": [
    {
      "name": "<product name>",
      "service": "<store or platform name>",
      "price": "<price string or 'N/A'>",
      "whyBetter": "<one sentence reason>",
      "url": "<direct URL>"
    }
  ]
}

IMPORTANT: Output only raw JSON, no markdown code blocks.

bsScore guide: 0-39 = genuine value, 40-69 = mediocre or overpriced, 70-100 = BS / pure markup.
Issues to look for: inflated original prices, vague return/refund policies, suspicious review patterns, unverifiable claims, dark patterns, missing certifications.
Return only the JSON object.`;
  },

  /**
   * Highlights prompt — async, sent to content script for DOM injection.
   * Returns: { highlights: [{ id, text, comment, sentiment, severity }] }
   */
  highlights(pageText) {
    return `You are a meticulous consumer protection analyst. Scan the e-commerce product page content below and identify specific text snippets that are either red flags or genuine positive signals.

## Page Content
${pageText.slice(0, 7000)}

Respond ONLY with valid JSON in this exact structure:
{
  "highlights": [
    {
      "id": "<unique id, e.g. 'h1'>",
      "text": "<EXACT verbatim substring from Page Content, 4-25 words>",
      "comment": "<specific factual explanation — no vague labels like 'very', 'extremely', 'clearly', 'obviously'>",
      "sentiment": "<negative | positive>",
      "severity": "<high | medium | low | null>"
    }
  ]
}

CRITICAL RULES:
1. text must be an EXACT substring copied verbatim from the Page Content. Do not paraphrase. Minimum 4 words, maximum 25 words.
2. comment must be specific and factual. Explain WHY something is a red flag or positive signal. Cite concrete reasons, not vague labels.
3. sentiment is binary: negative or positive. No neutral. Force a judgment.
4. severity applies only to negative highlights: high (suspicious claims, fake urgency), medium (vague policy, unverifiable claim), low (minor wording concern). Use null for positive highlights.
5. Target 5-10 highlights per page. Quality over quantity.
6. At least 1 positive highlight is required if any exist on the page.
7. Forbidden phrases in comments: "very", "extremely", "clearly", "obviously", "just", "simply".

Return only the JSON object.`;
  },

  alternativeQueries(title, pageText) {
    return `You are a product research assistant. Based on the product below, generate exactly 3 search queries to find better or cheaper alternatives on the web.

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
    return `You are a product analyst. From the search results below, extract the 3 most relevant and clearly better alternatives to "${originalTitle}".

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

Only include results that are real, relevant product alternatives. Output only the JSON array.`;
  }
};
