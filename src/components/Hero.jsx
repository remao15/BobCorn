import HeroPreview from './HeroPreview'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-6">
              <span className="tag-acid">
                <span className="w-1.5 h-1.5 rounded-full bg-ink animate-flash" />
                Hackathon prototype, ready to ship
              </span>
              <span className="tag bg-paper text-ink">v1.0 demo</span>
            </div>

            <h1 className="font-display font-bold tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
              Frictionless 1-click buying tricks people into{' '}
              <span className="relative inline-block">
                <span className="relative z-10">wasting money.</span>
                <span className="absolute inset-x-0 bottom-1 h-4 bg-acid -z-0" aria-hidden="true" />
              </span>
              <br />
              <span className="bg-ink text-paper px-2 -mx-1">We fixed that.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-ink/75 max-w-2xl leading-relaxed">
              We identified that fake reviews and silent subscription creep cost
              the average US consumer about $1,596 a year, and that nobody has
              an unbiased reality check at the point of sale. So we built
              BobCorn: a free browser extension that grades any product in two
              seconds, plus a paid dashboard that hunts down the subscriptions
              silently draining your bank account.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#demo" className="btn-acid">
                <PlayIcon /> Watch the 3-min demo
              </a>
              <a href="#build-story" className="btn-ghost">
                How we built it →
              </a>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              <Stat value="43%" label="Amazon reviews flagged fake (2023)" refN="1" />
              <Stat value="$1,596" label="avg yearly subscription blind spot (2024)" refN="3" />
              <Stat value="2 hrs" label="hackathon build" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroPreview />
          </div>
        </div>
      </div>

      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-acid blur-3xl opacity-30 -z-10" />
      <div className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-blood blur-3xl opacity-15 -z-10" />
    </section>
  )
}

function Stat({ value, label, refN }) {
  return (
    <div className="border-l-4 border-ink pl-3">
      <div className="font-display font-bold text-2xl">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-ink/60 font-mono leading-snug">
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
