const phrases = [
  'Fake reviews → exposed',
  'Bloated subs → cancelled',
  'Bot ratings → ignored',
  'Drop-shipped junk → flagged',
  'Annual auto-renewals → audited',
  'Affiliate spam → muted',
  'Better alternatives → surfaced',
  'Wallet → thanks you',
]

export default function Marquee() {
  const items = [...phrases, ...phrases]
  return (
    <div className="bg-ink text-paper border-y-2 border-ink overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-4">
        {items.map((p, i) => (
          <span key={i} className="mx-8 font-display font-bold text-lg sm:text-xl uppercase tracking-tight inline-flex items-center gap-8">
            {p}
            <span className="text-acid">●</span>
          </span>
        ))}
      </div>
    </div>
  )
}
