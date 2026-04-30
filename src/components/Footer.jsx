import Logo from './Logo'

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'BS Detector', href: '#bs-detector' },
      { label: 'Subscription Auditor', href: '#auditor' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Manifesto', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: 'mailto:hello@bobcorn.dev' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'Sources & data', href: '#sources' },
      { label: 'Privacy', href: '#' },
      { label: 'Affiliate disclosure', href: '#' },
      { label: 'Terms', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-ink text-paper border-t-2 border-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-9 h-9 bg-acid text-ink border-2 border-acid font-display font-bold text-base">
                BS
              </span>
              <span className="font-display font-bold text-xl tracking-tight">BobCorn</span>
            </div>
            <p className="mt-4 text-paper/70 max-w-sm leading-relaxed">
              The brutally honest layer the internet forgot. Built for people who
              are tired of being the product.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a href="https://github.com/heron4gf" className="border-2 border-paper p-2 hover:bg-acid hover:text-ink hover:border-acid transition-colors" aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/></svg>
              </a>
              <a href="#" className="border-2 border-paper p-2 hover:bg-acid hover:text-ink hover:border-acid transition-colors" aria-label="X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3.4l-7.4 8.5L22 21h-6.8l-5.3-6.9L3.7 21H.3l7.9-9L0 3h7l4.8 6.4L17.5 3Zm-1.2 16h1.9L7.8 5H5.8l10.5 14Z"/></svg>
              </a>
              <a href="#" className="border-2 border-paper p-2 hover:bg-acid hover:text-ink hover:border-acid transition-colors" aria-label="Product Hunt">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0Zm1.4 13.6h-3v3.4H8V7h5.4a3.3 3.3 0 1 1 0 6.6Zm0-4.6h-3V12h3a1.4 1.4 0 0 0 0-2.8Z"/></svg>
              </a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="md:col-span-2">
              <div className="font-display font-bold text-sm uppercase tracking-widest text-acid">
                {c.title}
              </div>
              <ul className="mt-4 space-y-2">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-paper/80 hover:text-paper hover:underline underline-offset-4 decoration-2 text-sm">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-1" />
        </div>

        <div className="mt-14 pt-6 border-t-2 border-paper/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-paper/60">
          <div>© 2026 BobCorn. Made with mild outrage.</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cash animate-flash" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
