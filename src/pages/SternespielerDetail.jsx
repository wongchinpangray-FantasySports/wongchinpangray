import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Box, Layers, Palette, Sparkles } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext'
import SectionLabel from '../components/SectionLabel'
import ProductScreenshotFrame from '../components/ProductScreenshotFrame'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'

const BEHANCE_URL = 'https://www.behance.net/chinpangraywong'
const GALLERY_URL = 'https://www.behance.net/gallery/166428731/STERNESPIELERS'

const SCREENSHOT_SRC = [
  '/projects/sternespieler/mascot-front.jpg',
  '/projects/sternespieler/mascot-angle.jpg',
  '/projects/sternespieler/mascot-detail.jpg',
]

const PROCESS_ICONS = [Box, Palette, Layers, Sparkles]

export default function SternespielerDetail() {
  const { t } = useI18n()
  const s = t.sternespieler

  const screenshots = s.screenshots.items.map((item, i) => ({
    ...item,
    src: SCREENSHOT_SRC[i],
  }))

  const processItems = s.process.items.map((item, i) => ({
    ...item,
    icon: PROCESS_ICONS[i],
  }))

  return (
    <div className="min-h-screen bg-surface">
      <SiteNav />

      <main className="pt-28">
        <section className="section-padding bg-surface">
          <div className="container-wide">
            <Link
              to="/#projects"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
            >
              <ArrowLeft size={16} />
              {t.common.backToProjects}
            </Link>

            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <SectionLabel>{s.hero.label}</SectionLabel>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                  {s.hero.titleBefore}
                  <span className="text-gradient">{s.hero.titleHighlight}</span>
                </h1>
                <p className="font-subhead mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
                  {s.hero.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {s.hero.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-subtle bg-surface-raised px-3.5 py-1.5 text-xs font-medium text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <a
                  href={GALLERY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
                >
                  {s.hero.visitBehance}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </div>

              <ProductScreenshotFrame
                screenshot={screenshots[0]}
                chrome={s.screenshots.chrome}
                featured
              />
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface-overlay">
          <div className="container-wide">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {s.metrics.items.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-3xl border border-border-subtle bg-surface-raised p-6 text-center card-shadow"
                >
                  <p className="font-display text-3xl font-semibold text-text-primary">
                    {metric.value}
                  </p>
                  <p className="mt-2 text-sm text-text-muted">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface">
          <div className="container-wide max-w-3xl">
            <SectionLabel>{s.overview.label}</SectionLabel>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {s.overview.titleBefore}
              <span className="text-gradient">{s.overview.titleHighlight}</span>
            </h2>
            <p className="font-subhead mt-6 text-lg leading-relaxed text-text-secondary">
              {s.overview.body}
            </p>
          </div>
        </section>

        <section className="section-padding bg-surface-overlay">
          <div className="container-wide">
            <SectionLabel>{s.screenshots.label}</SectionLabel>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {s.screenshots.titleBefore}
              <span className="text-gradient">{s.screenshots.titleHighlight}</span>
            </h2>
            <p className="font-subhead mt-4 max-w-2xl text-lg text-text-secondary">
              {s.screenshots.subtitle}
            </p>

            <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-2">
              {screenshots.map((screenshot) => (
                <ProductScreenshotFrame
                  key={screenshot.title}
                  screenshot={screenshot}
                  chrome={s.screenshots.chrome}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface">
          <div className="container-wide">
            <SectionLabel>{s.process.label}</SectionLabel>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {s.process.title}
            </h2>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {processItems.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-border-subtle bg-surface-raised p-6 card-shadow"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-warm/10 text-warm">
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface-overlay">
          <div className="container-wide text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {s.cta.title}
            </h2>
            <p className="font-subhead mx-auto mt-4 max-w-xl text-lg text-text-secondary">
              {s.cta.body}
            </p>
            <a
              href={BEHANCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-text-primary px-8 py-3.5 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
            >
              {s.cta.button}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
