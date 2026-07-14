export default function SectionLabel({ children, className = '' }) {
  return (
    <span
      className={`mb-4 inline-flex items-center rounded-full border border-border px-4 py-1.5 text-xs font-medium text-text-muted ${className}`}
    >
      {children}
    </span>
  )
}
