/**
 * Record microphone input and encode as a WAV Blob.
 */

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < float32Array.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]))
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }
  return buffer
}

function encodeWav(samples, sampleRate) {
  const pcm = floatTo16BitPCM(samples)
  const byteRate = sampleRate * 2
  const blockAlign = 2
  const dataSize = pcm.byteLength
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  new Uint8Array(buffer, 44).set(new Uint8Array(pcm))
  return buffer
}

function mergeBuffers(buffers) {
  const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0)
  const result = new Float32Array(totalLength)
  let offset = 0
  for (const buf of buffers) {
    result.set(buf, offset)
    offset += buf.length
  }
  return result
}

export class WavRecorder {
  constructor() {
    this.mediaStream = null
    this.audioContext = null
    this.source = null
    this.processor = null
    this.chunks = []
    this.sampleRate = 44100
    this.startTime = null
  }

  async start() {
    this.chunks = []
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    this.audioContext = new AudioContext()
    this.sampleRate = this.audioContext.sampleRate
    this.source = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1)

    this.processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0)
      this.chunks.push(new Float32Array(input))
    }

    this.source.connect(this.processor)
    this.processor.connect(this.audioContext.destination)
    this.startTime = Date.now()
  }

  stop() {
    const durationMs = this.startTime ? Date.now() - this.startTime : 0

    if (this.processor) {
      this.processor.disconnect()
      this.processor.onaudioprocess = null
    }
    if (this.source) this.source.disconnect()
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
    }
    if (this.audioContext) {
      this.audioContext.close()
    }

    const samples = mergeBuffers(this.chunks)
    const wavBuffer = encodeWav(samples, this.sampleRate)
    const blob = new Blob([wavBuffer], { type: 'audio/wav' })

    this.mediaStream = null
    this.audioContext = null
    this.source = null
    this.processor = null
    this.chunks = []
    this.startTime = null

    return { blob, durationMs, sampleRate: this.sampleRate }
  }
}

export function createAudioUrl(blob) {
  return URL.createObjectURL(blob)
}

export function revokeAudioUrl(url) {
  if (url) URL.revokeObjectURL(url)
}
