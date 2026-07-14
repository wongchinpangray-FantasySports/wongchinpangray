import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clapperboard,
  Image,
  Megaphone,
  Radio,
  TrendingUp,
} from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext'
import SectionLabel from '../components/SectionLabel'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'

const PLATFORM_LINKS = {
  xiaohongshu: 'https://www.xiaohongshu.com/user/profile/5ea3f4ba000000000100ba36',
  weibo: 'https://www.weibo.com/u/2665815515',
  bilibili: 'https://space.bilibili.com/410659561',
}

const PLATFORM_STYLES = {
  xiaohongshu: {
    accent: '#FF2442',
    light: '#FFF0F3',
    label: 'RED',
  },
  weibo: {
    accent: '#E6162D',
    light: '#FFF0F0',
    label: 'Weibo',
  },
  bilibili: {
    accent: '#FB7299',
    light: '#FFF0F5',
    label: 'Bilibili',
  },
}

const SCREENSHOT_SRC = {
  xiaohongshu: [
    '/content/xiaohongshu-profile.png',
    '/content/xiaohongshu-notes.png',
  ],
  weibo: ['/content/weibo-profile.png', '/content/weibo-videos.png'],
  bilibili: ['/content/bilibili-profile.png', '/content/bilibili-videos.png'],
}

const PILLAR_ICONS = [Calendar, TrendingUp, Megaphone, Image]

function ScreenshotFrame({ screenshot, chrome, featured = false }) {
  return (
    <figure
      className={`overflow-hidden rounded-3xl border border-border bg-[#111318] card-shadow ${
        featured ? 'lg:sticky lg:top-28' : ''
      }`}
    >
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

function PlatformBadge({ platform }) {
  const style = PLATFORM_STYLES[platform]
  return (
    <span
      className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-white"
      style={{ backgroundColor: style.accent }}
    >
      {style.label.slice(0, 1)}
    </span>
  )
}

function PlatformPanel({ platform, data, screenshots }) {
  const style = PLATFORM_STYLES[platform]
  const Icon = data.icon

  return (
    <section id={`platform-${platform}`} className="scroll-mt-28">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface-raised card-shadow">
        <div
          className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-start lg:justify-between"
          style={{ backgroundColor: style.light }}
        >
          <div className="flex gap-4">
            <PlatformBadge platform={platform} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {data.platformName}
              </p>
              <h3 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
                {data.handle}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary sm:text-base">
                {data.bio}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.stats.map((stat) => (
                  <span
                    key={stat}
                    className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-text-muted"
                  >
                    {stat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <a
            href={PLATFORM_LINKS[platform]}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: style.accent }}
          >
            {data.visitLabel}
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Icon size={18} className="text-accent" />
              <h4 className="font-display text-lg font-semibold">
                {data.contentTitle}
              </h4>
            </div>
            <ul className="space-y-3">
              {data.contentTypes.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-text-secondary"
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: style.accent }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4">
            {screenshots.map((screenshot, index) => (
              <ScreenshotFrame
                key={screenshot.title}
                screenshot={screenshot}
                chrome={data.screenshotChrome}
                featured={index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function FplContentDetail() {
  const { t } = useI18n()
  const location = useLocation()
  const c = t.content

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  const pillars = c.pillars.items.map((item, i) => ({
    ...item,
    icon: PILLAR_ICONS[i],
  }))

  const platforms = [
    {
      key: 'xiaohongshu',
      data: { ...c.platforms.xiaohongshu, icon: Image },
      screenshots: c.platforms.xiaohongshu.screenshots.items.map((item, i) => ({
        ...item,
        src: SCREENSHOT_SRC.xiaohongshu[i],
      })),
    },
    {
      key: 'weibo',
      data: { ...c.platforms.weibo, icon: Radio },
      screenshots: c.platforms.weibo.screenshots.items.map((item, i) => ({
        ...item,
        src: SCREENSHOT_SRC.weibo[i],
      })),
    },
    {
      key: 'bilibili',
      data: { ...c.platforms.bilibili, icon: Clapperboard },
      screenshots: c.platforms.bilibili.screenshots.items.map((item, i) => ({
        ...item,
        src: SCREENSHOT_SRC.bilibili[i],
      })),
    },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <SiteNav />

      <main className="pt-28">
        <section className="section-padding bg-surface">
          <div className="container-wide">
            <Link
              to="/#content"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
            >
              <ArrowLeft size={16} />
              {c.backToContent}
            </Link>

            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <SectionLabel>{c.hero.label}</SectionLabel>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                  {c.hero.titleBefore}
                  <span className="text-gradient">{c.hero.titleHighlight}</span>
                </h1>
                <p className="font-subhead mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
                  {c.hero.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {c.hero.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-subtle bg-surface-raised px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {c.metrics.items.map((metric) => (
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
            </div>
          </div>
        </section>

        <section className="section-padding border-t border-border-subtle bg-surface-overlay">
          <div className="container-wide">
            <SectionLabel>{c.pillars.label}</SectionLabel>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {c.pillars.titleBefore}
              <span className="text-gradient">{c.pillars.titleHighlight}</span>
            </h2>
            <p className="font-subhead mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
              {c.pillars.subtitle}
            </p>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {pillars.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl bg-surface-raised p-6 card-shadow"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-light text-accent">
                      <Icon size={18} strokeWidth={1.75} />
                    </div>
                    <h3 className="font-display mt-4 font-semibold text-text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {item.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface">
          <div className="container-wide space-y-8">
            <div className="max-w-2xl">
              <SectionLabel>{c.platformsSection.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {c.platformsSection.titleBefore}
                <span className="text-gradient">
                  {c.platformsSection.titleHighlight}
                </span>
              </h2>
              <p className="font-subhead mt-4 text-lg leading-relaxed text-text-secondary">
                {c.platformsSection.subtitle}
              </p>
            </div>

            {platforms.map(({ key, data, screenshots }) => (
              <PlatformPanel
                key={key}
                platform={key}
                data={data}
                screenshots={screenshots}
              />
            ))}
          </div>
        </section>

        <section className="section-padding bg-hero text-on-dark">
          <div className="container-wide mx-auto max-w-3xl text-center">
            <SectionLabel className="border-on-dark/20 text-on-dark-muted">
              {c.cta.label}
            </SectionLabel>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {c.cta.titleBefore}
              <span className="text-gradient">{c.cta.titleHighlight}</span>
            </h2>
            <p className="font-subhead mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-dark-muted">
              {c.cta.body}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={PLATFORM_LINKS.xiaohongshu}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent-dim"
              >
                {c.cta.followRed}
                <ArrowUpRight size={16} />
              </a>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-on-dark/30 px-6 py-3 text-sm font-semibold text-on-dark transition-colors hover:border-on-dark"
              >
                {c.cta.contact}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
