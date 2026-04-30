export default function Logo({ className = '' }) {
  return (
    <a href="#top" className={`group flex items-center gap-2 ${className}`}>
      <span className="grid place-items-center w-9 h-9 bg-ink text-acid border-2 border-ink font-display font-bold text-base shadow-brutal-sm group-hover:rotate-[-6deg] transition-transform">
        BS
      </span>
      <span className="font-display font-bold text-xl tracking-tight">
        BobCorn
      </span>
    </a>
  )
}
