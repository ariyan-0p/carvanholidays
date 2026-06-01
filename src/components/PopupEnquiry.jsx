import { useEffect, useState } from 'react'
import { submitEnquiry, fetchPopupConfig } from '../api/client'
import brandMark from '../assets/brand-mark-inverted.png'
import './PopupEnquiry.css'

const todayISO = () => new Date().toISOString().slice(0, 10)

const INITIAL = {
  firstName: '',
  lastName: '',
  name: '',           // legacy
  email: '',
  phone: '',
  tripPreference: '',
  destination: '',
  travelDate: '',
  travellers: '2 Adults',
  tripType: 'Family Holiday',
  budget: '₹50k – ₹1L per person',
  message: '',
  marketingConsent: true,
}

const FALLBACK_CFG = {
  bannerUrl: '',
  bannerHeading: 'Up to 30% off',
  bannerSubheading: 'On hand-picked holiday packages this season',
  bannerOverlayColor: '#08434A',
  tag: 'Limited-time offer',
  title: 'Plan Your Next Trip',
  subtitle: "Tell us a few quick details and our travel expert will share a custom quote — free, no obligation.",
  successTitle: 'Thanks for your enquiry!',
  successMessage: "We'll call you within 4 business hours with the best deals.",
  cta: "Let's Go",
  legal: "By submitting, you consent to be contacted by Carvaan Holidays. We'll never share your details.",
  countryCode: '+91',
  tripPreferenceOptions: [
    'Family Holiday', 'Honeymoon', 'Couple Getaway', 'Adventure',
    'Beach & Leisure', 'Pilgrimage', 'Group / Friends',
  ],
  destinationOptions: [
    'Bali', 'Maldives', 'Thailand', 'Dubai', 'Europe',
    'Goa', 'Kerala', 'Rajasthan', 'Ladakh', 'Andaman', 'Kashmir',
  ],
  marketingConsentLabel: 'Keep me updated with offers, trips, and travel inspiration via email, SMS, and WhatsApp',
  marketingConsentDefault: true,
  intervalSeconds: 45,
  active: true,
  showAfterSubmit: false,
  fields: {
    firstName: true, lastName: true, name: false,
    email: true, phone: true,
    tripPreference: true, destination: true, marketingConsent: true,
    travelDate: false, travellers: false, tripType: false, budget: false, message: false,
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

  useEffect(() => {
    fetchPopupConfig()
      .then((c) => {
        const merged = {
          ...FALLBACK_CFG,
          ...(c || {}),
          fields: { ...FALLBACK_CFG.fields, ...(c?.fields || {}) },
          tripPreferenceOptions: (c?.tripPreferenceOptions?.length ? c.tripPreferenceOptions : FALLBACK_CFG.tripPreferenceOptions),
          destinationOptions:    (c?.destinationOptions?.length ? c.destinationOptions : FALLBACK_CFG.destinationOptions),
        }
        setCfg(merged)
        setForm((f) => ({ ...f, marketingConsent: merged.marketingConsentDefault !== false }))
      })
      .catch(() => setCfg(FALLBACK_CFG))
  }, [])

  useEffect(() => {
    if (!cfg) return
    if (cfg.active === false) return
    if (submittedOnce && !cfg.showAfterSubmit) return
    const ms = Math.max(15, Number(cfg.intervalSeconds) || 45) * 1000
    const id = setInterval(() => setOpen((prev) => prev || true), ms)
    return () => clearInterval(id)
  }, [cfg, submittedOnce])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !cfg) return null

  const fields = cfg.fields || FALLBACK_CFG.fields
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const close = () => setOpen(false)

  const fullName = () => {
    if (fields.firstName || fields.lastName) {
      return [form.firstName, form.lastName].filter(Boolean).join(' ').trim()
    }
    return form.name.trim()
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)

    const name = fullName()
    if (!name) { setError('Please tell us your name.'); return }
    if (fields.phone && !form.phone.trim()) { setError('Please share your phone number.'); return }
    if (fields.email && !form.email.trim()) { setError('Please share your email.'); return }

    setBusy(true)
    try {
      const extras = []
      if (fields.tripPreference && form.tripPreference) extras.push(`Trip preference: ${form.tripPreference}`)
      if (fields.tripType && form.tripType) extras.push(`Trip type: ${form.tripType}`)
      if (fields.budget && form.budget) extras.push(`Budget: ${form.budget}`)
      if (fields.marketingConsent) extras.push(`Marketing consent: ${form.marketingConsent ? 'Yes' : 'No'}`)
      const tagged = `[From Popup Form]${extras.length ? ' ' + extras.join('. ') + '.' : ''}${form.message ? ' Notes: ' + form.message : ''}`

      const phone = form.phone.trim()
        ? (form.phone.trim().startsWith('+') ? form.phone.trim() : `${cfg.countryCode || '+91'} ${form.phone.trim()}`)
        : ''

      await submitEnquiry({
        type: 'Holidays',
        destination: form.destination || form.tripPreference || '—',
        travelDate: form.travelDate || undefined,
        travellers: form.travellers,
        name,
        email: form.email,
        phone,
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
    setForm({ ...INITIAL, marketingConsent: cfg.marketingConsentDefault !== false })
    setOpen(false)
  }

  return (
    <div className="pe-modal" role="dialog" aria-modal="true" aria-labelledby="pe-title" onClick={close}>
      <div className="pe-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="pe-modal__close" onClick={close} aria-label="Close">×</button>

        {/* Left banner — outer column stretches to form height. When an image
            is uploaded it sits as a 1:1 square at the top; below the square the
            same overlay colour continues so there's no visible seam. With no
            image, the full column shows a single seamless gradient. */}
        <aside
          className={`pe-modal__banner ${cfg.bannerUrl ? 'has-image' : ''}`}
          style={{
            background: cfg.bannerUrl
              ? (cfg.bannerOverlayColor || '#08434A')
              : undefined, // gradient handled in CSS
          }}
        >
          {/* Decorative layers shown only when there's no admin-supplied image */}
          {!cfg.bannerUrl && (
            <>
              <span className="pe-modal__banner-orb pe-modal__banner-orb--a" aria-hidden="true" />
              <span className="pe-modal__banner-orb pe-modal__banner-orb--b" aria-hidden="true" />
              <span className="pe-modal__banner-orb pe-modal__banner-orb--c" aria-hidden="true" />
              <img
                src={brandMark}
                alt=""
                aria-hidden="true"
                className="pe-modal__banner-watermark"
              />
            </>
          )}

          <div
            className="pe-modal__banner-square"
            style={cfg.bannerUrl ? { backgroundImage: `url(${cfg.bannerUrl})` } : undefined}
          >
            {cfg.bannerUrl && (
              <div
                className="pe-modal__banner-overlay"
                style={{ background: `linear-gradient(180deg, rgba(0,0,0,0.10) 0%, ${hexToRgba(cfg.bannerOverlayColor || '#08434A', 0.55)} 100%)` }}
              />
            )}
            <div className="pe-modal__banner-content">
              <span className="pe-modal__banner-tag">{cfg.tag}</span>
              <h2 className="pe-modal__banner-heading">{cfg.bannerHeading}</h2>
              <p className="pe-modal__banner-sub">{cfg.bannerSubheading}</p>
            </div>
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
              <h2>{cfg.successTitle.replace('{name}', (form.firstName || form.name).split(' ')[0] || 'traveller')}</h2>
              <p>
                {cfg.successMessage}
                {form.phone && <> <br /><strong>{cfg.countryCode || '+91'} {form.phone}</strong></>}
              </p>
              <button className="pe-modal__btn" onClick={done}>Done</button>
            </div>
          ) : (
            <form className="pe-modal__form" onSubmit={submit}>
              <header className="pe-modal__header">
                <h2 id="pe-title" className="pe-modal__title">{cfg.title}</h2>
                {cfg.subtitle && <p className="pe-modal__subtitle">{cfg.subtitle}</p>}
              </header>

              <div className="pe-modal__grid">
                {/* Name row */}
                {fields.firstName && (
                  <label className="pe-modal__field">
                    <input
                      type="text"
                      placeholder="First Name *"
                      value={form.firstName}
                      onChange={(e) => set('firstName', e.target.value)}
                      required
                    />
                  </label>
                )}
                {fields.lastName && (
                  <label className="pe-modal__field">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={form.lastName}
                      onChange={(e) => set('lastName', e.target.value)}
                    />
                  </label>
                )}
                {fields.name && !fields.firstName && !fields.lastName && (
                  <label className="pe-modal__field pe-modal__field--wide">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      required
                    />
                  </label>
                )}

                {/* Email + Phone row */}
                {fields.email && (
                  <label className="pe-modal__field">
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      required
                    />
                  </label>
                )}
                {fields.phone && (
                  <label className="pe-modal__field pe-modal__field--phone">
                    <span className="pe-modal__cc">{cfg.countryCode || '+91'}</span>
                    <input
                      type="tel"
                      placeholder="98xxx xxxxx"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      required
                    />
                  </label>
                )}

                {/* Trip preference */}
                {fields.tripPreference && (
                  <label className="pe-modal__field pe-modal__field--wide">
                    <span className="pe-modal__label">What kind of trip do you prefer? *</span>
                    <select
                      value={form.tripPreference}
                      onChange={(e) => set('tripPreference', e.target.value)}
                      required
                    >
                      <option value="">Select a category</option>
                      {(cfg.tripPreferenceOptions || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Destination */}
                {fields.destination && (
                  <label className="pe-modal__field pe-modal__field--wide">
                    <span className="pe-modal__label">Where do you want to go?</span>
                    <select
                      value={form.destination}
                      onChange={(e) => set('destination', e.target.value)}
                    >
                      <option value="">Select a location</option>
                      {(cfg.destinationOptions || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </label>
                )}

                {/* Optional extras */}
                {fields.travelDate && (
                  <label className="pe-modal__field">
                    <span className="pe-modal__label">When are you planning?</span>
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
                    <span className="pe-modal__label">How many travellers?</span>
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
                {fields.budget && (
                  <label className="pe-modal__field">
                    <span className="pe-modal__label">Budget per person</span>
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
                {fields.message && (
                  <label className="pe-modal__field pe-modal__field--wide">
                    <span className="pe-modal__label">Anything specific? (optional)</span>
                    <textarea
                      rows="2"
                      placeholder="Hotel preferences, must-see places…"
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                    />
                  </label>
                )}

                {/* Marketing consent */}
                {fields.marketingConsent && (
                  <label className="pe-modal__consent pe-modal__field--wide">
                    <input
                      type="checkbox"
                      checked={!!form.marketingConsent}
                      onChange={(e) => set('marketingConsent', e.target.checked)}
                    />
                    <span>{cfg.marketingConsentLabel}</span>
                  </label>
                )}
              </div>

              {error && <div className="pe-modal__error">{error}</div>}

              <div className="pe-modal__actions">
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
