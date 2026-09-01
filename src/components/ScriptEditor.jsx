import { useEffect, useState } from 'react'
import { FileText, Globe, Loader2, Sparkles } from 'lucide-react'
import { strings } from '../lib/strings'
import { fetchLanguages, synthesizeSpeech } from '../lib/voiceApi'

const se = strings.script

export default function ScriptEditor({ voiceId, onGenerated, disabled }) {
  const [text, setText] = useState(se.defaultScript)
  const [language, setLanguage] = useState('en')
  const [languages, setLanguages] = useState([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLanguages()
      .then((data) => setLanguages(data.languages || []))
      .catch(() => {
        setLanguages([
          { code: 'en', name: 'English' },
          { code: 'zh-cn', name: 'Chinese' },
        ])
      })
  }, [])

  const handleGenerate = async () => {
    if (!voiceId || !text.trim()) return
    setGenerating(true)
    setError(null)
    try {
      const blob = await synthesizeSpeech({
        text: text.trim(),
        voiceId,
        language,
      })
      onGenerated?.(blob)
    } catch (err) {
      setError(err.message || se.generateError)
    } finally {
      setGenerating(false)
    }
  }

  const canGenerate = voiceId && text.trim().length > 0 && !disabled && !generating

  return (
    <div className="rounded-3xl border border-border bg-surface-raised p-6 card-shadow sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            {se.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {se.subtitle}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
          <FileText size={18} />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="voice-language"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary"
        >
          <Globe size={14} className="text-text-muted" />
          {se.language}
        </label>
        <select
          id="voice-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-accent disabled:opacity-50"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label
          htmlFor="voice-script"
          className="mb-2 block text-sm font-medium text-text-primary"
        >
          {se.scriptLabel}
        </label>
        <textarea
          id="voice-script"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          disabled={disabled || !voiceId}
          placeholder={se.placeholder}
          className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent disabled:opacity-50"
        />
        <p className="mt-2 text-xs text-text-muted">
          {text.length} / 5000 {se.characters}
        </p>
      </div>

      {!voiceId && (
        <p className="mb-4 text-sm text-text-muted">{se.needVoice}</p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="inline-flex items-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-on-dark transition-colors hover:bg-accent disabled:opacity-50"
      >
        {generating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {se.generating}
          </>
        ) : (
          <>
            <Sparkles size={16} />
            {se.generate}
          </>
        )}
      </button>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}
    </div>
  )
}
