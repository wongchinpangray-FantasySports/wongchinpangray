import { useI18n } from '../i18n/LanguageContext'

export default function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border bg-surface-overlay px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-text-muted">
          {t.footer.rights.replace('{year}', String(new Date().getFullYear()))}
        </p>
        <p className="text-xs text-text-muted">{t.footer.tagline}</p>
      </div>
    </footer>
  )
}
