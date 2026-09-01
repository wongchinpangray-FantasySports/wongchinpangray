import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Server } from 'lucide-react'
import { strings } from '../lib/strings'
import { checkHealth, warmupServer } from '../lib/voiceApi'

const vs = strings.server

export default function ServerStatus({ onStatusChange }) {
  const [status, setStatus] = useState('checking')
  const [detail, setDetail] = useState(null)
  const [warming, setWarming] = useState(false)

  const emitStatus = (online, ready) => {
    onStatusChange?.({ online, ready })
  }

  const poll = async () => {
    try {
      const data = await checkHealth()
      setDetail(data)
      if (data.model_loaded) {
        setStatus('ready')
        emitStatus(true, true)
      } else {
        setStatus('online')
        emitStatus(true, false)
      }
    } catch {
      setStatus('offline')
      setDetail(null)
      emitStatus(false, false)
    }
  }

  useEffect(() => {
    poll()
    const interval = setInterval(poll, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleWarmup = async () => {
    setWarming(true)
    try {
      await warmupServer()
      await poll()
    } catch (err) {
      setStatus('error')
      setDetail({ error: err.message })
    } finally {
      setWarming(false)
    }
  }

  const statusConfig = {
    checking: {
      icon: Loader2,
      iconClass: 'animate-spin text-text-muted',
      label: vs.checking,
      badge: 'bg-surface-overlay text-text-muted',
    },
    ready: {
      icon: CheckCircle2,
      iconClass: 'text-emerald-600',
      label: vs.ready,
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    online: {
      icon: Server,
      iconClass: 'text-amber-600',
      label: vs.online,
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    offline: {
      icon: AlertCircle,
      iconClass: 'text-accent',
      label: vs.offline,
      badge: 'bg-accent-light text-accent border-accent/20',
    },
    error: {
      icon: AlertCircle,
      iconClass: 'text-accent',
      label: vs.error,
      badge: 'bg-accent-light text-accent border-accent/20',
    },
  }

  const config = statusConfig[status] || statusConfig.offline
  const Icon = config.icon

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface-raised px-5 py-4 card-shadow">
      <div className="flex items-center gap-3">
        <Icon size={18} className={config.iconClass} />
        <div>
          <p className="text-sm font-semibold text-text-primary">{config.label}</p>
          {detail?.device && (
            <p className="text-xs text-text-muted">
              {vs.device}: {detail.device}
              {detail.model_loaded ? ` · ${vs.modelLoaded}` : ''}
            </p>
          )}
          {detail?.error && (
            <p className="mt-0.5 max-w-md text-xs text-accent">{detail.error}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${config.badge}`}
        >
          {config.label}
        </span>
        {(status === 'online' || status === 'error') && (
          <button
            type="button"
            onClick={handleWarmup}
            disabled={warming || status === 'offline'}
            className="rounded-full bg-text-primary px-4 py-1.5 text-xs font-semibold text-on-dark transition-colors hover:bg-accent disabled:opacity-50"
          >
            {warming ? vs.warming : vs.loadModel}
          </button>
        )}
      </div>
    </div>
  )
}
