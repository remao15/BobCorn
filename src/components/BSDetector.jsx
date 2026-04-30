export default function BSDetector() {
  return (
    <section id="bs-detector" className="py-20 md:py-28 bg-bone border-y-2 border-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <span className="tag-acid">Phase 2 · Design the solution</span>
            <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.05]">
              The BS Detector.
              <br />
              Verdict in 2&nbsp;seconds.
            </h2>
            <p className="mt-5 text-lg text-ink/70 leading-relaxed">
              We designed a disruptive but clean UX. The user lands on a product
              page, we scrape the title, price and reviews, fingerprint the bot
              pattern, and inject a high-contrast overlay right above the buy
              button. It forces a moment of reflection with three better
              alternatives, exactly when it matters.
            </p>

            <ul className="mt-7 space-y-3">
              <Feature>Fake-review fingerprinting in real time</Feature>
              <Feature>Brutal-truth verdict in plain English</Feature>
              <Feature>Three better alternatives, ranked by 12-month retention</Feature>
              <Feature>Works on Amazon, eBay, Walmart and Shopify. No account required.</Feature>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#install" className="btn-primary">Add to Chrome</a>
              <a href="#how-it-works" className="btn-ghost">How it works</a>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-6">
            <BadProductCard />
            <VerdictDeck />
          </div>
        </div>
      </div>
    </section>
  )
}

function Feature({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid place-items-center w-6 h-6 mt-0.5 bg-ink text-acid border-2 border-ink shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6.5l3 3 5-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
        </svg>
      </span>
      <span className="text-ink/85">{children}</span>
    </li>
  )
}

function BadProductCard() {
  return (
    <div className="card-brutal bg-blood text-paper p-6 sm:p-8 relative overflow-hidden">
      <div className="text-[11px] font-mono uppercase tracking-widest opacity-80">
        BS Score
      </div>
      <div className="mt-1 flex items-end gap-4">
        <div className="font-display font-bold text-[8rem] sm:text-[10rem] leading-[0.8] tracking-tight">
          92
        </div>
        <div className="pb-3 sm:pb-4">
          <div className="font-display font-bold text-2xl sm:text-3xl leading-tight">
            Probably trash.
          </div>
          <div className="text-xs font-mono uppercase tracking-wider opacity-70 mt-1">
            verdict in 1.8s
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t-2 border-paper/25">
        <div className="text-[11px] font-mono uppercase tracking-widest opacity-80">
          Brutal truth
        </div>
        <p className="mt-2 text-base sm:text-lg leading-snug font-medium">
          Battery dies in 4 months. 71% of 5-star reviews posted within an
          11-day window from accounts under 30 days old.
        </p>
        <div className="mt-4 text-xs font-mono opacity-60 truncate">
          on: "PRO MAX Bluetooth Earbuds 5.4: IPX9 Waterproof…"
        </div>
      </div>
    </div>
  )
}

function VerdictDeck() {
  const alts = [
    { name: 'Sony WF-C700N', price: '$98', tag: '4y avg lifespan', score: 86 },
    { name: 'Soundcore Liberty 4 NC', price: '$79', tag: 'best value', score: 81 },
    { name: 'Jabra Elite 4', price: '$89', tag: 'multipoint BT', score: 78 },
  ]
  return (
    <div className="card-brutal bg-ink text-paper p-6 sm:p-8">
      <span className="tag bg-acid text-ink border-acid">Buy these instead</span>
      <div className="mt-5 grid sm:grid-cols-3 gap-3">
        {alts.map((a) => (
          <div key={a.name} className="border-2 border-paper p-3 hover:bg-paper hover:text-ink transition-colors group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-70 group-hover:opacity-100">
                BS {100 - a.score}
              </span>
              <span className="font-display font-bold text-lg">{a.price}</span>
            </div>
            <div className="mt-2 font-bold text-sm leading-tight">{a.name}</div>
            <div className="mt-2 inline-block text-[10px] font-mono uppercase bg-acid text-ink border-2 border-acid px-1.5 py-0.5">
              {a.tag}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t-2 border-paper/15 flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest opacity-70">
          Avg saved per swap
        </span>
        <span className="font-display font-bold text-acid text-2xl">+ $34.20</span>
      </div>
    </div>
  )
}
