export default function HeroPreview() {
  return (
    <div className="relative">
      <div className="card-brutal shadow-brutal-xl rotate-[-1.5deg]">
        <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-ink bg-bone">
          <span className="w-3 h-3 rounded-full bg-blood border-2 border-ink" />
          <span className="w-3 h-3 rounded-full bg-acid border-2 border-ink" />
          <span className="w-3 h-3 rounded-full bg-cash border-2 border-ink" />
          <div className="flex-1 mx-3 h-6 border-2 border-ink bg-paper flex items-center px-2 font-mono text-[11px] truncate">
            amazon.com/dp/B09XYZ-fast-charger-3000w
          </div>
        </div>

        <div className="p-5 grid grid-cols-5 gap-4">
          <div className="col-span-2">
            <div className="aspect-square border-2 border-ink bg-bone grid place-items-center">
              <svg viewBox="0 0 80 80" className="w-16 h-16 text-ink/70">
                <rect x="14" y="20" width="38" height="46" rx="3" fill="none" stroke="currentColor" strokeWidth="3" />
                <rect x="48" y="30" width="22" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M28 36l8 8 12-14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
              </svg>
            </div>
          </div>
          <div className="col-span-3 text-xs text-ink/70 space-y-1.5">
            <div className="font-bold text-ink text-sm leading-tight">
              Ultra Fast Charger 3000W (Generic Brand)
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-ink">★★★★★</span>
              <span>14,892 reviews</span>
            </div>
            <div className="font-display font-bold text-lg text-ink">$24.99</div>
            <div className="h-2 bg-acid w-3/4 border border-ink" />
            <div className="h-2 bg-bone w-2/3 border border-ink" />
          </div>
        </div>

        <div className="mx-5 mb-5 border-2 border-ink bg-blood text-paper p-4 shadow-brutal-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest bg-paper text-ink px-1.5 py-0.5">
                BS Detector
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest">verdict</span>
            </div>
            <button className="text-paper/80 hover:text-paper text-xs font-mono" aria-label="dismiss">✕</button>
          </div>
          <div className="mt-2 flex items-end gap-3">
            <div className="font-display font-bold text-5xl leading-none">87</div>
            <div className="pb-1">
              <div className="text-[10px] font-mono uppercase tracking-widest opacity-80">BS score</div>
              <div className="text-sm font-bold">Probably trash.</div>
            </div>
          </div>
          <div className="mt-3 text-sm leading-snug">
            "Known to fail in 8 weeks. Reviews are 71% bot-generated."
          </div>

          <div className="mt-3 pt-3 border-t-2 border-paper/30">
            <div className="text-[10px] font-mono uppercase tracking-widest opacity-80 mb-2">
              Better alternatives
            </div>
            <div className="space-y-1.5">
              <Alt name="Anker PowerPort III 65W" price="$32" save="trusted" />
              <Alt name="UGREEN Nexode 100W" price="$45" save="lasts 5y+" />
              <Alt name="Belkin BoostCharge Pro" price="$39" save="MFi cert" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -right-4 sm:-right-8 rotate-[4deg]">
        <div className="card-brutal bg-acid px-4 py-2 shadow-brutal-sm">
          <div className="font-display font-bold text-sm">+ $14 saved</div>
          <div className="text-[10px] font-mono uppercase tracking-widest">vs. listing price</div>
        </div>
      </div>
    </div>
  )
}

function Alt({ name, price, save }) {
  return (
    <div className="flex items-center justify-between gap-2 bg-paper text-ink border-2 border-ink px-2 py-1.5">
      <div className="text-xs font-bold truncate">{name}</div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-mono uppercase bg-acid border border-ink px-1">{save}</span>
        <span className="font-display font-bold text-sm">{price}</span>
      </div>
    </div>
  )
}
