import { useEffect, useState } from 'react'
import { submitEnquiry } from '../api/client'
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

export default function PopupEnquiry() {
  const [open, setOpen] = useState(false)
  const [submittedOnce, setSubmittedOnce] = useState(false)
  const [form, setForm] = useState(INITIAL)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  // Auto-open every 45 seconds (until the user submits successfully).
  useEffect(() => {
    if (submittedOnce) return
    const id = setInterval(() => {
      setOpen((prev) => (prev ? prev : true))
    }, 45000)
    return () => clearInterval(id)
  }, [submittedOnce])

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

  if (!open) return null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const close = () => setOpen(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.destination.trim()) {
      setError('Please fill destination, name, email and phone.')
      return
    }
    setBusy(true)
    try {
      const tagged = `[From Popup Form] Trip type: ${form.tripType}. Budget: ${form.budget}.${form.message ? ' Notes: ' + form.message : ''}`
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

        {submitted ? (
          <div className="pe-modal__success">
            <div className="pe-modal__success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2>Thank you, {form.name.split(' ')[0] || 'traveller'}!</h2>
            <p>
              We've received your enquiry. A travel expert will call you on <strong>{form.phone}</strong> within 4 business hours with the best deals for <strong>{form.destination}</strong>.
            </p>
            <button className="pe-modal__btn" onClick={done}>Done</button>
          </div>
        ) : (
          <form className="pe-modal__form" onSubmit={submit}>
            <header className="pe-modal__header">
              <span className="pe-modal__tag">Limited-time offer</span>
              <h2 id="pe-title">Get up to 30% off on your next holiday</h2>
              <p>Tell us a few quick details and our travel expert will share a custom quote — free, no obligation.</p>
            </header>

            <div className="pe-modal__grid">
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

              <label className="pe-modal__field">
                <span>When are you planning?</span>
                <input
                  type="date"
                  min={todayISO()}
                  value={form.travelDate}
                  onChange={(e) => set('travelDate', e.target.value)}
                />
              </label>

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

              <label className="pe-modal__field pe-modal__field--wide">
                <span>Anything specific you'd like? (optional)</span>
                <textarea
                  rows="2"
                  placeholder="Hotel preferences, must-see places, food preferences…"
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                />
              </label>
            </div>

            {error && <div className="pe-modal__error">{error}</div>}

            <div className="pe-modal__actions">
              <button type="button" className="pe-modal__btn pe-modal__btn--ghost" onClick={close}>Maybe later</button>
              <button type="submit" className="pe-modal__btn" disabled={busy}>
                {busy ? 'Sending…' : 'Get my custom quote'}
              </button>
            </div>

            <p className="pe-modal__legal">
              By submitting, you consent to be contacted by Carvaan Holidays. We'll never share your details.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
