import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchItineraryPay, initiateItineraryPay } from '../api/client'
import './pages.css'
import './payment.css'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function PayItinerary() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [choice, setChoice] = useState('advance')
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [paying, setPaying] = useState(false)
  const [formErr, setFormErr] = useState(null)

  useEffect(() => {
    fetchItineraryPay(token)
      .then((d) => {
        setData(d)
        setForm({ name: d.customer?.name || '', email: d.customer?.email || '', phone: d.customer?.phone || '' })
        setChoice(d.advanceDue > 0 ? 'advance' : 'balance')
      })
      .catch((e) => setError(e.response?.status === 404 ? 'This payment link is not valid or has expired.' : 'We could not load this page. Please try again.'))
      .finally(() => setLoading(false))
  }, [token])

  const options = useMemo(() => {
    if (!data) return []
    const out = []
    if (data.advanceDue > 0) out.push({ key: 'advance', label: `Pay advance (${data.pct}%)`, hint: 'Confirms your booking', amount: data.advanceDue })
    if (data.balanceDue > 0 && data.paid > 0) out.push({ key: 'balance', label: 'Pay remaining balance', hint: 'Settle the rest of the trip cost', amount: data.balanceDue })
    if (data.outstanding > 0 && data.paid === 0) out.push({ key: 'full', label: 'Pay in full', hint: 'Nothing more to pay later', amount: data.outstanding })
    return out
  }, [data])

  const selected = options.find((o) => o.key === choice) || options[0]

  const pay = async (e) => {
    e.preventDefault()
    setFormErr(null)
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormErr('Please enter your name, email and phone number.')
      return
    }
    setPaying(true)
    try {
      const { postUrl, encRequest, accessCode } = await initiateItineraryPay(token, { payType: selected.key, ...form })
      if (!postUrl || !encRequest || !accessCode) throw new Error('bad response')
      // Hand off to CCAvenue's hosted payment page (same flow as package bookings)
      const f = document.createElement('form')
      f.method = 'POST'
      f.action = postUrl
      const add = (name, value) => {
        const i = document.createElement('input')
        i.type = 'hidden'; i.name = name; i.value = value
        f.appendChild(i)
      }
      add('encRequest', encRequest)
      add('access_code', accessCode)
      document.body.appendChild(f)
      f.submit()
    } catch (err) {
      setFormErr(err.response?.data?.error || 'Could not start the payment. Please try again or contact us.')
      setPaying(false)
    }
  }

  if (loading) return <div className="payit"><div className="payit__card payit__state">Loading…</div></div>
  if (error) {
    return (
      <div className="payit">
        <div className="payit__card payit__state">
          <h1 className="payit__title">Link not available</h1>
          <p>{error}</p>
          <a href="tel:+919131978160" className="book-box__btn">Call us</a>
        </div>
      </div>
    )
  }

  const paidInFull = data.total > 0 && data.outstanding <= 0

  return (
    <div className="payit">
      <div className="payit__card">
        {data.coverImage && <div className="payit__cover" style={{ backgroundImage: `url(${data.coverImage})` }} />}
        <div className="payit__body">
          <span className="payit__tag">Secure payment</span>
          <h1 className="payit__title">{data.title}</h1>
          <p className="payit__sub">
            Reference <strong>{data.ref}</strong>
            {data.travelDate ? <> · {data.travelDate}</> : null}
            {data.travellers ? <> · {data.travellers}</> : null}
          </p>

          <div className="payit__amounts">
            <div><span>Trip total</span><strong>{inr(data.total)}</strong></div>
            <div><span>Paid so far</span><strong>{inr(data.paid)}</strong></div>
            <div className="is-due"><span>Balance</span><strong>{inr(data.outstanding)}</strong></div>
          </div>

          {paidInFull ? (
            <div className="payit__done">
              <strong>Paid in full — thank you!</strong>
              <p>Your booking is fully paid. Our team will share your vouchers and trip details before you travel.</p>
            </div>
          ) : !data.enabled ? (
            <div className="payit__done payit__done--warn">
              <strong>Online payment is unavailable right now</strong>
              <p>Please contact us on <a href="tel:+919131978160">+91 91319 78160</a> and we will help you pay.</p>
            </div>
          ) : !data.total ? (
            <div className="payit__done payit__done--warn">
              <strong>This itinerary has no payable amount yet</strong>
              <p>Please contact your consultant.</p>
            </div>
          ) : (
            <form onSubmit={pay} className="payit__form">
              <div className="payit__opts" role="radiogroup" aria-label="Payment option">
                {options.map((o) => (
                  <label key={o.key} className={`payit__opt ${selected?.key === o.key ? 'is-on' : ''}`}>
                    <input type="radio" name="payType" value={o.key} checked={selected?.key === o.key} onChange={() => setChoice(o.key)} />
                    <span>
                      <strong>{o.label}</strong>
                      <small>{o.hint}</small>
                    </span>
                    <em>{inr(o.amount)}</em>
                  </label>
                ))}
              </div>

              <div className="payit__fields">
                <label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required /></label>
                <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required /></label>
                <label>Phone<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" required /></label>
              </div>

              {formErr && <div className="payit__err">{formErr}</div>}

              <button type="submit" className="payit__btn" disabled={paying || !selected}>
                {paying ? 'Redirecting to secure payment…' : `Pay ${inr(selected?.amount)}`}
              </button>
              <p className="payit__fine">
                You will be redirected to CCAvenue to pay with card, UPI or net banking. We never see or store your card details.
              </p>
            </form>
          )}
          <p className="payit__fine">Need help? <a href="tel:+919131978160">Call us</a> or <Link to="/contact">write to us</Link>.</p>
        </div>
      </div>
    </div>
  )
}
