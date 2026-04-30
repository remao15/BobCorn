import { useState } from 'react'

const faqs = [
  {
    q: 'How does the BS Detector decide a product is bad?',
    a: 'We blend three signals: review-pattern fingerprinting (timing clustering, profile age, repetition), a known-product reputation database, and live price-vs-value benchmarking against verified alternatives. The score is the joint probability you regret the purchase in 90 days.',
  },
  {
    q: 'Where do the alternatives come from?',
    a: 'A curated index of products with verified long-term reviews. Minimum 12 months of usage data, sourced from independent review sites, Reddit threads we trust, and warranty-claim data where available.',
  },
  {
    q: 'Is connecting my bank actually safe?',
    a: 'We use Plaid for bank linking, the same infrastructure Venmo, Robinhood and Chime rely on. We get read-only access. We never see your password. We never store your credentials. You can revoke access from your bank or from BobCorn in two clicks.',
  },
  {
    q: 'Do you make money when I buy a recommended alternative?',
    a: 'Yes. That is exactly how the free tier stays free. We take an affiliate cut on alternatives. We disclose this on every recommendation. Our incentive is to send you to a product you actually keep, because returns hurt our payouts as much as yours.',
  },
  {
    q: 'Will the overlay break the page I am on?',
    a: 'It is a single fixed-position element rendered into a shadow root with a high z-index. It does not modify the host page DOM, does not intercept clicks outside its own bounds, and ships with a one-click dismiss.',
  },
  {
    q: 'Can I get the audit without linking my bank?',
    a: 'Yes. Pro includes a manual mode where you paste in your subscriptions and we still surface cheaper alternatives. The bank link just makes detection automatic.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="py-20 md:py-28 bg-bone border-y-2 border-ink">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="tag">FAQ</span>
          <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl tracking-tight">
            Yes, we get this a lot.
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={`card-brutal ${isOpen ? 'shadow-brutal' : 'shadow-brutal-sm'}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 text-left p-5"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-base sm:text-lg">{f.q}</span>
                  <span
                    className={`grid place-items-center w-7 h-7 border-2 border-ink shrink-0 transition-transform ${isOpen ? 'rotate-45 bg-ink text-acid' : 'bg-acid text-ink'}`}
                    aria-hidden="true"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 -mt-1 text-ink/75 leading-relaxed border-t-2 border-ink/10 pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
