import { useState } from 'react'
import { sendContact } from '../api/client'
import { COMPANY } from '../config/legal'
import './pages.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await sendContact(form)
      setDone(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Could not send. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="page__hero">
        <div className="page__hero-inner">
          <span className="section-tag">Say hello</span>
          <h1 className="page__title">Contact Us</h1>
          <p className="page__subtitle">Questions, custom trips, group bookings — we're listening.</p>
        </div>
      </div>

      <div className="page__body contact">
        <div className="contact__grid">
          <div className="contact__info">
            <div>
              <h3>Registered office</h3>
              <p>
                <strong>{COMPANY.legalName}</strong><br />
                {COMPANY.address}
              </p>
            </div>
            <div>
              <h3>Phone</h3>
              <p>
                <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a><br />
                Mon – Sat, 10 AM – 7 PM
              </p>
            </div>
            <div>
              <h3>Email</h3>
              <p><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
            </div>
          </div>

          <form className="booking-form" onSubmit={submit}>
            {done && <div className="success-card">Thanks! We'll get back to you within 24 hours.</div>}
            <div className="booking-form__row">
              <label>Name<input name="name" required value={form.name} onChange={handle} /></label>
              <label>Email<input name="email" type="email" required value={form.email} onChange={handle} /></label>
            </div>
            <div className="booking-form__row">
              <label>Phone<input name="phone" value={form.phone} onChange={handle} /></label>
              <label>Subject<input name="subject" value={form.subject} onChange={handle} /></label>
            </div>
            <label>Message<textarea name="message" rows="5" required value={form.message} onChange={handle} /></label>
            {error && <div className="page__state page__state--error">{error}</div>}
            <button className="book-box__btn" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
