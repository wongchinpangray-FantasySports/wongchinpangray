import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUpRight,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
  Vote,
} from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext'
import SectionLabel from '../components/SectionLabel'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'

const MODULE_ICONS = [
  LayoutDashboard,
  Target,
  Users,
  ClipboardList,
  DollarSign,
  Vote,
  MessageSquare,
  Shield,
]

function PhoneFrame({ title, children, accent = '#e6a8c7', chrome, className = '' }) {
  return (
    <figure
      className={`flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-[#0a0608] card-shadow ${className}`}
    >
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-white/10 px-4">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
        </div>
        <div className="mx-auto rounded-full bg-white/5 px-3 py-0.5 text-[10px] text-white/50">
          {chrome}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 py-6">
        <div
          className="flex h-[300px] w-full max-w-[240px] flex-col overflow-hidden rounded-[1.75rem] border border-white/10"
          style={{ background: '#100d13' }}
        >
          <div className="flex h-6 shrink-0 items-center justify-between px-3 pt-2 text-[9px] text-white/45">
            <span>9:41</span>
            <span>···</span>
          </div>
          <div className="flex h-12 shrink-0 items-center gap-2 px-3">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
              style={{ background: accent }}
            >
              FPL
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-white">{title.appName}</p>
              <p className="truncate text-[9px] text-white/40">{title.screen}</p>
            </div>
          </div>
          <div className="flex h-[168px] flex-col px-2.5 pb-3">{children}</div>
        </div>
      </div>

      <figcaption className="flex h-11 shrink-0 items-center justify-center border-t border-border bg-surface-raised px-4">
        <p className="text-xs font-medium text-text-primary">{title.screen}</p>
      </figcaption>
    </figure>
  )
}

