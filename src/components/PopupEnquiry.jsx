import { useEffect, useState } from 'react'
import { submitEnquiry, fetchPopupConfig } from '../api/client'
import './PopupEnquiry.css'

const todayISO = () => new Date().toISOString().slice(0, 10)

const INITIAL = {
  destination: '',
  travelDate: '',
  travellers: '2 Adults',
  tripType: 'Family Holiday',
  budget: '₹50k – ₹1L per person',
  name: '',
  phone: '',
  email: '',
  message: '',
}

const FALLBACK_CFG = {
  bannerUrl: '',
  bannerHeading: 'Up to 30% off',
  bannerSubheading: 'On hand-picked holiday packages this season',
  bannerOverlayColor: '#08434A',
  tag: 'Limited-time offer',
  title: 'Get up to 30% off on your next holiday',
  subtitle: "Tell us a few quick details and our travel expert will share a custom quote — free, no obligation.",
  successTitle: 'Thanks for your enquiry!',
  successMessage: "We'll call you within 4 business hours with the best deals.",
  cta: 'Get my custom quote',
  legal: "By submitting, you consent to be contacted by Carvaan Holidays. We'll never share your details.",
  intervalSeconds: 45,
  active: true,
  showAfterSubmit: false,
  fields: {
    destination: true, travelDate: true, travellers: true, tripType: true, budget: true,
    name: true, phone: true, email: true, message: true,
  },
}

