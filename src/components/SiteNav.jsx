import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext'

export default function SiteNav() {
  const { t, lang, setLang } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: t.nav.about, href: '/about' },
    { label: t.nav.projects, href: '/#projects' },
    { label: t.nav.content, href: '/#content' },
    { label: t.nav.experience, href: '/#experience' },
    { label: t.nav.skills, href: '/#skills' },
    { label: t.nav.contact, href: '/#contact' },
  ]

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-5">
      <nav className="nav-pill mx-auto flex max-w-3xl items-center justify-between rounded-full border border-border bg-surface-raised px-4 py-2.5 sm:px-6 sm:py-3">
        <Link
          to="/"
          className="font-display text-base font-semibold tracking-tight text-text-primary sm:text-lg"
        >
          Ray<span className="text-accent">.</span>
        </Link>

        <div className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-text-secondary transition-colors duration-300 hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div
            className="flex items-center rounded-full border border-border-subtle bg-surface p-0.5 text-xs font-semibold"
            role="group"
            aria-label={t.nav.toggleLabel}
          >
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === 'en'
                  ? 'bg-text-primary text-on-dark'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('zh')}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                lang === 'zh'
                  ? 'bg-text-primary text-on-dark'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              中文
            </button>
          </div>
          <Link
            to="/#contact"
            className="rounded-full bg-text-primary px-5 py-2 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
          >
            {t.nav.letsConnect}
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface hover:text-text-primary md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <div
        className={`fixed inset-0 top-0 z-40 bg-surface/98 backdrop-blur-xl transition-all duration-500 md:hidden ${
          menuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="flex flex-col gap-6 px-8 pb-10 pt-24">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-left font-display text-2xl font-semibold text-text-primary transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                lang === 'en'
                  ? 'bg-text-primary text-on-dark'
                  : 'border border-border text-text-secondary'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('zh')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                lang === 'zh'
                  ? 'bg-text-primary text-on-dark'
                  : 'border border-border text-text-secondary'
              }`}
            >
              中文
            </button>
          </div>
          <Link
            to="/#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-2 w-fit rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-on-dark"
          >
            {t.nav.letsConnect}
          </Link>
        </div>
      </div>
    </header>
  )
}
