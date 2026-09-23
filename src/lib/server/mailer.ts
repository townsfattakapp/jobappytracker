
/**
 * Transactional email. Uses Resend when RESEND_API_KEY is set, otherwise any
 * SMTP server given as SMTP_URL. EMAIL_FROM is required with either. When
 * neither is configured, `isMailerConfigured()` is false and sign-up
 * auto-verifies (development and self-hosted setups without email).
 */

export interface Mail {
  to: string
  subject: string
  html: string
  text: string
}

function from(): string {
  return (process.env.EMAIL_FROM || '').trim()
}

export function isMailerConfigured(): boolean {
  const sender = from()
  if (!sender) return false
  return Boolean((process.env.RESEND_API_KEY || '').trim() || (process.env.SMTP_URL || '').trim())
}

export async function sendMail(mail: Mail): Promise<void> {
  const sender = from()
  const resendKey = (process.env.RESEND_API_KEY || '').trim()
  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: sender, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Resend rejected the email (${res.status}): ${body.slice(0, 300)}`)
    }
    return
  }
  const smtpUrl = (process.env.SMTP_URL || '').trim()
  if (smtpUrl) {
    const nodemailer = await import('nodemailer')
    const transport = nodemailer.createTransport(smtpUrl)
    await transport.sendMail({ from: sender, to: mail.to, subject: mail.subject, html: mail.html, text: mail.text })
    return
  }
  throw new Error('No mailer configured (set RESEND_API_KEY or SMTP_URL, and EMAIL_FROM)')
}

export function siteUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || process.env.AUTH_URL || process.env.NEXTAUTH_URL || '').trim().replace(/\/$/, '')
  if (configured) return configured
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c)
}

/** Branded wrapper for the short transactional emails we send. */
export function renderEmail(opts: { title: string; intro: string; ctaLabel: string; ctaUrl: string; outro: string }): { html: string; text: string } {
  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f4fb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1b2a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f4fb;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e6e4f2;">
        <tr><td style="height:6px;background:linear-gradient(90deg,#f58529,#dd2a7b,#8134af,#515bd4);"></td></tr>
        <tr><td style="padding:32px 32px 8px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#6b6980;font-weight:700;">Prep by EVOLW</p>
          <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;">${escapeHtml(opts.title)}</h1>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#3d3b50;">${escapeHtml(opts.intro)}</p>
          <a href="${opts.ctaUrl}" style="display:inline-block;background:#dd2a7b;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 22px;border-radius:12px;">${escapeHtml(opts.ctaLabel)}</a>
          <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#6b6980;">${escapeHtml(opts.outro)}</p>
          <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#8d8ba3;word-break:break-all;">If the button does not work, open this link: ${escapeHtml(opts.ctaUrl)}</p>
        </td></tr>
        <tr><td style="padding:18px 32px 28px;font-size:12px;color:#8d8ba3;">Developed by Evolw · <a href="https://www.evolw.in" style="color:#8d8ba3;">www.evolw.in</a></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
  const text = `${opts.title}\n\n${opts.intro}\n\n${opts.ctaLabel}: ${opts.ctaUrl}\n\n${opts.outro}\n\nPrep by EVOLW · www.evolw.in`
  return { html, text }
}
