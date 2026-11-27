export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-rise">
      <div>
        {eyebrow ? (
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="brand-mark text-4xl leading-none tracking-tight md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[1.02rem] text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
