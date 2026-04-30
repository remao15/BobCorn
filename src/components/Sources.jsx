const sources = [
  {
    n: '1',
    claim: '~43% of Amazon reviews flagged as fake or inauthentic in 2023',
    org: 'Capital One Shopping, citing Fakespot 2023 estimate',
    pub: 'Fake Review Statistics, 2026',
    url: 'https://capitaloneshopping.com/research/fake-review-statistics/',
    note: 'Independent estimate, not industry consensus. Methodology disputed by Amazon.',
  },
  {
    n: '2',
    claim: 'US consumers spent ~$219/mo on subscriptions in 2024 vs. estimated $86',
    org: 'C+R Research subscription study',
    pub: '2024',
    url: 'https://www.crresearch.com/news/',
    note: 'Self-report survey. Widely cited in business media.',
  },
  {
    n: '3',
    claim: '$1,596/year subscription blind spot per US consumer',
    org: 'C+R Research subscription study',
    pub: '2024',
    url: 'https://www.crresearch.com/news/',
    note: 'Calculated from the gap between reported and actual monthly spend.',
  },
  {
    n: '4',
    claim: 'Plaid added 200+ additional financial institutions in 2025',
    org: 'Plaid, "What we shipped in 2025"',
    pub: 'January 2026',
    url: 'https://plaid.com/blog/2025-year-in-review/',
    note: 'Official Plaid year-in-review blog post.',
  },
]

export default function Sources() {
  return (
    <section id="sources" className="py-16 md:py-20 bg-bone border-t-2 border-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="tag">Sources</span>
            <h2 className="mt-3 font-display font-bold text-2xl sm:text-3xl tracking-tight">
              Every stat on this page, with receipts.
            </h2>
          </div>
          <div className="text-xs font-mono text-ink/60 max-w-md">
            Claims framed as our own product output (BS scores, dashboard
            amounts, alternative products) are illustrative demo data. Claims
            framed as research are sourced below.
          </div>
        </div>

        <ol className="mt-8 grid md:grid-cols-2 gap-4">
          {sources.map((s) => (
            <li key={s.n} className="card-brutal p-4 sm:p-5 bg-paper">
              <div className="flex items-start gap-3">
                <span className="grid place-items-center w-8 h-8 bg-ink text-acid border-2 border-ink font-display font-bold text-sm shrink-0">
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm leading-snug">{s.claim}</div>
                  <div className="mt-1.5 text-xs font-mono text-ink/70">
                    {s.org} · <span className="text-ink/50">{s.pub}</span>
                  </div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-mono text-ink hover:text-blood underline underline-offset-2 decoration-2 break-all"
                  >
                    {s.url}
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M4 2h6v6M10 2L4 8M3 5v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                  </a>
                  <div className="mt-2 text-[11px] text-ink/55 italic leading-snug">
                    {s.note}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
