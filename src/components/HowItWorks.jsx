const steps = [
  {
    n: '01',
    title: 'Install in 7 seconds',
    body: 'One click on the Chrome Web Store. No account, no credit card, no email upsell. The extension wakes up the moment you land on a product page.',
  },
  {
    n: '02',
    title: 'We grade in real time',
    body: 'BobCorn scrapes the title, price and reviews, fingerprints the bot patterns, cross-references known fail-rate data, and produces a BS score before the page finishes painting.',
  },
  {
    n: '03',
    title: 'Swap or skip',
    body: 'A high-contrast overlay drops above the buy button. Three alternatives, ranked by real-world durability. One click takes you to the better option, or dismiss and buy anyway. Your call.',
  },
  {
    n: '04',
    title: 'Audit the rest',
    body: 'Connect your bank read-only and we hunt down every overpriced recurring charge in your statement. Approve cancellations and migrations from a single dashboard.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-ink text-paper border-y-2 border-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Four steps. About forty seconds total.
          </h2>
          <p className="mt-4 text-lg text-paper/70 leading-relaxed">
            From install to "wait, I just saved $400 a year." Here is the exact
            flow we walk users through, and the same flow you will see in our
            three-minute demo.
          </p>
        </div>

        <ol className="mt-14 grid md:grid-cols-2 gap-6 lg:gap-8">
          {steps.map((s) => (
            <li key={s.n} className="bg-paper text-ink card-brutal p-6 sm:p-8 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all">
              <div className="flex items-center gap-3">
                <span className="font-display font-bold text-5xl text-acid bg-ink px-3 py-1 border-2 border-ink shadow-brutal-sm">
                  {s.n}
                </span>
                <div className="font-display font-bold text-2xl">{s.title}</div>
              </div>
              <p className="mt-4 text-ink/75 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
