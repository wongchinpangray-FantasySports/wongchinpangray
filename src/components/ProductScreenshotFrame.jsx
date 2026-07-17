export default function ProductScreenshotFrame({
  screenshot,
  chrome,
  featured = false,
  className = '',
}) {
  return (
    <figure
      className={`flex h-auto flex-col self-start overflow-hidden rounded-3xl border border-border bg-[#111318] card-shadow ${
        featured ? 'lg:sticky lg:top-28' : ''
      } ${className}`.trim()}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        </div>
        <div className="mx-auto rounded-full bg-white/5 px-4 py-1 text-[10px] text-white/50">
          {chrome}
        </div>
      </div>

      <img
        src={screenshot.src}
        alt={screenshot.alt}
        className="block aspect-[4/3] w-full object-cover object-top"
        decoding="async"
        loading={featured ? 'eager' : 'lazy'}
      />

      <figcaption className="border-t border-border bg-surface-raised px-4 py-3 sm:px-5 sm:py-4">
        <p className="font-display text-sm font-semibold text-text-primary">
          {screenshot.title}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          {screenshot.caption}
        </p>
      </figcaption>
    </figure>
  )
}
