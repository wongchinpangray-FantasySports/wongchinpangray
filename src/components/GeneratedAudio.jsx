import { useEffect, useRef, useState } from 'react'
import { Download, Headphones, Pause, Play } from 'lucide-react'
import { strings } from '../lib/strings'
import { createAudioUrl, revokeAudioUrl } from '../lib/recordWav'

const ga = strings.audio

export default function GeneratedAudio({ audioBlob }) {
  const audioRef = useRef(null)
  const urlRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)

  useEffect(() => {
    if (urlRef.current) {
      revokeAudioUrl(urlRef.current)
      urlRef.current = null
    }
    if (!audioBlob) {
      setAudioUrl(null)
      setPlaying(false)
      return undefined
    }

    const url = createAudioUrl(audioBlob)
    urlRef.current = url
    setAudioUrl(url)
    setPlaying(false)

    return () => {
      revokeAudioUrl(url)
      urlRef.current = null
    }
  }, [audioBlob])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = 'voice-over-output.wav'
    link.click()
  }

  if (!audioBlob) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface-overlay/50 p-6 text-center sm:p-8">
        <Headphones size={28} className="mx-auto mb-3 text-text-muted" />
        <p className="text-sm text-text-muted">{ga.empty}</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-border bg-surface-raised p-6 card-shadow sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            {ga.title}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">{ga.subtitle}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
          <Headphones size={18} />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-2.5 text-sm font-semibold text-on-dark transition-colors hover:bg-accent"
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? ga.pause : ga.play}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
        >
          <Download size={16} />
          {ga.download}
        </button>
      </div>

      {audioUrl && (
        <div className="mt-4">
          <audio controls src={audioUrl} className="w-full" />
        </div>
      )}
    </div>
  )
}
