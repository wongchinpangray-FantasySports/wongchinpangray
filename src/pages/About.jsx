import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Briefcase, Code2, Sparkles } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext'
import SectionLabel from '../components/SectionLabel'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'

const SCREENSHOT_SRC = [
  '/projects/faleague/world-cup-hub.png',
  '/projects/faleague/my-fpl.png',
  '/projects/faleague/ai-chat.png',
]

const VALUE_ICONS = [Briefcase, Code2, Sparkles]

function ScreenshotFrame({ screenshot, chrome }) {
  return (
    <figure className="overflow-hidden rounded-3xl border border-border bg-[#111318] card-shadow">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
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
        className="block w-full"
        loading="lazy"
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

export default function About() {
  const { t } = useI18n()
  const a = t.aboutPage

  const screenshots = a.screenshots.items.map((item, i) => ({
    ...item,
    src: SCREENSHOT_SRC[i],
  }))

  const values = a.values.items.map((item, i) => ({
    ...item,
    icon: VALUE_ICONS[i],
  }))

  return (
    <div className="min-h-screen bg-surface">
      <SiteNav />

      <main className="pt-28">
        <section className="section-padding bg-surface">
          <div className="container-wide">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
            >
              <ArrowLeft size={16} />
              {a.backHome}
            </Link>

            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16">
              <div className="shrink-0">
                <div className="overflow-hidden rounded-3xl border border-border bg-surface-raised p-1.5 card-shadow">
                  <img
                    src="/ray-profile.jpg"
                    alt={t.common.profileAlt}
                    className="h-48 w-48 rounded-[1.25rem] object-cover object-top sm:h-56 sm:w-56"
                    width={224}
                    height={224}
                  />
                </div>
              </div>

              <div className="max-w-3xl">
                <SectionLabel>{a.hero.label}</SectionLabel>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                  {a.hero.titleBefore}
                  <span className="text-gradient">{a.hero.titleHighlight}</span>
                </h1>
                <p className="font-subhead mt-8 text-lg leading-relaxed text-text-secondary sm:text-xl">
                  {a.hero.lead}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding border-t border-border-subtle bg-surface-overlay">
          <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div>
              <SectionLabel>{a.story.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {a.story.titleBefore}
                <span className="text-gradient">{a.story.titleHighlight}</span>
              </h2>
              <div className="mt-6 space-y-5 text-base leading-relaxed text-text-secondary sm:text-lg">
                {a.story.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {values.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="group rounded-3xl bg-surface-raised p-6 card-shadow transition-all duration-300 hover:card-shadow-hover sm:p-7"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-light text-accent transition-transform duration-300 group-hover:scale-105">
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display mt-4 text-xl font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
                      {item.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface">
          <div className="container-wide">
            <div className="mb-12 max-w-2xl">
              <SectionLabel>{a.screenshots.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {a.screenshots.titleBefore}
                <span className="text-gradient">{a.screenshots.titleHighlight}</span>
              </h2>
              <p className="font-subhead mt-4 text-lg leading-relaxed text-text-secondary">
                {a.screenshots.subtitle}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {screenshots.map((screenshot) => (
                <ScreenshotFrame
                  key={screenshot.title}
                  screenshot={screenshot}
                  chrome={a.screenshots.chrome}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/projects/fpl-engagement-platform"
                className="group inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/40"
              >
                {a.screenshots.viewFpl}
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <Link
                to="/projects/amateur-football-club-management"
                className="group inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:border-accent/40"
              >
                {a.screenshots.viewClub}
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </section>

        <section className="section-padding bg-hero text-on-dark">
          <div className="container-wide mx-auto max-w-3xl text-center">
            <SectionLabel className="border-on-dark/20 text-on-dark-muted">
              {a.cta.label}
            </SectionLabel>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {a.cta.titleBefore}
              <span className="text-gradient">{a.cta.titleHighlight}</span>
            </h2>
            <p className="font-subhead mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-dark-muted">
              {a.cta.body}
            </p>
            <Link
              to="/#contact"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent-dim"
            >
              {a.cta.button}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
