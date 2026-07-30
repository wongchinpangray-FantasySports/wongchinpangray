import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, FileText, X } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext'
import { submitDownloadLead, triggerDownload } from '../lib/downloads'

export default function DownloadLeadModal({ documentType, onClose }) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const copy = documentType === 'portfolio' ? t.downloads.portfolio : t.downloads.resume
  const isOpen = Boolean(documentType)

  useEffect(() => {
    if (!isOpen) return undefined

    setEmail('')
    setCompany('')
    setError('')
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await submitDownloadLead({
        email: email.trim(),
        company: company.trim(),
        document: documentType,
      })
      triggerDownload(documentType)
      onClose()
    } catch (submitError) {
      if (import.meta.env.DEV) {
        triggerDownload(documentType)
        onClose()
        return
      }
      setError(submitError.message || t.downloads.error)
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-text-primary/40 p-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label={t.downloads.close}
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface-raised shadow-2xl">
        <div className="flex items-start justify-between border-b border-border-subtle px-6 py-5 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                {t.downloads.modalLabel}
              </p>
              <h2 className="font-display text-2xl font-semibold text-text-primary">
                {copy.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {copy.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
            aria-label={t.downloads.close}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 sm:px-8">
          <div>
            <label htmlFor="download-email" className="mb-2 block text-sm font-medium text-text-secondary">
              {t.downloads.emailLabel}
            </label>
            <input
              id="download-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.common.emailPlaceholder}
              className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
          </div>

          <div>
            <label htmlFor="download-company" className="mb-2 block text-sm font-medium text-text-secondary">
              {t.downloads.companyLabel}
            </label>
            <input
              id="download-company"
              name="company"
              type="text"
              required
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder={t.downloads.companyPlaceholder}
              className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
          </div>

          <p className="text-xs leading-relaxed text-text-muted">{t.downloads.privacyNote}</p>

          {error ? (
            <p className="rounded-2xl border border-accent/20 bg-accent-light px-4 py-3 text-sm text-accent">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="group flex w-full items-center justify-center gap-2 rounded-full bg-text-primary py-3.5 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? t.downloads.submitting : copy.button}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}
