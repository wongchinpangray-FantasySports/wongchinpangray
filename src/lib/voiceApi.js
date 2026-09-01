const API_BASE = '/api/voice'

async function handleResponse(response) {
  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json()
      detail = body.detail || body.message || detail
      if (Array.isArray(detail)) {
        detail = detail.map((item) => item.msg || item).join(', ')
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return response
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`)
  await handleResponse(response)
  return response.json()
}

export async function fetchLanguages() {
  const response = await fetch(`${API_BASE}/languages`)
  await handleResponse(response)
  return response.json()
}

export async function warmupServer() {
  const response = await fetch(`${API_BASE}/warmup`, { method: 'POST' })
  await handleResponse(response)
  return response.json()
}

export async function uploadVoice(blob, name) {
  const formData = new FormData()
  formData.append('audio', blob, 'reference.wav')
  if (name) formData.append('name', name)

  const response = await fetch(`${API_BASE}/voices`, {
    method: 'POST',
    body: formData,
  })
  await handleResponse(response)
  return response.json()
}

export async function synthesizeSpeech({ text, voiceId, language }) {
  const response = await fetch(`${API_BASE}/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      language,
    }),
  })
  await handleResponse(response)
  return response.blob()
}
