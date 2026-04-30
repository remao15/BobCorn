import { useEffect, useState } from 'react'
import Logo from './Logo'

const links = [
  { href: '#bs-detector', label: 'Solution' },
  { href: '#build-story', label: 'How we built it' },
  { href: '#demo', label: 'Demo' },
  { href: '#pricing', label: 'Business model' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar({ onOpenAnalyzer }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      id="top"
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? 'bg-paper/90 backdrop-blur border-b-2 border-ink'
          : 'bg-transparent border-b-2 border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-ink/80 hover:text-ink underline-offset-4 hover:underline decoration-2"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenAnalyzer}
              className="btn-acid !py-2 !px-4 text-sm"
            >
              Test it out
            </button>
          </div>
          <button
            type="button"
            className="md:hidden border-2 border-ink p-2"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-ink/80 hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenAnalyzer?.()
              }}
              className="btn-acid !py-2 !px-4 text-sm w-fit"
            >
              Test it out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
