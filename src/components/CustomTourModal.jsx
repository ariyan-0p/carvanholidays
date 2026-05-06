import { useEffect, useState } from 'react'
import { submitEnquiry } from '../api/client'
import './CustomTourModal.css'

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function CustomTourModal({ open, onClose }) {
  const [form, setForm] = useState({
    destination: '', from: '', travelDate: '', travellers: '2 Adults',
    name: '', email: '', phone: '', message: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.destination.trim()) {
      setError('Please fill destination, name, email and phone.')
      return
    }
    setBusy(true)
    try {
      await submitEnquiry({
        type: 'Custom Tour',
        destination: form.destination,
        from: form.from,
        travelDate: form.travelDate || undefined,
        travellers: form.travellers,
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        source: 'custom-tour',
      })
      setSubmitted(true)
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not submit. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setSubmitted(false)
    setForm({ destination: '', from: '', travelDate: '', travellers: '2 Adults', name: '', email: '', phone: '', message: '' })
    setError(null)
    onClose()
  }

  return (
    <div className="ct-modal" role="dialog" aria-modal="true" aria-labelledby="ct-title" onClick={onClose}>
      <div className="ct-modal__panel" onClick={e => e.stopPropagation()}>
        <button className="ct-modal__close" onClick={onClose} aria-label="Close">×</button>

        {submitted ? (
          <div className="ct-modal__success">
            <div className="ct-modal__success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2>Custom request received!</h2>
            <p>
              Thanks <strong>{form.name.split(' ')[0]}</strong> — our travel designer will craft a personalised itinerary and reach out to you on <strong>{form.phone}</strong> within 4 business hours.
            </p>
            <button className="ct-modal__btn" onClick={reset}>Done</button>
          </div>
        ) : (
          <form className="ct-modal__form" onSubmit={submit}>
            <header className="ct-modal__header">
              <span className="ct-modal__tag">Custom Tour</span>
              <h2 id="ct-title">Plan your dream trip</h2>
              <p>Tell us where you'd like to go and how. Our experts will design a fully tailored itinerary just for you.</p>
            </header>

            <div className="ct-modal__grid">
              <label className="ct-modal__field ct-modal__field--wide">
                <span>Where to? *</span>
                <input
                  type="text"
                  placeholder="e.g. Switzerland, Andaman, Bali + Singapore…"
                  value={form.destination}
                  onChange={e => set('destination', e.target.value)}
                  required
                />
              </label>

              <label className="ct-modal__field">
                <span>Travelling From</span>
                <input
                  type="text"
                  placeholder="Your city"
                  value={form.from}
                  onChange={e => set('from', e.target.value)}
                />
              </label>

              <label className="ct-modal__field">
                <span>Travel Date</span>
                <input
                  type="date"
                  min={todayISO()}
                  value={form.travelDate}
                  onChange={e => set('travelDate', e.target.value)}
                />
              </label>

              <label className="ct-modal__field">
                <span>Travellers</span>
                <select value={form.travellers} onChange={e => set('travellers', e.target.value)}>
                  <option>1 Adult</option>
                  <option>2 Adults</option>
                  <option>2 Adults, 1 Child</option>
                  <option>2 Adults, 2 Children</option>
                  <option>Family (4+)</option>
                  <option>Group (5+)</option>
                </select>
              </label>

              <label className="ct-modal__field">
                <span>Your Name *</span>
                <input
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                />
              </label>

              <label className="ct-modal__field">
                <span>Email *</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </label>

              <label className="ct-modal__field">
                <span>Phone *</span>
                <input
                  type="tel"
                  placeholder="+91 98xxx xxxxx"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  required
                />
              </label>

              <label className="ct-modal__field ct-modal__field--wide">
                <span>What kind of trip do you have in mind?</span>
                <textarea
                  rows="3"
                  placeholder="Honeymoon? Adventure? Budget range, hotel preferences, must-see places, food preferences…"
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                />
              </label>
            </div>

            {error && <div className="ct-modal__error">{error}</div>}

            <div className="ct-modal__actions">
              <button type="button" className="ct-modal__btn ct-modal__btn--ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="ct-modal__btn" disabled={busy}>
                {busy ? 'Sending…' : 'Submit Request'}
              </button>
            </div>

            <p className="ct-modal__legal">
              We'll never share your details. By submitting, you consent to be contacted by Carvaan Holidays.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
