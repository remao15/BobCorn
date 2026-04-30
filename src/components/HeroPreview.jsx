import { useEffect, useState } from 'react'

const TARGET_SCORE = 87

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function useCountUp(target, duration = 1600, delay = 700) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let raf
    let start = null
    const startTimer = setTimeout(() => {
      const step = (ts) => {
        if (start === null) start = ts
        const p = Math.min((ts - start) / duration, 1)
        setN(Math.round(target * easeOutCubic(p)))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => {
      clearTimeout(startTimer)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [target, duration, delay])
  return n
}

export default function HeroPreview() {
  const score = useCountUp(TARGET_SCORE)

  return (
    <div className="relative">
      <div className="card-brutal shadow-brutal-xl animate-float">
        <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-ink bg-bone">
          <span className="w-3 h-3 rounded-full bg-blood border-2 border-ink" />
          <span className="w-3 h-3 rounded-full bg-acid border-2 border-ink" />
          <span className="w-3 h-3 rounded-full bg-cash border-2 border-ink" />
          <div className="flex-1 mx-3 h-6 border-2 border-ink bg-paper flex items-center px-2 font-mono text-[11px] truncate">
            amazon.com/dp/B09XYZ-fast-charger-3000w
          </div>
        </div>

        <div className="p-5 grid grid-cols-5 gap-4 relative">
          <div className="col-span-2">
            <div className="aspect-square border-2 border-ink bg-bone grid place-items-center relative overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #0A0A0A 25%, transparent 25%, transparent 75%, #0A0A0A 75%), linear-gradient(45deg, #0A0A0A 25%, transparent 25%, transparent 75%, #0A0A0A 75%)',
                  backgroundSize: '14px 14px',
                  backgroundPosition: '0 0, 7px 7px',
                }}
              />
              <svg
                viewBox="0 0 100 100"
                className="w-24 h-24 text-ink relative z-10"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="38" y="4" width="6" height="20" />
                <rect x="56" y="4" width="6" height="20" />
                <path
                  fillRule="evenodd"
                  d="M20 22 H80 V92 H20 V22 Z M60 32 L34 58 L48 58 L40 80 L66 52 L52 52 Z"
                />
              </svg>
            </div>
          </div>
          <div className="col-span-3 space-y-2">
            <div className="font-bold text-ink text-sm leading-tight">
              Ultra Fast Charger 3000W (Generic Brand)
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink/70">
              <span className="text-ink tracking-tighter">★★★★★</span>
              <span>14,892 reviews</span>
            </div>
            <div className="font-display font-bold text-xl text-ink">$24.99</div>
            <div className="space-y-1 pt-1">
              <div className="h-1.5 bg-ink/15 rounded-sm w-full" />
              <div className="h-1.5 bg-ink/15 rounded-sm w-5/6" />
              <div className="h-1.5 bg-ink/15 rounded-sm w-3/4" />
            </div>
            <div className="pt-2">
              <div className="w-full text-center text-[11px] font-bold py-1.5 bg-[#FFD814] text-ink border-2 border-ink rounded-sm">
                Add to Cart
              </div>
            </div>
          </div>
        </div>

        <div className="mx-5 mb-5 border-2 border-ink bg-ink text-paper p-4 shadow-brutal-sm border-t-[5px] border-t-blood">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-blood text-paper px-1.5 py-0.5 font-bold">
                BS Detector
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-paper/60 font-bold">verdict</span>
            </div>
            <button className="text-paper/60 hover:text-paper text-xs font-mono" aria-label="dismiss">✕</button>
          </div>
          <div className="mt-2 flex items-end gap-3">
            <div
              className="font-display font-black text-5xl leading-none tabular-nums text-blood"
              style={{ textShadow: '0 0 18px rgba(255,45,32,0.4)' }}
            >
              {score}
            </div>
            <div className="pb-1">
              <div className="text-[10px] font-mono uppercase tracking-widest text-blood font-bold">BS score</div>
              <div className="text-sm font-bold">
                {score < TARGET_SCORE ? 'Analyzing…' : 'Probably trash.'}
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm leading-snug text-paper/90">
            "Known to fail in 8 weeks. Reviews are 71% bot-generated."
          </div>

          <div className="mt-3 pt-3 border-t-2 border-paper/20">
            <div className="text-[10px] font-mono uppercase tracking-widest text-blood font-bold mb-2">
              Better alternatives
            </div>
            <div className="space-y-1.5">
              <Alt name="Anker PowerPort III 65W" price="$32" save="trusted" delay={1400} />
              <Alt name="UGREEN Nexode 100W" price="$45" save="lasts 5y+" delay={1550} />
              <Alt name="Belkin BoostCharge Pro" price="$39" save="MFi cert" delay={1700} />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-4 sm:-right-8 animate-wiggle">
        <div className="card-brutal bg-acid px-4 py-2 shadow-brutal-sm">
          <div className="font-display font-bold text-sm">+ $14 saved</div>
          <div className="text-[10px] font-mono uppercase tracking-widest">vs. listing price</div>
        </div>
      </div>
    </div>
  )
}

function Alt({ name, price, save, delay = 0 }) {
  return (
    <div
      className="flex items-center justify-between gap-2 bg-paper text-ink border-2 border-ink px-2 py-1.5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-xs font-bold truncate">{name}</div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono uppercase bg-acid border border-ink px-1">{save}</span>
        <span className="font-display font-bold text-sm">{price}</span>
      </div>
    </div>
  )
}
