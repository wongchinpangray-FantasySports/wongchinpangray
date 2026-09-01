import { useEffect, useRef, useState } from 'react'
import { Loader2, Mic, Square, Upload, Volume2 } from 'lucide-react'
import { strings } from '../lib/strings'
import { createAudioUrl, revokeAudioUrl, WavRecorder } from '../lib/recordWav'
import { uploadVoice } from '../lib/voiceApi'

const MIN_DURATION_MS = 3000
const RECOMMENDED_DURATION_MS = 6000
const vr = strings.recorder

export default function VoiceRecorder({ voiceId, onVoiceCloned, serverOnline = true }) {
  const recorderRef = useRef(null)
  const fileInputRef = useRef(null)
  const previewUrlRef = useRef(null)

  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewBlob, setPreviewBlob] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [localVoiceId, setLocalVoiceId] = useState(voiceId)

  useEffect(() => {
    setLocalVoiceId(voiceId)
  }, [voiceId])

  useEffect(() => {
    let timer
    if (recording) {
      timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    }
    return () => clearInterval(timer)
  }, [recording])

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) revokeAudioUrl(previewUrlRef.current)
    }
  }, [])

  const setPreview = (blob) => {
    if (previewUrlRef.current) revokeAudioUrl(previewUrlRef.current)
    const url = createAudioUrl(blob)
    previewUrlRef.current = url
    setPreviewUrl(url)
    setPreviewBlob(blob)
  }

  const handleStart = async () => {
    setError(null)
    try {
      recorderRef.current = new WavRecorder()
      await recorderRef.current.start()
      setRecording(true)
      setElapsed(0)
    } catch (err) {
      setError(err.message || vr.micError)
    }
  }

  const handleStop = async () => {
    if (!recorderRef.current) return
    const { blob, durationMs } = recorderRef.current.stop()
    recorderRef.current = null
    setRecording(false)

    if (durationMs < MIN_DURATION_MS) {
      setError(vr.tooShort)
      return
    }

    setPreview(blob)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    setPreview(file)
    event.target.value = ''
  }

  const handleClone = async () => {
    if (!previewBlob) return
    setUploading(true)
    setError(null)
    try {
      const result = await uploadVoice(previewBlob)
      setLocalVoiceId(result.voice_id)
      onVoiceCloned?.(result.voice_id)
    } catch (err) {
      setError(err.message || vr.cloneError)
    } finally {
      setUploading(false)
    }
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const durationHint =
    elapsed >= RECOMMENDED_DURATION_MS / 1000 ? vr.durationGood : vr.durationHint

  return (
    <div className="rounded-3xl border border-border bg-surface-raised p-6 card-shadow sm:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            {vr.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {vr.subtitle}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
          <Mic size={18} />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {!recording ? (
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-text-primary px-6 py-3 text-sm font-semibold text-on-dark transition-colors hover:bg-accent"
          >
            <Mic size={16} />
            {vr.startRecording}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleStop}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-dark transition-colors hover:bg-accent-dim"
          >
            <Square size={14} fill="currentColor" />
            {vr.stopRecording} ({formatTime(elapsed)})
          </button>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={recording}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary disabled:opacity-50"
        >
          <Upload size={16} />
          {vr.uploadWav}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/wav,audio/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {recording && (
        <p className="mt-3 text-xs text-text-muted">{durationHint}</p>
      )}

      {previewUrl && (
        <div className="mt-6 rounded-2xl border border-border-subtle bg-surface p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-text-primary">
            <Volume2 size={16} className="text-accent" />
            {vr.preview}
          </div>
          <audio controls src={previewUrl} className="w-full" />
          {!localVoiceId && (
            <button
              type="button"
              onClick={handleClone}
              disabled={uploading || !serverOnline}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-text-primary px-5 py-2.5 text-sm font-semibold text-on-dark transition-colors hover:bg-accent disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {vr.cloning}
                </>
              ) : (
                vr.cloneVoice
              )}
            </button>
          )}
          {localVoiceId && (
            <p className="mt-3 text-sm font-medium text-emerald-700">{vr.cloned}</p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-accent">{error}</p>
      )}
    </div>
  )
}
