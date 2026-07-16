import { useEffect } from 'react'
import {
  ArrowUpRight,
  Briefcase,
  ChevronRight,
  Code2,
  Globe,
  Image,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Palette,
  Radio,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Video,
  Zap,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useI18n } from '../i18n/LanguageContext'
import SectionLabel from '../components/SectionLabel'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'

const PROJECT_META = [
  { icon: Trophy, accent: 'accent', slug: '/projects/fpl-engagement-platform' },
  { icon: Target, accent: 'tech', slug: '/projects/amateur-football-club-management' },
]

const CONTENT_META = [
  {
    icon: Image,
    accent: 'accent',
    slug: '/content/fpl-creator#platform-xiaohongshu',
    thumb: '/content/xiaohongshu-thumb.png',
  },
  {
    icon: Radio,
    accent: 'warm',
    slug: '/content/fpl-creator#platform-weibo',
    thumb: '/content/weibo-thumb.png',
  },
  {
    icon: Video,
    accent: 'tech',
    slug: '/content/fpl-creator#platform-bilibili',
    thumb: '/content/bilibili-thumb.png',
  },
]

const PILLAR_ICONS = [Users, Zap, Sparkles]
const SKILL_ICONS = [Code2, Palette, Briefcase, Globe]

function scrollTo(href) {
  const el = document.querySelector(href)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function ProjectCard({ project, viewDetailsLabel }) {
  const Icon = project.icon
  const isTech = project.accent === 'tech'
  const isWarm = project.accent === 'warm'
  const hasThumb = Boolean(project.thumb)

  const content = (
    <>
      {hasThumb ? (
        <div className="-mx-6 -mt-6 mb-6 overflow-hidden rounded-t-3xl border-b border-border-subtle sm:-mx-8 sm:-mt-8">
          <img
            src={project.thumb}
            alt={project.title}
            className="h-44 w-full object-cover object-top sm:h-48"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
            isTech
              ? 'bg-tech/10 text-tech'
              : isWarm
                ? 'bg-warm/10 text-warm'
                : 'bg-accent-light text-accent'
          } transition-transform duration-500 group-hover:scale-110`}
        >
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}

      <h3 className="font-display text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
        {project.title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary sm:text-base">
        {project.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      <div
        className={`mt-6 flex items-center gap-1 text-sm font-medium transition-colors duration-300 ${
          isTech
            ? 'text-tech group-hover:text-plum'
            : isWarm
              ? 'text-warm group-hover:text-accent'
              : 'text-accent group-hover:text-accent-dim'
        }`}
      >
        {viewDetailsLabel}
        <ArrowUpRight
          size={16}
          className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </div>
    </>
  )

  if (project.slug) {
    return (
      <Link
        to={project.slug}
        className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface-raised p-6 card-shadow transition-all duration-500 hover:-translate-y-1 hover:card-shadow-hover sm:p-8"
      >
        {content}
      </Link>
    )
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl bg-surface-raised p-6 card-shadow transition-all duration-500 hover:-translate-y-1 hover:card-shadow-hover sm:p-8">
      {content}
    </article>
  )
}

function ExperienceItem({ item, index, total }) {
  return (
    <div className="relative flex gap-6 sm:gap-8">
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised text-sm font-bold text-text-muted">
          {String(index + 1).padStart(2, '0')}
        </div>
        {index < total - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
      </div>

      <div className="pb-12 sm:pb-16">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-lg font-semibold text-text-primary sm:text-xl">
            {item.role}
          </h3>
          <span className="text-sm text-text-muted">·</span>
          <span className="text-sm font-medium text-accent">{item.company}</span>
        </div>
        <p className="mt-1 text-sm text-text-muted">{item.period}</p>
        <ul className="mt-4 space-y-2">
          {item.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex gap-3 text-sm leading-relaxed text-text-secondary"
            >
              <ChevronRight
                size={16}
                className="mt-0.5 shrink-0 text-accent/70"
              />
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Home() {
  const location = useLocation()
  const { t } = useI18n()

  const projects = t.home.projects.items.map((project, index) => ({
    ...project,
    ...PROJECT_META[index],
  }))

  const contentItems = t.home.content.items.map((item, index) => ({
    ...item,
    ...CONTENT_META[index],
  }))

  const experience = t.home.experience.items

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [location])

  const handleNav = (href) => {
    scrollTo(href)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    const data = new FormData(form)
    const name = data.get('name')
    const email = data.get('email')
    const message = data.get('message')
    const subject = encodeURIComponent(
      t.common.mailSubject.replace('{name}', name),
    )
    const body = encodeURIComponent(
      `Hi Ray,\n\n${message}\n\n— ${name}\n${email}`,
    )
    window.location.href = `mailto:wongchinpangray@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-surface">
      <SiteNav />

      <main>
        <section id="hero" className="relative overflow-hidden bg-hero">
          <div className="hero-glow pointer-events-none absolute inset-0" />
          <div className="hero-streak pointer-events-none absolute -top-8 left-0 right-0 h-32 opacity-80" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-plum/30 blur-[80px]" />
          <div className="hero-fade pointer-events-none absolute inset-x-0 bottom-0 z-10 h-56 sm:h-72" />

          <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col items-center justify-center px-5 pb-24 pt-28 text-center sm:px-8 sm:pb-28 sm:pt-32 lg:px-12">
            <div className="mb-8 overflow-hidden rounded-full border-2 border-accent/40 p-1 shadow-[0_0_40px_rgba(255,69,32,0.15)]">
              <img
                src="/ray-profile.jpg"
                alt={t.common.profileAlt}
                className="h-28 w-28 rounded-full object-cover object-top sm:h-32 sm:w-32"
                width={128}
                height={128}
              />
            </div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-on-dark/20 bg-on-dark/10 px-4 py-1.5 backdrop-blur-sm">
              <MapPin size={14} className="text-accent" />
              <span className="text-xs font-medium text-on-dark-muted">
                {t.home.hero.location}
              </span>
            </div>

            <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.12] tracking-tight text-on-dark sm:text-5xl lg:text-6xl xl:text-[4.5rem]">
              {t.home.hero.titleBefore}
              <span className="text-gradient-dark">{t.home.hero.titleHighlight1}</span>
              {t.home.hero.titleMiddle}
              <span className="text-gradient-dark">{t.home.hero.titleHighlight2}</span>
              {t.home.hero.titleEnd}
            </h1>

            <p className="font-subhead mt-6 max-w-2xl text-lg leading-relaxed text-on-dark-muted sm:mt-8 sm:text-xl lg:text-2xl">
              {t.home.hero.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center">
              <button
                onClick={() => handleNav('#projects')}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-on-dark px-8 py-3.5 text-sm font-semibold text-text-primary transition-all duration-300 hover:bg-surface hover:shadow-lg"
              >
                {t.home.hero.ctaProjects}
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
              <button
                onClick={() => handleNav('#contact')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-on-dark/30 px-8 py-3.5 text-sm font-semibold text-on-dark transition-all duration-300 hover:border-on-dark hover:bg-on-dark/10"
              >
                {t.home.hero.ctaConnect}
              </button>
            </div>
          </div>
        </section>

        <section id="about" className="section-padding bg-surface">
          <div className="container-wide">
            <SectionLabel>{t.home.about.label}</SectionLabel>

            <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {t.home.about.title}
                  <span className="text-gradient">{t.home.about.titleHighlight}</span>
                </h2>
                <p className="font-subhead mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
                  {t.home.about.body}
                </p>
                <Link
                  to="/about"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
                >
                  {t.home.about.readMore}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>

              <div className="space-y-5">
                {t.home.about.pillars.map((item, index) => {
                  const Icon = PILLAR_ICONS[index]
                  return (
                    <div
                      key={item.title}
                      className="group flex gap-4 rounded-3xl bg-surface-raised p-5 card-shadow transition-all duration-300 hover:card-shadow-hover sm:p-6"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-light text-accent transition-transform duration-300 group-hover:scale-105">
                        <Icon size={20} strokeWidth={1.75} />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-text-primary">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="projects" className="section-padding bg-surface-overlay">
          <div className="container-wide">
            <div className="mb-12 flex flex-col gap-4 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionLabel>{t.home.projects.label}</SectionLabel>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {t.home.projects.title}
                  <span className="text-gradient">{t.home.projects.titleHighlight}</span>
                </h2>
              </div>
              <p className="font-subhead max-w-sm text-base leading-relaxed text-text-secondary sm:text-lg">
                {t.home.projects.subtitle}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  viewDetailsLabel={t.common.viewDetails}
                />
              ))}
            </div>
          </div>
        </section>

        <section id="content" className="section-padding bg-surface">
          <div className="container-wide">
            <div className="mb-12 flex flex-col gap-4 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionLabel>{t.home.content.label}</SectionLabel>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {t.home.content.title}
                  <span className="text-gradient">{t.home.content.titleHighlight}</span>
                </h2>
              </div>
              <p className="font-subhead max-w-sm text-base leading-relaxed text-text-secondary sm:text-lg">
                {t.home.content.subtitle}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {contentItems.map((item) => (
                <ProjectCard
                  key={item.slug}
                  project={item}
                  viewDetailsLabel={t.common.viewDetails}
                />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                to="/content/fpl-creator"
                className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-accent/40"
              >
                {t.home.content.viewAll}
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        </section>

        <section id="experience" className="section-padding bg-surface">
          <div className="container-wide">
            <div className="mb-12 sm:mb-16">
              <SectionLabel>{t.home.experience.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {t.home.experience.title}
                <span className="text-gradient">{t.home.experience.titleHighlight}</span>
              </h2>
              <p className="font-subhead mt-4 max-w-2xl text-lg text-text-secondary sm:text-xl">
                {t.home.experience.subtitle}
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
              <div className="relative overflow-hidden rounded-3xl bg-surface-raised p-8 card-shadow sm:p-10">
                <TrendingUp className="mb-6 text-accent" size={28} />
                <h3 className="font-display text-2xl font-semibold">
                  {t.home.experience.highlightCard.title}
                </h3>
                <p className="mt-2 text-sm text-accent">
                  {t.home.experience.highlightCard.companies}
                </p>
                <p className="mt-6 text-sm leading-relaxed text-text-secondary">
                  {t.home.experience.highlightCard.body}
                </p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {t.home.experience.highlightCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                {experience.map((item, i) => (
                  <ExperienceItem
                    key={`${item.company}-${item.period}`}
                    item={item}
                    index={i}
                    total={experience.length}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="skills" className="section-padding bg-surface-overlay">
          <div className="container-wide">
            <div className="mb-12 text-center sm:mb-16">
              <SectionLabel>{t.home.skills.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {t.home.skills.title}
                <span className="text-gradient">{t.home.skills.titleHighlight}</span>
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {t.home.skills.groups.map((group, index) => {
                const Icon = SKILL_ICONS[index]
                return (
                  <div
                    key={group.title}
                    className="rounded-3xl bg-surface-raised p-6 card-shadow transition-all duration-300 hover:card-shadow-hover sm:p-8"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-light text-accent">
                        <Icon size={20} strokeWidth={1.75} />
                      </div>
                      <h3 className="font-display text-lg font-semibold">
                        {group.title}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-border-subtle bg-surface px-3.5 py-1.5 text-xs font-medium text-text-secondary transition-colors duration-300 hover:border-accent/40 hover:text-accent"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="contact" className="section-padding bg-surface">
          <div className="container-wide">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <SectionLabel>{t.home.contact.label}</SectionLabel>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {t.home.contact.title}
                  <span className="text-gradient">{t.home.contact.titleHighlight}</span>
                </h2>
                <p className="font-subhead mt-6 max-w-md text-lg leading-relaxed text-text-secondary sm:text-xl">
                  {t.home.contact.body}
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="https://www.linkedin.com/in/raywongchinpang/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-3xl bg-surface-raised px-5 py-4 card-shadow transition-all duration-300 hover:card-shadow-hover"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A66C2]/10 text-[#0A66C2]">
                      <Linkedin size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {t.common.linkedin}
                      </p>
                      <p className="text-xs text-text-muted">raywongchinpang</p>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="ml-auto text-text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    />
                  </a>

                  <a
                    href="mailto:wongchinpangray@gmail.com"
                    className="group inline-flex items-center gap-3 rounded-3xl bg-surface-raised px-5 py-4 card-shadow transition-all duration-300 hover:card-shadow-hover"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-light text-accent">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {t.common.emailLabel}
                      </p>
                      <p className="text-xs text-text-muted">
                        wongchinpangray@gmail.com
                      </p>
                    </div>
                    <ArrowUpRight
                      size={16}
                      className="ml-auto text-text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    />
                  </a>
                </div>

                <div className="mt-4">
                  <div className="inline-flex items-center gap-3 rounded-3xl bg-surface-raised px-5 py-4 card-shadow">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#07C160]/10 text-[#07C160]">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {t.common.wechat}
                      </p>
                      <p className="text-xs text-text-muted">{t.common.wechatHint}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-3xl bg-surface-raised p-6 card-shadow sm:p-8"
              >
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-text-secondary"
                    >
                      {t.common.name}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder={t.common.namePlaceholder}
                      className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-text-secondary"
                    >
                      {t.common.email}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder={t.common.emailPlaceholder}
                      className="w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-sm font-medium text-text-secondary"
                    >
                      {t.common.message}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder={t.common.messagePlaceholder}
                      className="w-full resize-none rounded-2xl border border-border-subtle bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors duration-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-text-primary py-3.5 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
                  >
                    {t.common.sendMessage}
                    <ArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
