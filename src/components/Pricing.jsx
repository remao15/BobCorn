const tiers = [
  {
    name: 'BS Detector',
    price: '$0',
    cadence: 'forever',
    desc: 'The free Chrome extension. Use it before every checkout.',
    features: [
      'Real-time BS score on Amazon, eBay, Walmart, Shopify',
      'Fake-review fingerprinting',
      '3 better alternatives per product',
      'Local-first. No account required.',
      'Affiliate-funded. Never paywalled.',
    ],
    cta: 'Add to Chrome',
    href: '#install',
    accent: false,
  },
  {
    name: 'Auditor Pro',
    price: '$5',
    cadence: 'per month',
    desc: 'Everything free, plus the financial audit on top.',
    features: [
      'Bank-linked subscription audit',
      'Total Wasted dashboard, refreshed monthly',
      'One-click cancellation queue',
      'Migration suggestions for every overpriced sub',
      'Email + Slack alerts when prices creep up',
      'Cancel anytime. Pays for itself in week one.',
    ],
    cta: 'Start 14-day trial',
    href: '#trial',
    accent: true,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="tag">Phase 5 · The business model</span>
          <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Two revenue streams.
            <br />
            Both aligned with the user.
          </h2>
          <p className="mt-4 text-lg text-ink/70 leading-relaxed">
            The free extension earns affiliate revenue when we route a user
            from a bad product to a better one. The paid auditor is a $5/mo
            subscription that pays for itself the moment we cancel one bloated
            sub on the user's behalf. Incentives line up: we win when users
            spend less, not more.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-6 lg:gap-8">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`card-brutal p-6 sm:p-8 flex flex-col ${
                t.accent ? 'bg-ink text-paper shadow-brutal-acid' : 'bg-paper'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display font-bold text-2xl">{t.name}</div>
                  <div className={`text-sm ${t.accent ? 'text-paper/70' : 'text-ink/60'}`}>{t.desc}</div>
                </div>
                {t.accent && (
                  <span className="tag-acid">Most loved</span>
                )}
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display font-bold text-6xl tracking-tight">{t.price}</span>
                <span className={`font-mono text-sm ${t.accent ? 'text-paper/60' : 'text-ink/60'}`}>{t.cadence}</span>
              </div>

              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className={`grid place-items-center w-5 h-5 mt-0.5 border-2 shrink-0 ${t.accent ? 'border-acid bg-acid text-ink' : 'border-ink bg-ink text-acid'}`}>
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.5l3 3 5-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                      </svg>
                    </span>
                    <span className={`text-sm ${t.accent ? 'text-paper/90' : 'text-ink/85'}`}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={t.href}
                className={`mt-8 ${t.accent ? 'btn-acid' : 'btn-primary'}`}
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
