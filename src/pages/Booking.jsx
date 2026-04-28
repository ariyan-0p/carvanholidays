import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPackage, createBooking } from '../api/client'
import './pages.css'

export default function Booking() {
  const { slug } = useParams()
  const [pkg, setPkg] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', travelDate: '', travellers: 2, message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPackage(slug).then(setPkg).catch(() => {})
  }, [slug])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await createBooking({ packageSlug: slug, ...form })
      setDone(res)
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="page">
        <div className="page__body">
          <div className="success-card">
            <h2>Thank you, {done.name}! 🎉</h2>
            <p>Your booking request for <strong>{done.packageTitle || slug}</strong> has been received. Our team will reach out within 24 hours on {done.phone}.</p>
            <Link to="/packages" className="book-box__btn" style={{ marginTop: 16 }}>Browse more packages</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page__hero">
        <div className="page__hero-inner">
          <span className="section-tag">Almost there</span>
          <h1 className="page__title">Book {pkg?.title || 'your trip'}</h1>
          <p className="page__subtitle">Fill the form — we'll confirm your itinerary in 24 hours.</p>
        </div>
      </div>

      <div className="page__body">
        <form className="booking-form" onSubmit={submit}>
          {pkg && (
            <div className="booking-form__pkg">
              <img src={pkg.image} alt={pkg.title} />
              <div>
                <h3>{pkg.title}</h3>
                <p>{pkg.duration} · ₹{Number(pkg.price).toLocaleString('en-IN')} per person</p>
              </div>
            </div>
          )}

          <div className="booking-form__row">
            <label>Full Name<input name="name" required value={form.name} onChange={handle} /></label>
            <label>Email<input name="email" type="email" required value={form.email} onChange={handle} /></label>
          </div>
          <div className="booking-form__row">
            <label>Phone<input name="phone" required value={form.phone} onChange={handle} /></label>
            <label>Travel Date<input name="travelDate" type="date" value={form.travelDate} onChange={handle} /></label>
          </div>
          <div className="booking-form__row">
            <label>Travellers<input name="travellers" type="number" min="1" value={form.travellers} onChange={handle} /></label>
          </div>
          <label>Special Requests<textarea name="message" rows="4" value={form.message} onChange={handle} /></label>

          {error && <div className="page__state page__state--error">{error}</div>}

          <button className="book-box__btn" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Request Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}
