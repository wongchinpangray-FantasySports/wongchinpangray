export const DOWNLOADS = {
  resume: {
    id: 'resume',
    path: '/downloads/ray-wong-resume.pdf',
    filename: 'Ray-Wong-Resume.pdf',
  },
  portfolio: {
    id: 'portfolio',
    path: '/downloads/ray-wong-portfolio.pdf',
    filename: 'Ray-Wong-Portfolio.pdf',
  },
}

export async function submitDownloadLead({ email, company, document }) {
  const response = await fetch('/api/download-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, company, document }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || 'Unable to submit download request.')
  }

  return response.json()
}

export function triggerDownload(downloadKey) {
  const file = DOWNLOADS[downloadKey]
  if (!file) return

  const link = document.createElement('a')
  link.href = file.path
  link.download = file.filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
}
