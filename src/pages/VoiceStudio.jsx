import { useState } from 'react'
import { Mic2, Waves } from 'lucide-react'
import { strings } from '../lib/strings'
import GeneratedAudio from '../components/GeneratedAudio'
import ScriptEditor from '../components/ScriptEditor'
import ServerStatus from '../components/ServerStatus'
import VoiceRecorder from '../components/VoiceRecorder'

const STEPS = ['record', 'clone', 'script', 'generate']
const vs = strings

export default function VoiceStudio() {
  const [serverReady, setServerReady] = useState(false)
  const [serverOnline, setServerOnline] = useState(false)
  const [voiceId, setVoiceId] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)

  const currentStep = !voiceId ? 0 : audioBlob ? 3 : 2

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-surface-raised/80 backdrop-blur-sm">
        <div className="container-wide flex items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-on-dark">
              <Waves size={18} />
            </div>
            <span className="font-display text-lg font-semibold text-text-primary">
              Voice Over Studio
            </span>
          </div>
          <span className="hidden text-xs font-medium text-text-muted sm:inline">
            Coqui XTTS v2 · 17 languages
          </span>
        </div>
      </header>

      <main className="section-padding">
        <div className="container-wide">
          <div className="mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent">
              {vs.hero.label}
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              {vs.hero.titleBefore}
              <span className="text-gradient">{vs.hero.titleHighlight}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
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
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-text-muted">
        Voice Over Studio · Self-hosted voice cloning with Coqui XTTS v2
      </footer>
    </div>
  )
}
