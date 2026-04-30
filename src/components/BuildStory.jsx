const phases = [
  {
    n: '03',
    label: 'Develop',
    title: 'Built in parallel, shipped in two hours.',
    body: 'Four developers, four branches, one Manifest V3 extension and a static dashboard. We split the work across extension foundation, the BS Detector overlay, mock data, and the subscription dashboard, then merged on a single demo branch.',
    chips: ['Manifest V3', 'Vanilla JS', 'React + Tailwind', 'Mock JSON APIs'],
  },
  {
    n: '04',
    label: 'Test',
    title: 'Validated against live Amazon pages.',
    body: 'We tested the DOM injection on real product pages to confirm the overlay triggers on target URLs without breaking the host site\'s CSS or interactivity. The dismiss flow, the Add-to-Cart path, and the alternative click-throughs all work end to end.',
    chips: ['Live DOM testing', 'Shadow DOM isolation', 'Click-path rehearsed'],
  },
  {
    n: '05',
    label: 'Deploy',
    title: 'A real launch path, not vapourware.',
    body: 'Our shipping plan: publish the extension to the Chrome Web Store, swap the mock JSON files for live Perplexity calls on the detector side, and wire Plaid into the auditor for real bank-linked transaction data. None of this is exotic.',
    chips: ['Chrome Web Store', 'Perplexity API', 'Plaid bank link'],
  },
]

export default function BuildStory() {
  return (
    <section id="build-story" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <span className="tag">Phase 3, 4, 5 · How we built it</span>
            <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl tracking-tight leading-[1.05]">
              From idea to working prototype in one afternoon.
            </h2>
            <p className="mt-5 text-lg text-ink/70 leading-relaxed">
              We treated this like a real product, not a hackathon throwaway.
              Clear phase ownership, parallel branches, mock data designed to
              swap 1-to-1 with the real APIs on launch day.
            </p>

            <div className="mt-8 card-brutal bg-acid p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center w-9 h-9 bg-ink text-acid border-2 border-ink font-display font-bold text-sm">
                  AI
                </span>
                <div>
                  <div className="font-display font-bold text-base">Built with Bob</div>
                  <div className="text-xs font-mono uppercase tracking-widest text-ink/70">our agent collaborator</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink/85 leading-relaxed">
                Bob generated our Amazon DOM-scraping logic, scaffolded the
                Manifest V3 boilerplate, and structured the mock JSON databases
                that simulate our Perplexity and Plaid endpoints. We ran four
                Bob agents in parallel, one per branch.
              </p>
            </div>
          </div>

          <ol className="lg:col-span-7 space-y-5">
            {phases.map((p) => (
              <li key={p.n} className="card-brutal p-6 sm:p-8 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-brutal-lg transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-4xl text-acid bg-ink px-3 py-1 border-2 border-ink shadow-brutal-sm">
                    {p.n}
                  </span>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-widest text-ink/60">{p.label}</div>
                    <div className="font-display font-bold text-xl sm:text-2xl leading-tight">
                      {p.title}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-ink/75 leading-relaxed">{p.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.chips.map((c) => (
                    <span key={c} className="text-[11px] font-mono uppercase tracking-wider bg-bone border-2 border-ink px-2 py-1">
                      {c}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