export default function PopupEnquiry() {
  const [cfg, setCfg] = useState(null)
  const [open, setOpen] = useState(false)
  const [submittedOnce, setSubmittedOnce] = useState(false)
  const [form, setForm] = useState(INITIAL)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  // Load config
  useEffect(() => {
    fetchPopupConfig()
      .then((c) => setCfg({ ...FALLBACK_CFG, ...(c || {}), fields: { ...FALLBACK_CFG.fields, ...(c?.fields || {}) } }))
      .catch(() => setCfg(FALLBACK_CFG))
  }, [])

  // Auto-open every N seconds (until the user submits successfully).
  useEffect(() => {
    if (!cfg) return
    if (cfg.active === false) return
    if (submittedOnce && !cfg.showAfterSubmit) return
    const ms = Math.max(15, Number(cfg.intervalSeconds) || 45) * 1000
    const id = setInterval(() => {
      setOpen((prev) => (prev ? prev : true))
    }, ms)
    return () => clearInterval(id)
  }, [cfg, submittedOnce])

  // Lock body scroll + ESC to close while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open || !cfg) return null

  const fields = cfg.fields || FALLBACK_CFG.fields
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const close = () => setOpen(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)

    const need = (key, label) => {
      if (fields[key] && !String(form[key] || '').trim()) {
        setError(`Please fill ${label}.`)
        return false
      }
      return true
    }
    if (!need('destination', 'destination')) return
    if (!need('name', 'your name')) return
    if (!need('phone', 'phone number')) return
    if (!need('email', 'email')) return

    setBusy(true)
    try {
      const extra = []
      if (fields.tripType) extra.push(`Trip type: ${form.tripType}`)
      if (fields.budget) extra.push(`Budget: ${form.budget}`)
      const tagged = `[From Popup Form]${extra.length ? ' ' + extra.join('. ') + '.' : ''}${form.message ? ' Notes: ' + form.message : ''}`
      await submitEnquiry({
        type: 'Holidays',
        destination: form.destination,
        travelDate: form.travelDate || undefined,
        travellers: form.travellers,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: tagged,
        source: 'popup-form',
      })
      setSubmitted(true)
      setSubmittedOnce(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not submit. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const done = () => {
    setSubmitted(false)
    setForm(INITIAL)
    setOpen(false)
  }

  return (
    <div className="pe-modal" role="dialog" aria-modal="true" aria-labelledby="pe-title" onClick={close}>
      <div className="pe-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="pe-modal__close" onClick={close} aria-label="Close">×</button>

        {/* Left banner */}
        <aside
          className="pe-modal__banner"
          style={{
            backgroundImage: cfg.bannerUrl ? `url(${cfg.bannerUrl})` : undefined,
            background: cfg.bannerUrl ? undefined : `linear-gradient(135deg, ${cfg.bannerOverlayColor || '#08434A'} 0%, #12B84A 130%)`,
          }}
        >
          <div
            className="pe-modal__banner-overlay"
            style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, ${hexToRgba(cfg.bannerOverlayColor || '#08434A', 0.78)} 100%)` }}
          />
          <div className="pe-modal__banner-content">
            <span className="pe-modal__banner-tag">{cfg.tag}</span>
            <h2 className="pe-modal__banner-heading">{cfg.bannerHeading}</h2>
            <p className="pe-modal__banner-sub">{cfg.bannerSubheading}</p>
          </div>
        </aside>

        {/* Right form */}
        <div className="pe-modal__right">
          {submitted ? (
            <div className="pe-modal__success">
              <div className="pe-modal__success-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2>{cfg.successTitle.replace('{name}', form.name.split(' ')[0] || 'traveller')}</h2>
              <p>
                {cfg.successMessage}
                {form.phone && <> <br /><strong>{form.phone}</strong></>}
              </p>
              <button className="pe-modal__btn" onClick={done}>Done</button>
            </div>
          ) : (
            <form className="pe-modal__form" onSubmit={submit}>
              <header className="pe-modal__header">
                <span className="pe-modal__tag">{cfg.tag}</span>
                <h2 id="pe-title">{cfg.title}</h2>
                <p>{cfg.subtitle}</p>
              </header>

              <div className="pe-modal__grid">
                {fields.destination && (
                  <label className="pe-modal__field pe-modal__field--wide">
                    <span>Where do you want to travel? *</span>
                    <input
                      type="text"
                      placeholder="e.g. Bali, Maldives, Kashmir…"
                      value={form.destination}
                      onChange={(e) => set('destination', e.target.value)}
                      required
                    />
                  </label>
                )}

                {fields.travelDate && (
                  <label className="pe-modal__field">
                    <span>When are you planning?</span>
                    <input
                      type="date"
                      min={todayISO()}
                      value={form.travelDate}
                      onChange={(e) => set('travelDate', e.target.value)}
                    />
                  </label>
                )}

                {fields.travellers && (
                  <label className="pe-modal__field">
                    <span>How many travellers?</span>
                    <select value={form.travellers} onChange={(e) => set('travellers', e.target.value)}>
                      <option>1 Adult</option>
                      <option>2 Adults</option>
                      <option>2 Adults, 1 Child</option>
                      <option>2 Adults, 2 Children</option>
                      <option>Family (4+)</option>
                      <option>Group (5+)</option>
                    </select>
                  </label>
                )}

                {fields.tripType && (
                  <label className="pe-modal__field">
                    <span>Trip type</span>
                    <select value={form.tripType} onChange={(e) => set('tripType', e.target.value)}>
                      <option>Family Holiday</option>
                      <option>Honeymoon</option>
                      <option>Couple Getaway</option>
                      <option>Adventure</option>
                      <option>Beach &amp; Leisure</option>
                      <option>Pilgrimage</option>
                      <option>Group / Friends</option>
                    </select>
                  </label>
                )}

                {fields.budget && (
                  <label className="pe-modal__field">
                    <span>Budget per person</span>
                    <select value={form.budget} onChange={(e) => set('budget', e.target.value)}>
                      <option>Under ₹25k</option>
                      <option>₹25k – ₹50k</option>
                      <option>₹50k – ₹1L per person</option>
                      <option>₹1L – ₹2L</option>
                      <option>₹2L+</option>
                      <option>Flexible</option>
                    </select>
                  </label>
                )}

                {fields.name && (
                  <label className="pe-modal__field">
                    <span>Your Name *</span>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      required
                    />
                  </label>
                )}

                {fields.phone && (
                  <label className="pe-modal__field">
                    <span>Phone *</span>
                    <input
                      type="tel"
                      placeholder="+91 98xxx xxxxx"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      required
                    />
                  </label>
                )}

                {fields.email && (
                  <label className="pe-modal__field pe-modal__field--wide">
                    <span>Email *</span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      required
                    />
                  </label>
                )}

                {fields.message && (
                  <label className="pe-modal__field pe-modal__field--wide">
                    <span>Anything specific you'd like? (optional)</span>
                    <textarea
                      rows="2"
                      placeholder="Hotel preferences, must-see places, food preferences…"
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                    />
                  </label>
                )}
              </div>

              {error && <div className="pe-modal__error">{error}</div>}

              <div className="pe-modal__actions">
                <button type="button" className="pe-modal__btn pe-modal__btn--ghost" onClick={close}>Maybe later</button>
                <button type="submit" className="pe-modal__btn" disabled={busy}>
                  {busy ? 'Sending…' : cfg.cta}
                </button>
              </div>

              {cfg.legal && <p className="pe-modal__legal">{cfg.legal}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(8, 67, 74, ${alpha})`
  const m = hex.replace('#', '').match(/.{1,2}/g)
  if (!m || m.length < 3) return `rgba(8, 67, 74, ${alpha})`
  const [r, g, b] = m.slice(0, 3).map((h) => parseInt(h, 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
