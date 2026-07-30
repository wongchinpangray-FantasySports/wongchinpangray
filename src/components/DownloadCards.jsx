import { ArrowUpRight, Briefcase, FileText } from 'lucide-react'
import { useDownload } from '../context/DownloadContext'
import { useI18n } from '../i18n/LanguageContext'

export default function DownloadCards({ variant = 'light' }) {
  const { t } = useI18n()
  const { openDownload } = useDownload()

  const isDark = variant === 'dark'

  const items = [
    {
      key: 'resume',
      icon: FileText,
      title: t.downloads.resume.cardTitle,
      description: t.downloads.resume.cardDescription,
    },
    {
      key: 'portfolio',
      icon: Briefcase,
      title: t.downloads.portfolio.cardTitle,
      description: t.downloads.portfolio.cardDescription,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => openDownload(item.key)}
            className={`group flex items-start gap-4 rounded-3xl p-5 text-left transition-all duration-300 sm:p-6 ${
              isDark
                ? 'border border-on-dark/15 bg-on-dark/10 hover:border-on-dark/30 hover:bg-on-dark/15'
                : 'bg-surface-raised card-shadow hover:card-shadow-hover'
            }`}
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                isDark ? 'bg-on-dark/15 text-accent' : 'bg-accent-light text-accent'
              }`}
            >
              <Icon size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`font-display text-lg font-semibold ${
                  isDark ? 'text-on-dark' : 'text-text-primary'
                }`}
              >
                {item.title}
              </p>
              <p
                className={`mt-2 text-sm leading-relaxed ${
                  isDark ? 'text-on-dark-muted' : 'text-text-secondary'
                }`}
              >
                {item.description}
              </p>
            </div>

            <ArrowUpRight
              size={16}
              className={`mt-1 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                isDark ? 'text-on-dark-muted group-hover:text-on-dark' : 'text-text-muted group-hover:text-accent'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

export function DownloadLinks({ className = '' }) {
  const { t } = useI18n()
  const { openDownload } = useDownload()

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      <button
        type="button"
        onClick={() => openDownload('resume')}
        className="text-sm font-medium text-text-secondary transition-colors hover:text-accent"
      >
        {t.downloads.resume.link}
      </button>
      <span className="text-text-muted">·</span>
      <button
        type="button"
        onClick={() => openDownload('portfolio')}
        className="text-sm font-medium text-text-secondary transition-colors hover:text-accent"
      >
        {t.downloads.portfolio.link}
      </button>
    </div>
  )
}
