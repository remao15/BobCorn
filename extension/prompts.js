/**
 * CartCop Prompts
 * Edit these to tune the AI pipeline behavior.
 *
 * Pipelines:
 *   summary()            — streamed to popup (macro: verdict, score, issues)
 *   highlights()         — async to DOM (micro: specific text annotations)
 *   alternativeQueries() — generates Tavily search queries
 *   alternativesFilter() — filters Tavily results into structured alternatives
 */

const PROMPTS = {
  summary(pageText) {
    return `You are a brutally honest consumer protection analyst. Analyze the e-commerce product page content below and respond ONLY with raw JSON — no markdown, no explanation.

## Page Content
${pageText.slice(0, 7000)}

Respond with exactly this structure:
{
  "verdict": "<CLEAN | WARNING | SUSPICIOUS>",
  "bsScore": <integer 0-100>,
  "category": "<product category, e.g. 'online-course', 'physical-product', 'subscription', 'ebook', 'software'>",
  "summary": "<1-2 sentence honest verdict>",
  "issues": [
    {
      "type": "<pricing | policy | quality | trust | claim>",
      "severity": "<high | medium | low>",
      "detail": "<specific, factual observation — no vague labels>"
    }
  ]
}

bsScore guide: 0-39 = genuine value, 40-69 = mediocre or overpriced, 70-100 = BS / pure markup.
Issues to flag: inflated original prices, vague return/refund policies, suspicious review patterns, unverifiable claims, dark patterns, artificial urgency.
Output only the raw JSON object. No markdown code blocks.`;
  },

  highlights(pageText) {
    return `You are a meticulous consumer protection analyst. Scan the product page below and identify specific verbatim text snippets that are red flags or positive signals.

## Page Content
${pageText.slice(0, 7000)}

Respond ONLY with valid JSON:
{
  "highlights": [
    {
      "id": "<unique id e.g. h1, h2>",
      "text": "<EXACT verbatim substring from Page Content, 4-25 words>",
      "comment": "<specific factual explanation of why this matters>",
      "sentiment": "<negative | positive>",
      "severity": "<high | medium | low | null>"
    }
  ]
}

CRITICAL RULES:
1. text must be an EXACT verbatim substring from the Page Content above. Do not paraphrase. 4-25 words.
2. comment must be specific and factual. Cite concrete reasons. Forbidden words: very, extremely, clearly, obviously, just, simply.
3. sentiment is binary: negative or positive only.
4. severity: high = fake urgency / suspicious claims, medium = vague policy / unverifiable claim, low = minor concern, null = positive.
5. Target 5-10 highlights. Quality over quantity.
6. Include at least 1 positive highlight if any exists on the page.

Output only the JSON object.`;
  },

  alternativeQueries(title, pageText) {
    return `You are a product research assistant. Based on the product below, generate exactly 3 search queries to find better or cheaper alternatives.

Product: ${title}
Context: ${pageText.slice(0, 1000)}

Respond ONLY with a JSON array of 3 strings:
["query 1", "query 2", "query 3"]

Output only the JSON array.`;
  },

  alternativesFilter(originalTitle, results) {
    const resultsText = results
      .map(r => `URL: ${r.url}\nTitle: ${r.title}\nSnippet: ${r.content}`)
      .join('\n---\n');
    return `You are a product analyst. From the search results below, extract the 3 best alternatives to "${originalTitle}".

## Search Results
${resultsText.slice(0, 5000)}

Respond ONLY with a JSON array:
[
  {
    "name": "<product name>",
    "service": "<store or platform>",
    "price": "<price string or 'N/A'>",
    "whyBetter": "<one sentence reason>",
    "url": "<URL from search results>"
  }
]

Only include real, relevant alternatives. Output only the JSON array.`;
  }
};
