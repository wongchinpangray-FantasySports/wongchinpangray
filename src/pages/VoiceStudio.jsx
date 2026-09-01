import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mic2 } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext'
import SectionLabel from '../components/SectionLabel'
import SiteFooter from '../components/SiteFooter'
import SiteNav from '../components/SiteNav'
import GeneratedAudio from '../components/voice-studio/GeneratedAudio'
import ScriptEditor from '../components/voice-studio/ScriptEditor'
import ServerStatus from '../components/voice-studio/ServerStatus'
import VoiceRecorder from '../components/voice-studio/VoiceRecorder'

const STEPS = ['record', 'clone', 'script', 'generate']

export default function VoiceStudio() {
  const { t } = useI18n()
  const vs = t.voiceStudio

  const [serverReady, setServerReady] = useState(false)
  const [serverOnline, setServerOnline] = useState(false)
  const [voiceId, setVoiceId] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)

  const currentStep = !voiceId ? 0 : audioBlob ? 3 : 2

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
              {vs.backHome}
            </Link>

            <div className="mb-10 max-w-3xl">
              <SectionLabel>{vs.hero.label}</SectionLabel>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
                {vs.hero.titleBefore}
                <span className="text-gradient">{vs.hero.titleHighlight}</span>
              </h1>
              <p className="font-subhead mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
                {vs.hero.subtitle}
              </p>
            </div>

            <div className="mb-8">
              <ServerStatus
                onStatusChange={({ online, ready }) => {
                  setServerOnline(online)
                  setServerReady(ready)
                }}
              />
            </div>

            <div className="mb-10 flex flex-wrap gap-2">
              {STEPS.map((step, index) => {
                const labels = [vs.steps.record, vs.steps.clone, vs.steps.script, vs.steps.generate]
                const active = index <= currentStep
                return (
                  <span
                    key={step}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-accent/30 bg-accent-light text-accent'
                        : 'border-border text-text-muted'
                    }`}
                  >
                    <Mic2 size={12} />
                    {index + 1}. {labels[index]}
                  </span>
                )
              })}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                <VoiceRecorder
                  voiceId={voiceId}
                  onVoiceCloned={setVoiceId}
                  serverOnline={serverOnline}
                />
                <ScriptEditor
                  voiceId={voiceId}
                  onGenerated={setAudioBlob}
                  disabled={!serverReady}
                />
              </div>
              <GeneratedAudio audioBlob={audioBlob} />
            </div>

            <div className="mt-12 rounded-2xl border border-border-subtle bg-surface-overlay p-6">
              <h3 className="font-display text-lg font-semibold text-text-primary">
                {vs.howItWorks.title}
              </h3>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-text-secondary">
                {vs.howItWorks.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
