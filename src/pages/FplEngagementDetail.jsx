import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  Calendar,
  Globe,
  Languages,
  LayoutDashboard,
  Newspaper,
  Radio,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext'
import SectionLabel from '../components/SectionLabel'
import ProductScreenshotFrame from '../components/ProductScreenshotFrame'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import { faleagueImages, fplEngagementScreenshotSrc } from '../lib/faleagueImages'

const LIVE_URL = 'https://www.faleague-ai.com/'
const AI_CHAT_URL = 'https://www.faleague-ai.com/chat'

const MODULE_ICONS = [Trophy, LayoutDashboard, Bot, Calendar, Newspaper, Sparkles]

const MY_FPL_FEATURE_ICONS = [LayoutDashboard, Calendar, Users, Radio, Zap]

export default function FplEngagementDetail() {
  const { t } = useI18n()
  const f = t.fpl

  const screenshots = f.screenshots.items.map((item, i) => ({
    ...item,
    src: fplEngagementScreenshotSrc[i],
  }))

  const modules = f.modules.items.map((item, i) => ({
    ...item,
    icon: MODULE_ICONS[i],
  }))

  const myFplFeatures = f.myFpl.features.map((item, i) => ({
    ...item,
    icon: MY_FPL_FEATURE_ICONS[i],
  }))

  const aiChatScreenshot = {
    src: faleagueImages.aiChat,
    alt: f.screenshots.items[2].alt,
    title: f.aiChat.screenshotTitle,
    caption: f.aiChat.screenshotCaption,
  }

  return (
    <div className="min-h-screen bg-surface">
      <SiteNav />

      <main className="pt-28">
        {/* Hero */}
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
                <SectionLabel>{f.hero.label}</SectionLabel>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                  {f.hero.titleBefore}
                  <span className="text-gradient">{f.hero.titleHighlight}</span>
                </h1>
                <p className="font-subhead mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
                  {f.hero.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {f.hero.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-subtle bg-surface-raised px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={LIVE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
                  >
                    {f.hero.visitLive}
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                  <Link
                    to="/#contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent/40"
                  >
                    {t.common.discussProject}
                  </Link>
                </div>
              </div>

              <ProductScreenshotFrame
                screenshot={screenshots[0]}
                chrome={f.screenshots.chrome}
                featured
              />
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="border-y border-border-subtle bg-surface-overlay px-5 py-12 sm:px-8 lg:px-12">
          <div className="container-wide grid grid-cols-2 gap-4 sm:grid-cols-4">
            {f.metrics.items.map((metric) => (
              <div
                key={metric.label}
                className="rounded-3xl bg-surface-raised p-5 card-shadow sm:p-6"
              >
                <p className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Overview */}
        <section className="section-padding bg-surface">
          <div className="container-wide grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <SectionLabel>{f.overview.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {f.overview.titleBefore}
                <span className="text-gradient">{f.overview.titleHighlight}</span>
              </h2>
              <p className="font-subhead mt-6 text-lg leading-relaxed text-text-secondary">
                {f.overview.body}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                {f.overview.disclaimer}
              </p>
            </div>

            <div className="rounded-3xl bg-surface-raised p-6 card-shadow sm:p-8">
              <h3 className="font-display text-xl font-semibold">
                {f.challenge.title}
              </h3>
              <ul className="mt-5 space-y-4">
                {f.challenge.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-text-secondary"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Screenshots */}
        <section className="section-padding bg-surface-overlay">
          <div className="container-wide">
            <div className="mb-12 sm:mb-16">
              <SectionLabel>{f.screenshots.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {f.screenshots.titleBefore}
                <span className="text-gradient">{f.screenshots.titleHighlight}</span>
              </h2>
              <p className="font-subhead mt-4 max-w-2xl text-lg text-text-secondary">
                {f.screenshots.subtitle}
              </p>
            </div>

            <div className="grid items-stretch gap-8 md:grid-cols-2 xl:grid-cols-3">
              {screenshots.map((screenshot) => (
                <ProductScreenshotFrame
                  key={screenshot.title}
                  screenshot={screenshot}
                  chrome={f.screenshots.chrome}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="section-padding bg-surface-overlay">
          <div className="container-wide">
            <div className="mb-12 sm:mb-16">
              <SectionLabel>{f.modules.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {f.modules.titleBefore}
                <span className="text-gradient">{f.modules.titleHighlight}</span>
              </h2>
              <p className="font-subhead mt-4 max-w-2xl text-lg text-text-secondary">
                {f.modules.subtitle}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <article
                  key={module.title}
                  className="rounded-3xl bg-surface-raised p-6 card-shadow transition-all duration-300 hover:card-shadow-hover sm:p-8"
                >
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-light text-accent">
                    <module.icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-xl font-semibold">
                    {module.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    {module.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* AI Chat */}
        <section className="section-padding bg-surface">
          <div className="container-wide">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <ProductScreenshotFrame
                screenshot={aiChatScreenshot}
                chrome={f.screenshots.chrome}
              />

              <div>
                <SectionLabel>{f.aiChat.label}</SectionLabel>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {f.aiChat.titleBefore}
                  <span className="text-gradient">{f.aiChat.titleHighlight}</span>
                </h2>
                <p className="font-subhead mt-6 text-lg leading-relaxed text-text-secondary">
                  {f.aiChat.body}
                </p>

                <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-raised p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                    {f.aiChat.examplePromptsLabel}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {f.aiChat.prompts.map((prompt) => (
                      <span
                        key={prompt}
                        className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-secondary"
                      >
                        {prompt}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {f.aiChat.capabilities.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <Bot
                        size={18}
                        className="mt-0.5 shrink-0 text-accent"
                      />
                      <div>
                        <p className="font-medium text-text-primary">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <a
                  href={AI_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
                >
                  {f.aiChat.cta}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* My FPL deep dive */}
        <section className="section-padding bg-surface">
          <div className="container-wide">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <SectionLabel>{f.myFpl.label}</SectionLabel>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {f.myFpl.titleBefore}
                  <span className="text-gradient">{f.myFpl.titleHighlight}</span>
                </h2>
                <p className="font-subhead mt-6 text-lg leading-relaxed text-text-secondary">
                  {f.myFpl.body}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {myFplFeatures.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-border-subtle bg-surface-raised p-4"
                    >
                      <item.icon size={18} className="text-accent" />
                      <p className="mt-2 font-medium text-text-primary">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <ProductScreenshotFrame
                screenshot={screenshots[1]}
                chrome={f.screenshots.chrome}
              />
            </div>
          </div>
        </section>

        {/* News & Community */}
        <section className="section-padding bg-surface-overlay">
          <div className="container-wide grid items-start gap-12 lg:grid-cols-2">
            <ProductScreenshotFrame
              screenshot={screenshots[3]}
              chrome={f.screenshots.chrome}
            />

            <div className="space-y-6">
              <div className="rounded-3xl bg-surface-raised p-6 card-shadow sm:p-8">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-light text-accent">
                  <Newspaper size={20} />
                </div>
                <h3 className="font-display text-2xl font-semibold">
                  {f.news.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  {f.news.body}
                </p>
              </div>

              <div className="rounded-3xl bg-surface-raised p-6 card-shadow sm:p-8">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-light text-accent">
                  <Globe size={20} />
                </div>
                <h3 className="font-display text-2xl font-semibold">
                  {f.community.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  {f.community.body}
                </p>
                <div className="mt-6 flex items-center gap-3 text-sm text-text-muted">
                  <Languages size={16} className="text-accent" />
                  {f.community.languages}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Build approach */}
        <section className="section-padding bg-surface">
          <div className="container-wide">
            <SectionLabel>{f.build.label}</SectionLabel>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {f.build.titleBefore}
              <span className="text-gradient">{f.build.titleHighlight}</span>
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {f.build.highlights.map((item) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-2xl border border-border-subtle bg-surface-raised p-5"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <p className="text-sm leading-relaxed text-text-secondary">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-surface-overlay">
          <div className="container-wide text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {f.cta.title}
            </h2>
            <p className="font-subhead mx-auto mt-4 max-w-xl text-lg text-text-secondary">
              {f.cta.body}
            </p>
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-text-primary px-8 py-3.5 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
            >
              {f.cta.button}
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
