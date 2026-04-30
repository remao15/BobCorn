export default function CTA() {
  return (
    <section id="install" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="card-brutal bg-acid p-8 sm:p-12 lg:p-16 shadow-brutal-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-ink rounded-full opacity-5" />
          <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-ink rounded-full opacity-5" />

          <div className="relative grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <span className="tag bg-ink text-acid border-acid">The ask</span>
              <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.0]">
                That is the pitch.
                <br />
                Let us
                <br />
                <span className="bg-ink text-acid px-2 -mx-1 inline-block">show you.</span>
              </h2>
              <p className="mt-5 text-lg text-ink/80 max-w-xl leading-relaxed">
                You have seen the problem, the solution, the build story and the
                business model. The only thing left is the live demo. Three
                minutes, four clicks, one very honest browser extension.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <a href="#demo" className="btn-primary text-lg w-full !py-4">
                Run the live demo
              </a>
              <a href="https://github.com/heron4gf" className="bg-paper text-ink font-display font-bold px-6 py-4 border-2 border-ink shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-center text-lg">
                Source on GitHub
              </a>
              <div className="text-xs font-mono text-ink/70 text-center mt-1">
                Built in 2 hours · 4 devs · 1 AI agent
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
