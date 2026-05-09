import nodemailer from 'nodemailer'

let cachedTransport = null
let cachedKey = ''

function envKey() {
  return [
    process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER,
    process.env.SMTP_PASS, process.env.SMTP_SECURE,
  ].join('|')
}

function getTransport() {
  const key = envKey()
  if (cachedTransport && cachedKey === key) return cachedTransport

  const host = process.env.SMTP_HOST
  if (!host) return null

  const port = Number(process.env.SMTP_PORT || 587)
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465 // SMTPS

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
  cachedKey = key
  return cachedTransport
}

const MAIL_TO = process.env.MAIL_TO || 'info@carvaanholidays.com'
const MAIL_FROM = process.env.MAIL_FROM || `Carvaan Holidays <${process.env.SMTP_USER || MAIL_TO}>`

const escape = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const fmtDate = (d) => {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return String(d) }
}

const row = (label, value) =>
  value ? `<tr><td style="padding:6px 12px;color:#6b7d83;font-size:12px;text-transform:uppercase;letter-spacing:.6px;font-weight:600;width:120px;">${escape(label)}</td><td style="padding:6px 12px;color:#08434A;font-size:14px;font-weight:500;">${escape(value)}</td></tr>` : ''

function buildEnquiryHtml(e) {
  const subject = `${e.type || 'Enquiry'}${e.destination ? ' · ' + e.destination : ''}`
  return `
<!doctype html><html><body style="margin:0;background:#f8fafb;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#08434A 0%,#12B84A 130%);padding:20px 24px;color:#fff;">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;opacity:.85;">New ${escape(e.type || 'Enquiry')} enquiry</div>
      <div style="font-size:20px;font-weight:800;margin-top:4px;">${escape(subject)}</div>
      ${e.source ? `<div style="font-size:12px;opacity:.85;margin-top:4px;">Source: ${escape(e.source)}</div>` : ''}
    </div>
    <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
      ${row('Name', e.name)}
      ${row('Email', e.email)}
      ${row('Phone', e.phone)}
      ${row('From', e.from)}
      ${row('Destination', e.destination)}
      ${row('Package', e.packageTitle)}
      ${row('Travel date', fmtDate(e.travelDate))}
      ${row('Travellers', e.travellers)}
      ${e.message ? `<tr><td colspan="2" style="padding:14px 12px;border-top:1px solid #f1f5f9;color:#08434A;font-size:14px;line-height:1.55;white-space:pre-wrap;">${escape(e.message)}</td></tr>` : ''}
    </table>
    <div style="padding:14px 24px;border-top:1px solid #f1f5f9;font-size:12px;color:#6b7d83;">
      Received on ${escape(new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }))}.
      Reply directly to this email to contact ${escape(e.name || 'the customer')}.
    </div>
  </div>
</body></html>`
}

function buildEnquiryText(e) {
  const lines = [
    `New ${e.type || 'Enquiry'} enquiry${e.source ? ` (source: ${e.source})` : ''}`,
    '',
    e.name && `Name: ${e.name}`,
    e.email && `Email: ${e.email}`,
    e.phone && `Phone: ${e.phone}`,
    e.from && `From: ${e.from}`,
    e.destination && `Destination: ${e.destination}`,
    e.packageTitle && `Package: ${e.packageTitle}`,
    e.travelDate && `Travel date: ${fmtDate(e.travelDate)}`,
    e.travellers && `Travellers: ${e.travellers}`,
    e.message && `\nMessage:\n${e.message}`,
  ].filter(Boolean)
  return lines.join('\n')
}

export async function sendEnquiryEmail(enquiry) {
  const transport = getTransport()
  if (!transport) {
    console.warn('[mailer] SMTP_HOST not configured — skipping enquiry email notification')
    return { skipped: true }
  }
  try {
    const subject = `New ${enquiry.type || 'enquiry'}: ${enquiry.destination || enquiry.packageTitle || enquiry.name || 'visitor'}`
    const info = await transport.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: enquiry.email || undefined,
      subject,
      html: buildEnquiryHtml(enquiry),
      text: buildEnquiryText(enquiry),
    })
    console.log('[mailer] enquiry email sent:', info.messageId, '→', MAIL_TO)
    return { ok: true, messageId: info.messageId }
  } catch (err) {
    console.error('[mailer] failed to send enquiry email:', err?.message || err)
    return { ok: false, error: err?.message }
  }
}

export async function sendContactEmail(contact) {
  const transport = getTransport()
  if (!transport) return { skipped: true }
  try {
    const subject = `New contact form: ${contact.name || 'visitor'}`
    const html = buildEnquiryHtml({
      type: 'Contact form',
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      source: 'contact-page',
    })
    const text = buildEnquiryText({
      type: 'Contact form',
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
    })
    const info = await transport.sendMail({
      from: MAIL_FROM, to: MAIL_TO,
      replyTo: contact.email || undefined,
      subject, html, text,
    })
    return { ok: true, messageId: info.messageId }
  } catch (err) {
    console.error('[mailer] failed to send contact email:', err?.message || err)
    return { ok: false, error: err?.message }
  }
}
