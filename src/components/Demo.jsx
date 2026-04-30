const steps = [
  {
    label: 'Open the rigged listing',
    body: 'We start on a live Amazon product page for a generic-brand fast charger with 14k five-star reviews.',
  },
  {
    label: 'Watch the overlay drop',
    body: 'BobCorn injects the BS Detector above the buy button. BS score 87. Brutal truth visible. Three vetted alternatives ranked.',
  },
  {
    label: 'Click the better option',
    body: 'One tap takes us to the alternative. The user spends less, gets a product that lasts, and we earn an affiliate cut.',
  },
  {
    label: 'Switch to the dashboard',
    body: 'Tab over to the Auditor. "Total Wasted This Year: $1,283." Three Migrate buttons queued. Demo ends with a one-click Approve All.',
  },
]

export default function Demo({ onOpenAnalyzer }) {
  return (
    <section id="demo" className="py-20 md:py-28 bg-bone border-y-2 border-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            The 3-minute golden path.
          </h2>
          <p className="mt-4 text-lg text-ink/70 leading-relaxed">
            This is what we walk you through, live, in the demo. Four beats,
            one continuous click-path, no slides between screens.
          </p>
        </div>

        <ol className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <li key={s.label} className="card-brutal p-5 sm:p-6 bg-paper relative">
              <span className="absolute -top-3 -left-3 grid place-items-center w-9 h-9 bg-blood text-paper border-2 border-ink font-display font-bold text-sm shadow-brutal-sm">
                {i + 1}
              </span>
              <div className="font-display font-bold text-lg leading-tight mt-2">
                {s.label}
              </div>
              <p className="mt-3 text-sm text-ink/75 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <button type="button" onClick={onOpenAnalyzer} className="btn-primary">
            <PlayIcon /> Run the demo
          </button>
          <a href="#pricing" className="btn-ghost">
            See the business model →
          </a>
        </div>
      </div>
    </section>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  )
}