function DashboardMockup({ m, appName }) {
  return (
    <PhoneFrame title={{ appName, screen: m.title }} chrome={appName}>
      <div className="flex h-full flex-col gap-2">
        <div className="rounded-xl border border-white/8 bg-white/5 p-2.5">
          <p className="text-[8px] uppercase tracking-wider text-[#e6a8c7]">{m.nextMatch}</p>
          <p className="mt-1 text-[10px] font-semibold text-white">{m.opponent}</p>
          <p className="mt-1 text-[9px] text-white/50">{m.datetime}</p>
          <div className="mt-2 flex gap-1">
            {m.chips.map((chip, i) => (
              <span
                key={chip}
                className={`rounded-full px-1.5 py-0.5 text-[8px] ${
                  i === 0
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : i === 1
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1.5">
          {m.gridLabels.map((label) => (
            <div
              key={label}
              className="flex items-center justify-center rounded-lg border border-white/8 text-[8px] text-white/60"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  )
}

function TacticalBoardMockup({ m, appName }) {
  const positions = [
    { x: '50%', y: '14%', label: m.positions[0] },
    { x: '20%', y: '42%', label: m.positions[1] },
    { x: '50%', y: '38%', label: m.positions[2] },
    { x: '80%', y: '42%', label: m.positions[3] },
    { x: '50%', y: '72%', label: m.positions[4] },
  ]

  return (
    <PhoneFrame title={{ appName, screen: m.title }} accent="#FF6FAF" chrome={appName}>
      <div
        className="relative h-full overflow-hidden rounded-xl border border-emerald-900/40"
        style={{
          background: 'linear-gradient(180deg, #1a4d2e 0%, #163d26 50%, #1a4d2e 100%)',
        }}
      >
        <div className="absolute inset-x-3 top-1/2 h-px bg-white/15" />
        <div className="absolute left-1/2 top-3 h-8 w-8 -translate-x-1/2 rounded-full border border-white/20" />
        <div className="absolute bottom-3 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full border border-white/20" />
        {positions.map((player) => (
          <div
            key={player.label}
            className="absolute flex h-6 w-6 items-center justify-center rounded-full text-[7px] font-bold text-white"
            style={{
              left: player.x,
              top: player.y,
              background: '#FF6FAF',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {player.label}
          </div>
        ))}
      </div>
    </PhoneFrame>
  )
}

function SquadMockup({ m, appName }) {
  return (
    <PhoneFrame title={{ appName, screen: m.title }} chrome={appName}>
      <div className="flex h-full flex-col gap-2">
        <div className="flex gap-1.5">
          {['RW', 'AT', 'SL'].map((initials, i) => (
            <div
              key={initials}
              className="flex flex-1 flex-col items-center rounded-lg border border-white/8 bg-white/5 p-1.5"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6a8c7] text-[7px] font-bold text-[#100d13]">
                {initials}
              </div>
              <p className="mt-1 text-[7px] text-[#e6a8c7]">#{i + 1}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-center rounded-lg border border-white/8 bg-white/5 p-2">
          <p className="text-[9px] text-white">{m.playerName}</p>
          <div className="mt-1.5 h-1 rounded-full bg-white/10">
            <div className="h-1 w-[70%] rounded-full bg-[#e6a8c7]" />
          </div>
          <p className="mt-2 text-[8px] text-white/45">{m.statLabel}</p>
        </div>
      </div>
    </PhoneFrame>
  )
}

export default function ClubManagementDetail() {
  const { t } = useI18n()
  const c = t.club
  const m = c.mockups

  const modules = c.modules.items.map((item, index) => ({
    ...item,
    icon: MODULE_ICONS[index],
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

            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <SectionLabel>{c.hero.label}</SectionLabel>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                  {c.hero.titleBefore}
                  <span className="text-gradient">{c.hero.titleHighlight}</span>
                </h1>
                <p className="font-subhead mt-5 max-w-lg text-lg leading-relaxed text-text-secondary">
                  {c.hero.description}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {c.hero.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border-subtle bg-surface-raised px-3 py-1 text-xs font-medium text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  to="/#contact"
                  className="group mt-7 inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
                >
                  {t.common.discussProject}
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </div>

              <DashboardMockup m={m.dashboard} appName={m.appName} />
            </div>
          </div>
        </section>

        <section className="border-y border-border-subtle bg-surface-overlay px-5 py-10 sm:px-8 lg:px-12">
          <div className="container-wide grid grid-cols-2 gap-3 sm:grid-cols-4">
            {c.metrics.items.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl bg-surface-raised px-4 py-4 text-center card-shadow sm:px-5 sm:py-5"
              >
                <p className="font-display text-xl font-semibold text-text-primary sm:text-2xl">
                  {metric.value}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-padding bg-surface">
          <div className="container-wide">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel>{c.overview.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {c.overview.titleBefore}
                <span className="text-gradient">{c.overview.titleHighlight}</span>
              </h2>
              <p className="font-subhead mt-4 text-lg text-text-secondary">
                {c.overview.subtitle}
              </p>
            </div>

            <div className="mt-12 grid items-stretch gap-5 md:grid-cols-3">
              <DashboardMockup m={m.dashboard} appName={m.appName} />
              <TacticalBoardMockup m={m.tacticalBoard} appName={m.appName} />
              <SquadMockup m={m.squad} appName={m.appName} />
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface-overlay">
          <div className="container-wide">
            <div className="mb-10 text-center">
              <SectionLabel>{c.modules.label}</SectionLabel>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {c.modules.title}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map((module) => (
                <article
                  key={module.title}
                  className="rounded-2xl bg-surface-raised p-5 card-shadow"
                >
                  <module.icon size={18} className="text-tech" strokeWidth={1.75} />
                  <h3 className="mt-3 font-display text-base font-semibold">
                    {module.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {module.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface">
          <div className="container-wide">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl bg-surface-raised p-6 card-shadow sm:p-7">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-tech/10 px-3 py-1 text-xs font-semibold text-tech">
                  <Sparkles size={13} />
                  {c.build.prototype.badge}
                </div>
                <h3 className="font-display text-xl font-semibold">
                  {c.build.prototype.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {c.build.prototype.body}
                </p>
              </div>

              <div className="rounded-3xl bg-surface-raised p-6 card-shadow sm:p-7">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
                  <Trophy size={13} />
                  {c.build.production.badge}
                </div>
                <h3 className="font-display text-xl font-semibold">
                  {c.build.production.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {c.build.production.body}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {c.build.tech.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border-subtle bg-surface-raised px-3.5 py-1.5 text-xs font-medium text-text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-surface-overlay">
          <div className="container-wide text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {c.cta.title}
            </h2>
            <Link
              to="/#contact"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-text-primary px-8 py-3.5 text-sm font-semibold text-on-dark transition-all duration-300 hover:bg-accent"
            >
              {t.common.discussProject}
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
