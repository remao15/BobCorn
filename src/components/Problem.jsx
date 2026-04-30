export default function Problem() {
  return (
    <section className="py-20 md:py-28 border-b-2 border-ink/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="tag">Phase 1 · Plan &amp; Analyze</span>
          <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            We started by identifying two problems that cost real money.
          </h2>
          <p className="mt-4 text-lg text-ink/70 leading-relaxed">
            Fake reviews, dark-pattern checkouts and "set-and-forget" subscriptions
            were all engineered to make people spend more without thinking. The
            problem matters because consumers lack an instant, unbiased reality
            check at the point of sale, and inertia keeps them locked into
            services they outgrew years ago.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-6 lg:gap-8">
          <PainCard
            stat="43%"
            caption="Fake Amazon reviews · 2023 estimate"
            refN="1"
            title="Review manipulation"
            body="Five-star ratings are a marketing channel now. The product you're about to buy was reviewed by bots, bribed users and 'verified purchasers' who never used it."
          />
          <PainCard
            stat="$219"
            caption="Avg US monthly sub spend · 2024"
            refN="2"
            title="Subscription blindness"
            body={
              <>
                Consumers actually paid $219 a month on subscriptions in 2024,
                but believed they paid just $86. That gap adds up to roughly
                $1,596 per year per consumer<SourceRef n="3" />. You signed up
                once. You forgot. The price went up. Nobody told you.
              </>
            }
          />
        </div>
      </div>
    </section>
  )
}

function PainCard({ stat, caption, refN, title, body }) {
  return (
    <article className="card-brutal p-6 sm:p-8 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all">
      <div className="font-display font-bold text-6xl sm:text-7xl leading-none text-blood tracking-tight">
        {stat}
      </div>
      <div className="mt-3 pt-3 border-t-2 border-ink/10 text-[11px] font-mono uppercase tracking-widest text-ink/60">
        {caption}
        {refN && <SourceRef n={refN} />}
      </div>
      <h3 className="mt-6 font-display font-bold text-2xl">{title}</h3>
      <p className="mt-2 text-ink/70 leading-relaxed">{body}</p>
    </article>
  )
}

function SourceRef({ n }) {
  return (
    <a
      href="#sources"
      className="ml-1 align-super text-[10px] font-mono font-bold text-ink/70 hover:text-blood underline underline-offset-2 decoration-2 no-underline hover:no-underline"
      aria-label={`Source ${n}`}
    >
      [{n}]
    </a>
  )
}
