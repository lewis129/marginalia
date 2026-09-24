export default function BrandMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-ember" />
      <path
        d="M8 24V10h2.4L17 18l6.6-8H26v14h-3.2v-9.6L18 17.1l-4.8-4.5V24z"
        className="fill-card"
      />
    </svg>
  )
}