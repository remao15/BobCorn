import HeroPreview from './HeroPreview'

export default function Hero({ onOpenAnalyzer }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <h1
              className="font-display font-bold tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[0.95] animate-fade-up"
              style={{ animationDelay: '120ms' }}
            >
              Frictionless 1-click buying tricks people into{' '}
              <span className="relative inline-block">
                <span className="relative z-10">wasting money.</span>
                <span
                  className="absolute inset-x-0 bottom-1 h-4 bg-acid -z-0 origin-left animate-draw"
                  style={{ animationDelay: '650ms' }}
                  aria-hidden="true"
                />
              </span>
              <br />
              <span className="bg-ink text-paper px-2 -mx-1 inline-block">We fixed that.</span>
            </h1>

            <p
              className="mt-6 text-lg sm:text-xl text-ink/75 max-w-2xl leading-relaxed animate-fade-up"
              style={{ animationDelay: '280ms' }}
            >
              We identified that fake reviews and silent subscription creep cost
              the average US consumer about $1,596 a year, and that nobody has
              an unbiased reality check at the point of sale. So we built
              adCheck: a free browser extension that grades any product in two
              seconds, plus a paid dashboard that hunts down the subscriptions
              silently draining your bank account.
            </p>

            <div
              className="mt-8 flex flex-wrap items-center gap-4 animate-fade-up"
              style={{ animationDelay: '420ms' }}
            >
              <button type="button" onClick={onOpenAnalyzer} className="btn-acid">
                <PlayIcon /> Try the BS Detector
              </button>
              <a href="#build-story" className="btn-ghost">
                How we built it →
              </a>
            </div>

            <div
              className="mt-10 grid grid-cols-3 gap-4 max-w-lg animate-fade-up"
              style={{ animationDelay: '560ms' }}
            >
              <Stat value="43%" label="Amazon reviews flagged fake (2023)" tone="blood" refN="1" />
              <Stat value="$1,596" label="avg yearly subscription blind spot (2024)" tone="blood" refN="3" />
              <Stat value="2 hrs" label="hackathon build" tone="acid" />
            </div>
          </div>

          <div
            className="lg:col-span-5 animate-fade-up"
            style={{ animationDelay: '180ms' }}
          >
            <HeroPreview />
          </div>
        </div>
      </div>

      <div className="absolute -top-32 -right-32 w-[32rem] h-[32rem] rounded-full bg-acid blur-3xl opacity-50 -z-10 animate-blob" />
      <div
        className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-blood blur-3xl opacity-20 -z-10 animate-blob"
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="absolute -bottom-40 right-1/4 w-[24rem] h-[24rem] rounded-full bg-sky blur-3xl opacity-15 -z-10 animate-blob"
        style={{ animationDelay: '-9s' }}
      />
    </section>
  )
}

function Stat({ value, label, refN, tone }) {
  const borderTone =
    tone === 'blood' ? 'border-blood' : tone === 'acid' ? 'border-acid' : 'border-ink'
  const valueTone =
    tone === 'blood' ? 'text-blood' : tone === 'acid' ? 'text-ink' : 'text-ink'
  const valueBg = tone === 'acid' ? 'bg-acid px-1.5 -mx-1' : ''
  return (
    <div className={`border-l-4 ${borderTone} pl-3`}>
      <div className={`font-display font-bold text-2xl tabular-nums ${valueTone}`}>
        <span className={valueBg}>{value}</span>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink/60 font-mono leading-snug mt-0.5">
        {label}
        {refN && (
          <a
            href="#sources"
            className="ml-1 align-super font-bold text-ink/70 hover:text-blood"
            aria-label={`Source ${refN}`}
          >
            [{refN}]
          </a>
        )}
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  )
}
