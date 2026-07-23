import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchPackage, submitEnquiry, fetchPaymentConfig, initiatePayment } from '../api/client'
import './pages.css'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function Booking() {
  const { slug } = useParams()
  const [pkg, setPkg] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', travelDate: '', travellers: '2 Adults', message: '' })
  const [submitting, setSubmitting] = useState(false)   // enquiry submit
  const [paying, setPaying] = useState(false)           // payment submit
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const [payCfg, setPayCfg] = useState(null)            // { enabled, advancePercent, env }

  useEffect(() => {
    fetchPackage(slug).then(setPkg).catch(() => {})
    fetchPaymentConfig().then(setPayCfg).catch(() => setPayCfg({ enabled: false }))
  }, [slug])

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const price = Number(pkg?.price || 0)
  const advPct = payCfg?.advancePercent ?? 25
  const advanceAmount = advPct > 0 && advPct < 100 ? Math.round((price * advPct) / 100) : price
  const canPay = payCfg?.enabled && price > 0

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Please fill your name, email and phone.')
      return false
    }
    return true
  }

  // Enquiry-only (no payment) fallback
  const submitEnquiryOnly = async (e) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitEnquiry({
        type: 'Booking',
        packageSlug: slug,
        packageTitle: pkg?.title,
        destination: pkg?.destination || pkg?.city,
        travelDate: form.travelDate || undefined,
        travellers: form.travellers,
        name: form.name, email: form.email, phone: form.phone,
        message: form.message,
        source: 'package-booking',
      })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Pay advance online → redirect to CCAvenue hosted page
  const payNow = async () => {
    setError(null)
    if (!validate()) return
    setPaying(true)
    try {
      const { postUrl, encRequest, accessCode } = await initiatePayment({
        slug,
        name: form.name, email: form.email, phone: form.phone,
        travellers: form.travellers, travelDate: form.travelDate,
        message: form.message,
      })
      if (postUrl && encRequest && accessCode) {
        // Hand off to CCAvenue via a browser form POST (non-seamless redirect)
        const f = document.createElement('form')
        f.method = 'POST'
        f.action = postUrl
        const add = (n, v) => {
          const i = document.createElement('input')
          i.type = 'hidden'; i.name = n; i.value = v
          f.appendChild(i)
        }
        add('encRequest', encRequest)
        add('access_code', accessCode)
        document.body.appendChild(f)
        f.submit()
      } else {
        setError('Could not start payment. Please try again or use "Request a callback".')
        setPaying(false)
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start payment. Please try again.')
      setPaying(false)
    }
  }

  if (done) {
    return (
      <div className="page">
        <div className="page__body">
          <div className="success-card">
            <h2>Thank you, {form.name}! 🎉</h2>
            <p>Your booking request for <strong>{pkg?.title || slug}</strong> has been received. Our team will reach out within 24 hours on {form.phone}.</p>
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
          <p className="page__subtitle">Secure your slot by paying an advance — our team confirms your full itinerary within 24 hours.</p>
        </div>
      </div>

      <div className="page__body">
        <form className="booking-form" onSubmit={submitEnquiryOnly}>
          {pkg && (
            <div className="booking-form__pkg">
              <img src={pkg.image} alt={pkg.title} />
              <div>
                <h3>{pkg.title}</h3>
                <p>{pkg.duration} · {inr(price)} per person</p>
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
            <label>Travellers
              <select name="travellers" value={form.travellers} onChange={handle}>
                <option>1 Adult</option>
                <option>2 Adults</option>
                <option>2 Adults, 1 Child</option>
                <option>2 Adults, 2 Children</option>
                <option>Family (4+)</option>
                <option>Group (5+)</option>
              </select>
            </label>
          </div>
          <label>Special Requests<textarea name="message" rows="4" value={form.message} onChange={handle} /></label>

          {/* Advance payment summary */}
          {canPay && (
            <div className="pay-summary">
              <div className="pay-summary__row">
                <span>Package price (per person)</span>
                <span>{inr(price)}</span>
              </div>
              <div className="pay-summary__row pay-summary__row--accent">
                <span>Advance to pay now ({advPct}%)</span>
                <strong>{inr(advanceAmount)}</strong>
              </div>
              <p className="pay-summary__note">
                Balance is payable before departure. Advance is adjusted against your final invoice and is
                subject to our <Link to="/refund-cancellation">Refund &amp; Cancellation Policy</Link>.
              </p>
            </div>
          )}

          {error && <div className="page__state page__state--error">{error}</div>}

          <div className="booking-form__actions">
            {canPay && (
              <button type="button" className="book-box__btn book-box__btn--pay" onClick={payNow} disabled={paying || submitting}>
                {paying ? 'Redirecting to secure payment…' : `Pay ${inr(advanceAmount)} advance & confirm`}
              </button>
            )}
            <button type="submit" className={`book-box__btn ${canPay ? 'book-box__btn--ghost' : ''}`} disabled={submitting || paying}>
              {submitting ? 'Submitting…' : (canPay ? 'Or request a callback instead' : 'Request Booking')}
            </button>
          </div>

          {canPay && (
            <p className="booking-form__secure">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Payments are processed securely by CCAvenue. We never see or store your card / UPI details.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
