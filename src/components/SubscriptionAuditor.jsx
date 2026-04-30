export default function SubscriptionAuditor() {
  return (
    <section id="auditor" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <Dashboard />
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-24">
            <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.05]">
              The Subscription
              <br />
              Auditor.
            </h2>
            <p className="mt-5 text-lg text-ink/70 leading-relaxed">
              The second half of our solution. The user connects their bank
              read-only, we scan every recurring charge, score each subscription
              on price-vs-utility, and queue up cancellations and migrations
              they can approve in one tap. This is where we monetise: $5/mo,
              pays for itself in the first audit.
            </p>

            <ul className="mt-7 space-y-3">
              <Feature refN="4">Auto-detects recurring charges via Plaid bank-link, with 200+ new institutions added in 2025 alone</Feature>
              <Feature>"Total Wasted" counter, refreshed monthly</Feature>
              <Feature>Cheaper, comparable alternatives for every overpriced service</Feature>
              <Feature>One-click cancellation flows where supported</Feature>
              <Feature>Bank-grade encryption. Read-only. Never stores credentials.</Feature>
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#pricing" className="btn-primary">Start free trial</a>
              <a href="#faq" className="btn-ghost">Is this safe?</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Feature({ children, refN }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid place-items-center w-6 h-6 mt-0.5 bg-ink text-acid border-2 border-ink shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6.5l3 3 5-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
        </svg>
      </span>
      <span className="text-ink/85">
        {children}
        {refN && (
          <a
            href="#sources"
            className="ml-1 align-super text-[10px] font-mono font-bold text-ink/70 hover:text-blood"
            aria-label={`Source ${refN}`}
          >
            [{refN}]
          </a>
        )}
      </span>
    </li>
  )
}

function Dashboard() {
  const subs = [
    { name: 'Netflix Premium', price: 22.99, util: 6, bad: true, alt: 'Standard $15.49, same household' },
    { name: 'Adobe Creative Cloud', price: 59.99, util: 4, bad: true, alt: 'Affinity Suite, $69 once' },
    { name: 'Peloton App+', price: 24.0, util: 2, bad: true, alt: 'YouTube Fitness, free' },
    { name: 'Notion AI', price: 10.0, util: 8, bad: false },
    { name: 'iCloud+ 200GB', price: 2.99, util: 9, bad: false },
  ]
  const wasted = subs.filter((s) => s.bad).reduce((sum, s) => sum + s.price, 0) * 12

  return (
    <div className="card-brutal overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-ink bg-bone">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cash border-2 border-ink" />
          <span className="font-mono text-xs">app.bobcorn.dev/dashboard</span>
        </div>
        <span className="text-xs font-mono text-ink/60">Apr 2026</span>
      </div>

      <div className="p-5 sm:p-6 bg-ink text-paper border-b-2 border-ink border-t-[6px] border-t-blood">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-blood font-bold">
            Total wasted this year
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-blood animate-flash" />
        </div>
        <div
          className="mt-1 font-display font-black text-5xl sm:text-6xl tracking-tight tabular-nums text-blood"
          style={{ textShadow: '0 0 28px rgba(255,45,32,0.3)' }}
        >
          ${wasted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="mt-2 text-sm text-paper/85">
          Across {subs.filter((s) => s.bad).length} overpriced subscriptions. We can
          fix that today.
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-3">
        {subs.map((s) => (
          <SubRow key={s.name} {...s} />
        ))}
      </div>

      <div className="px-5 sm:px-6 py-4 border-t-2 border-ink bg-bone flex items-center justify-between gap-3">
        <div className="text-xs font-mono text-ink/70">
          3 cancellations queued · est. annual saving{' '}
          <span className="text-ink font-bold">
            ${Math.round(wasted).toLocaleString('en-US')}
          </span>
        </div>
        <button className="btn-acid !py-2 !px-4 text-sm">Approve all</button>
      </div>
    </div>
  )
}

function SubRow({ name, price, util, bad, alt }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-ink p-3 ${bad ? 'bg-blood/5' : 'bg-paper'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 grid place-items-center border-2 border-ink font-display font-bold shrink-0 ${bad ? 'bg-blood text-paper' : 'bg-cash text-ink'}`}>
          {name.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm truncate">{name}</div>
          <div className="text-[11px] font-mono text-ink/60 flex items-center gap-2">
            <span>${price.toFixed(2)}/mo</span>
            <span>·</span>
            <span>utility {util}/10</span>
          </div>
          {bad && alt && (
            <div className="mt-1 text-[11px] text-blood font-bold">→ {alt}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {bad ? (
          <>
            <button className="text-xs font-display font-bold border-2 border-ink bg-acid px-3 py-1.5 shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
              Migrate
            </button>
            <button className="text-xs font-display font-bold border-2 border-ink bg-paper px-3 py-1.5 hover:bg-ink hover:text-paper transition-colors">
              Cancel
            </button>
          </>
        ) : (
          <span className="text-[11px] font-mono uppercase tracking-wider bg-cash text-ink border-2 border-ink px-2 py-1">
            keep
          </span>
        )}
      </div>
    </div>
  )
}
