import { useEffect, useRef, useState } from 'react'
import { analyzeUrl, isLiveMode } from '../lib/analyze'

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function useCountUp(target, active) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active || typeof target !== 'number') {
      setN(typeof target === 'number' ? target : 0)
      return
    }
    let raf
    let start = null
    const duration = 1400
    const step = (ts) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setN(Math.round(target * easeOutCubic(p)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => raf && cancelAnimationFrame(raf)
  }, [target, active])
  return n
}

function isUrl(s) {
  try {
    const u = new URL(s.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export default function EarlyAccessModal({ open, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    setTimeout(() => inputRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function handleSubmit(e) {
    e?.preventDefault()
    const url = input.trim()
    if (!url || loading) return
    if (!isUrl(url)) {
      setError('Paste a full URL starting with http:// or https://')
      return
    }
    setError(null)
    setMessages((m) => [...m, { role: 'user', content: url, id: Date.now() }])
    setInput('')
    setLoading(true)

    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const result = await analyzeUrl(url, ctrl.signal)
      setMessages((m) => [
        ...m,
        { role: 'bot', content: result, sourceUrl: url, id: Date.now() + 1 },
      ])
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((m) => [
          ...m,
          { role: 'error', content: err.message || 'Something broke. Try again.', id: Date.now() + 2 },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    abortRef.current?.abort()
    setMessages([])
    setInput('')
    setError(null)
    setLoading(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center bg-ink/70 backdrop-blur-sm p-0 sm:p-6 animate-fade-up"
      onClick={onClose}
    >
      <div
        className="card-brutal bg-paper w-full sm:max-w-2xl sm:max-h-[90vh] flex flex-col overflow-hidden shadow-brutal-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ea-title"
      >
        <header className="flex items-center justify-between gap-3 px-5 py-3 bg-ink text-paper border-b-2 border-ink">
          <div className="flex items-center gap-2 min-w-0">
            <span className="grid place-items-center w-8 h-8 bg-acid text-ink border-2 border-acid font-display font-bold text-sm shrink-0">
              BS
            </span>
            <div className="min-w-0">
              <div id="ea-title" className="font-display font-bold text-base leading-none">
                adCheck. Test it out
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest mt-1 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveMode() ? 'bg-cash animate-flash' : 'bg-acid'}`} />
                {isLiveMode() ? 'live · web-search grounded' : 'demo mode · mock data'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="text-[11px] font-mono uppercase tracking-widest text-paper/70 hover:text-paper border-2 border-paper/30 hover:border-paper px-2 py-1 transition-colors"
              >
                clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="grid place-items-center w-8 h-8 border-2 border-paper/30 hover:bg-paper hover:text-ink transition-colors"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
              </svg>
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-4 bg-paper">
          {messages.length === 0 && !loading && <EmptyState />}

          {messages.map((m) => {
            if (m.role === 'user') return <UserBubble key={m.id} url={m.content} />
            if (m.role === 'error') return <ErrorBubble key={m.id} message={m.content} />
            return <BotResult key={m.id} data={m.content} sourceUrl={m.sourceUrl} />
          })}

          {loading && <LoadingBubble />}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-stretch gap-2 p-3 sm:p-4 bg-bone border-t-2 border-ink"
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="url"
            placeholder="Paste a product URL…"
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              if (error) setError(null)
            }}
            disabled={loading}
            className="flex-1 min-w-0 bg-paper text-ink border-2 border-ink px-3 py-2.5 font-mono text-sm placeholder:text-ink/40 focus:outline-none focus:shadow-brutal-sm focus:-translate-x-[1px] focus:-translate-y-[1px] transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-acid !py-2 !px-4 text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal"
          >
            {loading ? 'Analyzing…' : 'Detect BS →'}
          </button>
        </form>
        {error && (
          <div className="px-4 sm:px-6 py-2 bg-blood text-paper text-xs font-mono">{error}</div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <div className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-3">
        Paste a link.
        <br />
        Get the truth.
      </div>
      <p className="text-ink/60 max-w-sm mx-auto leading-relaxed text-sm">
        Drop any product URL below. adCheck analyzes it, scores the BS, and surfaces three
        better alternatives.
      </p>
    </div>
  )
}

function UserBubble({ url }) {
  return (
    <div className="flex justify-end animate-fade-up">
      <div className="max-w-[85%] bg-ink text-paper border-2 border-ink shadow-brutal-sm px-3 py-2 break-all font-mono text-xs sm:text-sm">
        {url}
      </div>
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="flex items-center gap-3 animate-fade-up">
      <div className="grid place-items-center w-8 h-8 bg-acid text-ink border-2 border-ink font-display font-bold text-xs shrink-0">
        BS
      </div>
      <div className="card-brutal bg-paper px-3 py-2 flex items-center gap-2 font-mono text-xs">
        <span>Analyzing</span>
        <span className="flex gap-0.5">
          <Dot delay="0ms" />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </span>
      </div>
    </div>
  )
}

function Dot({ delay }) {
  return (
    <span
      className="w-1.5 h-1.5 rounded-full bg-ink animate-flash"
      style={{ animationDelay: delay }}
    />
  )
}

function ErrorBubble({ message }) {
  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <div className="grid place-items-center w-8 h-8 bg-blood text-paper border-2 border-ink font-display font-bold text-xs shrink-0">
        !
      </div>
      <div className="card-brutal bg-paper border-blood px-3 py-2 flex-1 text-sm">
        <div className="text-[10px] font-mono uppercase tracking-widest text-blood font-bold mb-1">
          API error
        </div>
        <div className="font-mono text-xs text-ink/80 break-words">{message}</div>
      </div>
    </div>
  )
}

function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function buildSearchUrl(productName, _price, sourceUrl) {
  const domain = getDomainFromUrl(sourceUrl || '')
  if (domain?.includes('amazon')) {
    const tld = domain.split('.').slice(-2).join('.')
    return `https://www.${tld}/s?k=${encodeURIComponent(productName)}`
  }
  if (domain?.includes('ebay')) {
    const tld = domain.split('.').slice(-2).join('.')
    return `https://www.${tld}/sch/i.html?_nkw=${encodeURIComponent(productName)}`
  }
  return `https://www.google.com/search?q=${encodeURIComponent(productName)}`
}

function BotResult({ data, sourceUrl }) {
  const score = useCountUp(data?.bsScore ?? 0, true)
  const verdict = data?.verdict || 'WARNING'
  const verdictColors = {
    CLEAN: { bg: 'bg-cash', text: 'text-ink' },
    WARNING: { bg: 'bg-acid', text: 'text-ink' },
    SUSPICIOUS: { bg: 'bg-blood', text: 'text-paper' },
  }[verdict] || { bg: 'bg-ink', text: 'text-paper' }

  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <div className="grid place-items-center w-8 h-8 bg-acid text-ink border-2 border-ink font-display font-bold text-xs shrink-0">
        BS
      </div>
      <div className="flex-1 min-w-0 space-y-3">
        <div className="card-brutal bg-ink text-paper p-4 sm:p-5 border-t-[5px] border-t-blood">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[10px] font-mono uppercase tracking-widest ${verdictColors.bg} ${verdictColors.text} px-1.5 py-0.5 font-bold border-2 ${verdictColors.bg} shrink-0`}>
                {verdict}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-paper/60 truncate">
                {data?.product?.vendor || 'unknown vendor'}
              </span>
            </div>
            {data?.product?.price && (
              <span className="font-display font-bold text-base text-paper">{data.product.price}</span>
            )}
          </div>

          <div className="mt-2 flex items-end gap-3">
            <div
              className="font-display font-black text-5xl sm:text-6xl leading-none tabular-nums text-blood"
              style={{ textShadow: '0 0 22px rgba(255,45,32,0.4)' }}
            >
              {score}
            </div>
            <div className="pb-1 min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-widest text-blood font-bold">
                BS score
              </div>
              <div className="text-sm sm:text-base font-bold leading-tight truncate">
                {data?.product?.name || 'product'}
              </div>
            </div>
          </div>

          {data?.summary && (
            <p className="mt-3 pt-3 border-t-2 border-paper/15 text-sm leading-snug text-paper">
              {data.summary}
            </p>
          )}

          {Array.isArray(data?.issues) && data.issues.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {data.issues.slice(0, 4).map((iss, i) => (
                <Issue key={i} issue={iss} />
              ))}
            </div>
          )}
        </div>

        {Array.isArray(data?.alternatives) && data.alternatives.length > 0 && (
          <div className="card-brutal bg-paper p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="tag-acid">Buy these instead</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink/50">
                {(() => {
                  const d = getDomainFromUrl(sourceUrl)
                  if (d?.includes('amazon')) return 'searches amazon live'
                  if (d?.includes('ebay')) return 'searches ebay live'
                  return 'searches google live'
                })()}
              </span>
            </div>
            <div className="space-y-2">
              {data.alternatives.slice(0, 3).map((a, i) => (
                <Alternative key={i} alt={a} sourceUrl={sourceUrl} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Issue({ issue }) {
  const sevColor =
    issue.severity === 'high'
      ? 'bg-blood text-paper'
      : issue.severity === 'medium'
      ? 'bg-acid text-ink'
      : 'bg-paper text-ink'
  return (
    <div className="flex items-start gap-2 text-xs sm:text-sm">
      <span className={`text-[9px] font-mono uppercase tracking-widest font-bold px-1.5 py-0.5 border-2 border-paper/30 ${sevColor} shrink-0 mt-0.5`}>
        {issue.severity || 'med'}
      </span>
      <div className="min-w-0">
        <span className="text-[9px] font-mono uppercase tracking-widest text-paper/50 mr-1">
          {issue.type || 'flag'}
        </span>
        <span className="text-paper/95">{issue.detail}</span>
      </div>
    </div>
  )
}

function Alternative({ alt, sourceUrl }) {
  if (!alt?.name) return null
  const searchUrl = buildSearchUrl(alt.name, alt.price, sourceUrl)
  const domain = getDomainFromUrl(sourceUrl || '')
  const ctaLabel = domain?.includes('amazon')
    ? 'find on amazon ↗'
    : domain?.includes('ebay')
    ? 'find on ebay ↗'
    : 'search ↗'
  return (
    <a
      href={searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-2 border-ink p-2.5 hover:bg-ink hover:text-paper transition-colors group cursor-pointer"
    >
      <div className="min-w-0">
        <div className="font-bold text-sm leading-tight truncate">{alt.name}</div>
        {alt.whyBetter && (
          <div className="text-[11px] mt-0.5 text-ink/60 group-hover:text-paper/70">
            {alt.whyBetter}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {alt.price && (
          <span className="font-display font-bold text-sm">{alt.price}</span>
        )}
        <span className="text-[10px] font-mono uppercase border-2 border-current px-1.5 py-0.5 whitespace-nowrap">
          {ctaLabel}
        </span>
      </div>
    </a>
  )
}
