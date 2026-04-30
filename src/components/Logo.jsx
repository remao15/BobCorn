export default function Logo({ className = '' }) {
  return (
    <a href="#top" className={`group inline-flex items-center ${className}`} aria-label="adCheck">
      <img
        src="/logo-removebg-preview.png"
        alt="adCheck"
        className="h-16 w-auto group-hover:rotate-[-2deg] transition-transform"
      />
    </a>
  )
}
