const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim()
    const company = String(body.company || '').trim()
    const document = String(body.document || '').trim()

    if (!email || !company || !document) {
      return Response.json({ error: 'Email, company, and document are required.' }, { status: 400 })
    }

    if (!EMAIL_PATTERN.test(email)) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (!['resume', 'portfolio'].includes(document)) {
      return Response.json({ error: 'Invalid document type.' }, { status: 400 })
    }

    const accessKey = env.WEB3FORMS_ACCESS_KEY
    if (accessKey) {
      const notifyResponse = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Portfolio download: ${document}`,
          from_name: company,
          email,
          message: [
            'A visitor requested a portfolio download.',
            '',
            `Document: ${document}`,
            `Company: ${company}`,
            `Email: ${email}`,
            `Time: ${new Date().toISOString()}`,
          ].join('\n'),
        }),
      })

      if (!notifyResponse.ok) {
        return Response.json({ error: 'Unable to record download request.' }, { status: 502 })
      }
    }

    return Response.json({ success: true, recorded: Boolean(accessKey) })
  } catch {
    return Response.json({ error: 'Server error.' }, { status: 500 })
  }
}
