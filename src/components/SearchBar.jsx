import { useState } from 'react'
import { submitEnquiry } from '../api/client'
import './SearchBar.css'

const tabs = ['Holidays', 'Flights', 'Hotels', 'Visa', 'Cars']

const TAB_LABELS = {
  Holidays: { from: 'Travelling From', dest: 'Destination *', date: 'Travel Date', count: 'Travellers' },
  Flights:  { from: 'From',            dest: 'To *',          date: 'Travel Date', count: 'Travellers' },
  Hotels:   { from: 'Nearby City',     dest: 'City *',        date: 'Check-in Date', count: 'Guests' },
  Visa:     { from: 'From Country',    dest: 'Visa for *',    date: 'Travel Date', count: 'Applicants' },
  Cars:     { from: 'Pickup City *',   dest: 'Drop City',     date: 'Pickup Date', count: 'Car Type' },
}

const CAR_TYPES = ['Hatchback', 'Sedan', 'SUV', 'Premium SUV', 'Tempo Traveller (8-12)', 'Luxury / Innova Crysta']

const holidayDestinations = [
  'Bali', 'Maldives', 'Thailand', 'Dubai', 'Europe',
  'Goa', 'Kerala', 'Rajasthan', 'Ladakh', 'Andaman',
]

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function SearchBar({ defaultTab = 'Holidays' }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [trip, setTrip] = useState({
    from: '', destination: '', travelDate: '', travellers: defaultTab === 'Cars' ? 'Sedan' : '2 Adults',
  })
  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' })
  const [step, setStep] = useState(1)        // 1 = trip, 2 = contact
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const setT = (k, v) => setTrip(t => ({ ...t, [k]: v }))
  const setC = (k, v) => setContact(c => ({ ...c, [k]: v }))

  const goToContact = (e) => {
    e?.preventDefault()
    setError(null)
    if (activeTab === 'Cars') {
      if (!trip.from.trim()) {
        setError('Please tell us your pickup city.')
        return
      }
    } else if (!trip.destination.trim()) {
      setError('Please tell us where you want to go.')
      return
    }
    setStep(2)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!contact.name.trim() || !contact.email.trim() || !contact.phone.trim()) {
      setError('Name, email and phone are required.')
      return
    }
    setBusy(true)
    try {
      await submitEnquiry({
        type: activeTab,
        from: trip.from,
        destination: trip.destination,
        travelDate: trip.travelDate || undefined,
        travellers: trip.travellers,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        source: 'homepage-search',
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
    setStep(1)
    setTrip({ from: '', destination: '', travelDate: '', travellers: activeTab === 'Cars' ? 'Sedan' : '2 Adults' })
    setContact({ name: '', email: '', phone: '', message: '' })
    setError(null)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setError(null)
    // sensible default for the count field per tab
    setTrip((t) => ({ ...t, travellers: tab === 'Cars' ? 'Sedan' : '2 Adults' }))
  }

  const labels = TAB_LABELS[activeTab] || TAB_LABELS.Holidays
  const isCars = activeTab === 'Cars'

  if (submitted) {
    return (
      <section className="search" id="book">
        <div className="search__card search__success">
          <div className="search__success-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3>Enquiry received!</h3>
          <p>
            Thanks <strong>{contact.name.split(' ')[0]}</strong> — our team will reach out to you on <strong>{contact.phone}</strong> within 2 business hours with a tailored quote.
          </p>
          <button className="search__btn search__btn--ghost" onClick={reset}>
            Send another enquiry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="search" id="book">
      <form className="search__card" onSubmit={step === 1 ? goToContact : submit}>
        {/* Tabs */}
        <div className="search__tabs" role="tablist">
          {tabs.map(tab => (
            <button
              type="button"
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`search__tab ${activeTab === tab ? 'search__tab--active' : ''}`}
              onClick={() => switchTab(tab)}
            >
              <span className="search__tab-icon">{tabIcon(tab)}</span>
              {tab}
            </button>
          ))}
        </div>

        {/* Step indicator */}
        <div className="search__steps" aria-hidden="true">
          <div className={`search__step ${step >= 1 ? 'is-active' : ''}`}>
            <span>1</span> Trip details
          </div>
          <div className="search__step-bar" />
          <div className={`search__step ${step >= 2 ? 'is-active' : ''}`}>
            <span>2</span> Your contact
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="search__fields">
              <div className="search__field">
                <label className="search__field-label">{labels.from}</label>
                <input
                  className="search__input"
                  type="text"
                  placeholder={isCars ? 'e.g. Delhi, Mumbai…' : 'Your city'}
                  value={trip.from}
                  onChange={e => setT('from', e.target.value)}
                  required={isCars}
                />
              </div>

              <div className="search__divider" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="search__field">
                <label className="search__field-label">{labels.dest}</label>
                <input
                  className="search__input"
                  type="text"
                  placeholder={isCars ? 'Same as pickup if round trip' : 'Where do you want to go?'}
                  list="destinations"
                  value={trip.destination}
                  onChange={e => setT('destination', e.target.value)}
                  required={!isCars}
                />
                <datalist id="destinations">
                  {holidayDestinations.map(d => <option key={d} value={d} />)}
                </datalist>
              </div>

              <div className="search__field">
                <label className="search__field-label">{labels.date}</label>
                <input
                  className="search__input"
                  type="date"
                  min={todayISO()}
                  value={trip.travelDate}
                  onChange={e => setT('travelDate', e.target.value)}
                />
              </div>

              <div className="search__field">
                <label className="search__field-label">{labels.count}</label>
                <select
                  className="search__input search__select"
                  value={trip.travellers}
                  onChange={e => setT('travellers', e.target.value)}
                >
                  {isCars
                    ? CAR_TYPES.map(c => <option key={c}>{c}</option>)
                    : <>
                        <option>1 Adult</option>
                        <option>2 Adults</option>
                        <option>2 Adults, 1 Child</option>
                        <option>2 Adults, 2 Children</option>
                        <option>Family (4+)</option>
                        <option>Group (5+)</option>
                      </>}
                </select>
              </div>

              <button type="submit" className="search__btn">
                Continue
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </button>
            </div>

            {/* Popular searches */}
            <div className="search__popular">
              <span className="search__popular-label">Popular:</span>
              {(isCars
                ? ['Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Goa']
                : ['Bali', 'Maldives', 'Goa', 'Thailand', 'Europe']
              ).map(item => (
                <button
                  type="button"
                  key={item}
                  className="search__tag"
                  onClick={() => setT(isCars ? 'from' : 'destination', item)}
                >
                  {item}
                </button>
              ))}
            </div>

            {error && <div className="search__error">{error}</div>}
          </>
        )}

        {step === 2 && (
          <>
            <div className="search__summary">
              <span className="search__summary-pill">{activeTab}</span>
              {isCars ? (
                <>
                  <strong>{trip.from}</strong>
                  {trip.destination && <> → <span>{trip.destination}</span></>}
                </>
              ) : (
                <>
                  <strong>{trip.destination}</strong>
                  {trip.from && <> · from <span>{trip.from}</span></>}
                </>
              )}
              {trip.travelDate && <> · <span>{new Date(trip.travelDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></>}
              <> · <span>{trip.travellers}</span></>
              <button
                type="button"
                className="search__edit-btn"
                onClick={() => setStep(1)}
                aria-label="Edit trip details"
              >
                Edit
              </button>
            </div>

            <div className="search__fields search__fields--contact">
              <div className="search__field">
                <label className="search__field-label">Your Name *</label>
                <input
                  className="search__input"
                  type="text"
                  placeholder="Full name"
                  value={contact.name}
                  onChange={e => setC('name', e.target.value)}
                  required
                />
              </div>

              <div className="search__field">
                <label className="search__field-label">Email *</label>
                <input
                  className="search__input"
                  type="email"
                  placeholder="you@example.com"
                  value={contact.email}
                  onChange={e => setC('email', e.target.value)}
                  required
                />
              </div>

              <div className="search__field">
                <label className="search__field-label">Phone *</label>
                <input
                  className="search__input"
                  type="tel"
                  placeholder="+91 98xxx xxxxx"
                  value={contact.phone}
                  onChange={e => setC('phone', e.target.value)}
                  required
                />
              </div>

              <div className="search__field search__field--wide">
                <label className="search__field-label">Anything specific?</label>
                <input
                  className="search__input"
                  type="text"
                  placeholder="Honeymoon, vegetarian meals, budget…"
                  value={contact.message}
                  onChange={e => setC('message', e.target.value)}
                />
              </div>

              <button type="submit" className="search__btn" disabled={busy}>
                {busy ? 'Sending…' : 'Submit Enquiry'}
                {!busy && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                )}
              </button>
            </div>

            <p className="search__legal">
              By submitting, you agree to be contacted by Carvaan Holidays regarding your enquiry. We'll never spam.
            </p>

            {error && <div className="search__error">{error}</div>}
          </>
        )}
      </form>
    </section>
  )
}

function tabIcon(tab) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  switch (tab) {
    case 'Holidays':
      // palm + sun
      return (
        <svg {...props}>
          <circle cx="6" cy="6" r="2.2" />
          <path d="M6 8.2v13.3" />
          <path d="M6 8.2c2 0 5 1.2 7.5 4.2" />
          <path d="M6 8.2c-1.6 1.4-2.5 3.5-3 6" />
          <path d="M6 8.2c2.2-1 5-.8 7.6.8" />
          <path d="M21 21.5c-.5-3.4-2.6-6-5.4-6.8" />
        </svg>
      )
    case 'Flights':
      // paper-plane / takeoff
      return (
        <svg {...props}>
          <path d="M2 16l20-7-7 12-2.5-5.5L2 16z" />
          <path d="M12.5 15.5L15 22" />
        </svg>
      )
    case 'Hotels':
      // bed
      return (
        <svg {...props}>
          <path d="M3 18V6" />
          <path d="M21 18v-6a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v6" />
          <path d="M3 14h18" />
          <path d="M3 18h18" />
          <circle cx="9" cy="11" r="1.6" />
        </svg>
      )
    case 'Visa':
      // passport book
      return (
        <svg {...props}>
          <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" />
          <circle cx="12" cy="9" r="3" />
          <path d="M9.5 14h5" />
          <path d="M8.5 17h7" />
        </svg>
      )
    case 'Cars':
      // car silhouette
      return (
        <svg {...props}>
          <path d="M3 14l1.6-4.6A3 3 0 0 1 7.4 7.5h9.2a3 3 0 0 1 2.8 1.9L21 14" />
          <rect x="3" y="14" width="18" height="5" rx="1.4" />
          <circle cx="7.5" cy="19" r="1.5" />
          <circle cx="16.5" cy="19" r="1.5" />
          <path d="M7 14h10" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      )
  }
}
