import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitEnquiry, fetchSearchSection } from '../api/client'
import './SearchBar.css'

const tabs = ['Holidays', 'Flights', 'Hotels', 'Visa', 'Cars']

const TAB_LABELS = {
  Holidays: { from: 'Travelling From', dest: 'Destination *', date: 'Travel Date',   count: 'Travellers' },
  Flights:  { from: 'From',            dest: 'To *',          date: 'Travel Date',   count: 'Travellers' },
  Hotels:   { from: 'Nearby City',     dest: 'City *',        date: 'Check-in Date', count: 'Guests' },
  Visa:     { from: 'From Country',    dest: 'Visa for *',    date: 'Travel Date',   count: 'Applicants' },
  Cars:     { from: 'Pickup City *',   dest: 'Drop City',     date: 'Pickup Date',   count: 'Car Type' },
}

const CAR_TYPES = ['Hatchback', 'Sedan', 'SUV', 'Premium SUV', 'Tempo Traveller (8-12)', 'Luxury / Innova Crysta']

// Default fallback content — keeps the section functional before the API responds
// (or if the backend is down). Admin overrides everything via /admin/search-section.
const FALLBACK = {
  eyebrow:        'Plan your escape',
  headline:       'Where will you go next?',
  headlineAccent: 'go next?',
  lede:           "Tell us what you're after — or pick a category and we'll take it from there.",
  showStats: true,
  stats: [
    { value: '40+',     label: 'Curated packages' },
    { value: '25',      label: 'Countries covered' },
    { value: '10,000+', label: 'Happy travellers' },
    { value: '4.9★',    label: 'Average rating' },
  ],
  categories: [
    { label: 'Group Tours',      tagline: 'Travel together, save together',   to: '/packages',    color: '#2563eb', icon: 'group',    badge: 'Popular', active: true },
    { label: 'Holiday Deals',    tagline: 'Curated escapes at special prices', to: '/packages',   color: '#f59e0b', icon: 'fire',     badge: 'Hot',     active: true },
    { label: 'Travel Styles',    tagline: 'Pick how you want to travel',      to: '/packages',    color: '#8b5cf6', icon: 'sparkles', badge: '',        active: true },
    { label: 'Upcoming Tours',   tagline: 'Fixed departures, ready to book',  to: '/packages',    color: '#10b981', icon: 'rocket',   badge: 'New',     active: true },
    { label: 'Car Rentals',      tagline: 'Self-drive or with chauffeur',     to: '/car-rentals', color: '#0ea5e9', icon: 'car',      badge: '',        active: true },
    { label: 'Weekend Getaways', tagline: 'Quick escapes close to home',      to: '/cities',      color: '#ec4899', icon: 'beach',    badge: '',        active: true },
    { label: 'Customised Trips', tagline: 'Built entirely around you',        to: '/contact',     color: '#14b8a6', icon: 'target',   badge: '',        active: true },
    { label: 'More About Us',    tagline: 'Stories, blogs & beyond',          to: '/about',       color: '#475569', icon: 'info',     badge: '',        active: true },
  ],
  popularByTab: [
    { tab: 'Holidays', items: ['Bali', 'Maldives', 'Goa', 'Thailand', 'Europe'] },
    { tab: 'Flights',  items: ['Delhi', 'Mumbai', 'Bangalore', 'Dubai', 'Singapore'] },
    { tab: 'Hotels',   items: ['Jaipur', 'Shimla', 'Goa', 'Manali', 'Udaipur'] },
    { tab: 'Visa',     items: ['Dubai', 'Schengen', 'Thailand', 'Singapore', 'UK'] },
    { tab: 'Cars',     items: ['Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Goa'] },
  ],
}

const RECENT_KEY = 'carvaan:recent-destinations'
const readRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
const pushRecent = (val) => {
  if (!val) return
  try {
    const cur = readRecent().filter(x => x.toLowerCase() !== val.toLowerCase())
    const next = [val, ...cur].slice(0, 5)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch { /* noop */ }
}

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function SearchBar({ defaultTab = 'Holidays' }) {
  const [cfg, setCfg] = useState(FALLBACK)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [trip, setTrip] = useState({
    from: '', destination: '', travelDate: '', travellers: defaultTab === 'Cars' ? 'Sedan' : '2 Adults',
  })
  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' })
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [recent, setRecent] = useState(readRecent())

  // Fetch admin-edited content; gracefully fall back to defaults
  useEffect(() => {
    let mounted = true
    fetchSearchSection()
      .then((d) => {
        if (!mounted || !d) return
        // Merge — keep fallback shapes intact if admin partially clears fields
        setCfg({
          ...FALLBACK,
          ...d,
          stats: (d.stats?.length ? d.stats : FALLBACK.stats),
          categories: (d.categories?.length ? d.categories : FALLBACK.categories),
          popularByTab: (d.popularByTab?.length ? d.popularByTab : FALLBACK.popularByTab),
        })
      })
      .catch(() => { /* keep fallback */ })
    return () => { mounted = false }
  }, [])

  const setT = (k, v) => setTrip(t => ({ ...t, [k]: v }))
  const setC = (k, v) => setContact(c => ({ ...c, [k]: v }))

  const goToContact = (e) => {
    e?.preventDefault()
    setError(null)
    if (activeTab === 'Cars') {
      if (!trip.from.trim()) { setError('Please tell us your pickup city.'); return }
    } else if (!trip.destination.trim()) {
      setError('Please tell us where you want to go.'); return
    }
    if (activeTab !== 'Cars' && trip.destination.trim()) {
      pushRecent(trip.destination.trim())
      setRecent(readRecent())
    }
    setStep(2)
  }

  const submit = async (e) => {
    e.preventDefault(); setError(null)
    if (!contact.name.trim() || !contact.email.trim() || !contact.phone.trim()) {
      setError('Name, email and phone are required.'); return
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
    } finally { setBusy(false) }
  }

  const reset = () => {
    setSubmitted(false); setStep(1)
    setTrip({ from: '', destination: '', travelDate: '', travellers: activeTab === 'Cars' ? 'Sedan' : '2 Adults' })
    setContact({ name: '', email: '', phone: '', message: '' })
    setError(null)
  }

  const switchTab = (tab) => {
    setActiveTab(tab); setError(null)
    setTrip((t) => ({ ...t, travellers: tab === 'Cars' ? 'Sedan' : '2 Adults' }))
  }

  // ---------- Sliding tab indicator ----------
  const tabsRef = useRef(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  useLayoutEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-tab="${activeTab}"]`)
    if (!el) return
    const parentRect = tabsRef.current.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setIndicator({ left: rect.left - parentRect.left, width: rect.width })
  }, [activeTab, cfg])

  const labels = TAB_LABELS[activeTab] || TAB_LABELS.Holidays
  const isCars = activeTab === 'Cars'

  const popular = useMemo(() => {
    const found = (cfg.popularByTab || []).find(x => x.tab === activeTab)
    return found?.items || []
  }, [cfg, activeTab])

  const visibleCats = useMemo(
    () => (cfg.categories || []).filter(c => c.active !== false),
    [cfg.categories]
  )

  // Render the heading with the accent slice italicised inline
  const renderHeadline = () => {
    const h = cfg.headline || ''
    const a = (cfg.headlineAccent || '').trim()
    if (!a || !h.includes(a)) return h
    const [pre, ...rest] = h.split(a)
    return <>{pre}<em>{a}</em>{rest.join(a)}</>
  }

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
            Thanks <strong>{contact.name.split(' ')[0]}</strong> — our team will reach out on <strong>{contact.phone}</strong> within 2 business hours with a tailored quote.
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
        {/* === Hero copy (lives inside the card now) === */}
        <div className="search__hero">
          {cfg.eyebrow && <span className="search__hero-eyebrow">— {cfg.eyebrow}</span>}
          <h2 className="search__hero-title">{renderHeadline()}</h2>
          {cfg.lede && <p className="search__hero-lede">{cfg.lede}</p>}

          {cfg.showStats && (cfg.stats || []).length > 0 && (
            <ul className="search__stats" aria-label="Highlights">
              {(cfg.stats || []).map((s, i) => (
                <li key={i} className="search__stat">
                  <span className="search__stat-value">{s.value}</span>
                  <span className="search__stat-label">{s.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* === Tabs with sliding indicator === */}
        <div className="search__tabs" role="tablist" ref={tabsRef}>
          <span
            className="search__tabs-indicator"
            style={{ transform: `translateX(${indicator.left}px)`, width: `${indicator.width}px` }}
            aria-hidden="true"
          />
          {tabs.map(tab => (
            <button
              type="button"
              key={tab}
              data-tab={tab}
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
                  {popular.map(d => <option key={d} value={d} />)}
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

            {/* Popular + recent quick-picks */}
            <div className="search__quickpicks">
              <div className="search__popular">
                <span className="search__popular-label">Popular:</span>
                {popular.map(item => (
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

              {!isCars && recent.length > 0 && (
                <div className="search__recent">
                  <span className="search__recent-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
                    </svg>
                    Recent:
                  </span>
                  {recent.map(item => (
                    <button
                      type="button"
                      key={item}
                      className="search__tag search__tag--recent"
                      onClick={() => setT('destination', item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="search__error">{error}</div>}

            {/* === Categories — integrated, inside the same card === */}
            {visibleCats.length > 0 && (
              <div className="search__explore">
                <div className="search__explore-head">
                  <div>
                    <span className="search__explore-eyebrow">Or jump straight to</span>
                    <h3 className="search__explore-title">Pick a way to <em>explore</em></h3>
                  </div>
                  <span className="search__explore-rule" aria-hidden="true" />
                </div>

                <div className="search__explore-grid">
                  {visibleCats.map((t, i) => (
                    <Link
                      key={t.label + i}
                      to={t.to || '/packages'}
                      className="search__explore-tile"
                      style={{ '--accent': t.color || '#14b8a6', '--i': i }}
                    >
                      <span className="search__explore-icon" aria-hidden="true">{iconFor(t.icon)}</span>
                      <span className="search__explore-text">
                        <span className="search__explore-label">
                          {t.label}
                          {t.badge && <span className="search__explore-badge">{t.badge}</span>}
                        </span>
                        <span className="search__explore-tagline">{t.tagline}</span>
                      </span>
                      <span className="search__explore-arrow" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
              <button type="button" className="search__edit-btn" onClick={() => setStep(1)} aria-label="Edit trip details">Edit</button>
            </div>

            <div className="search__fields search__fields--contact">
              <div className="search__field">
                <label className="search__field-label">Your Name *</label>
                <input className="search__input" type="text" placeholder="Full name" value={contact.name} onChange={e => setC('name', e.target.value)} required />
              </div>
              <div className="search__field">
                <label className="search__field-label">Email *</label>
                <input className="search__input" type="email" placeholder="you@example.com" value={contact.email} onChange={e => setC('email', e.target.value)} required />
              </div>
              <div className="search__field">
                <label className="search__field-label">Phone *</label>
                <input className="search__input" type="tel" placeholder="+91 98xxx xxxxx" value={contact.phone} onChange={e => setC('phone', e.target.value)} required />
              </div>
              <div className="search__field search__field--wide">
                <label className="search__field-label">Anything specific?</label>
                <input className="search__input" type="text" placeholder="Honeymoon, vegetarian meals, budget…" value={contact.message} onChange={e => setC('message', e.target.value)} />
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

/* ---------- icons ---------- */

const I = (paths) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths}
  </svg>
)

const ICON_MAP = {
  group:    I(<><circle cx="9" cy="8" r="3.2"/><path d="M2 21c.5-3 3.2-5 7-5s6.5 2 7 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M22 19c-.3-2-1.6-3.4-3.5-4"/></>),
  fire:     I(<><path d="M12 3c1.5 3 4 4.5 4 7.5a4 4 0 0 1-8 0c0-1 .4-1.8 1-2.5"/><path d="M9.5 14a3.5 3.5 0 1 0 5 0c-.7-.7-1.2-1.6-1.5-2.5-1 1-2.5 1-3.5 2.5z"/></>),
  sparkles: I(<><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/></>),
  rocket:   I(<><path d="M14 4c4 0 6 2 6 6-2 0-4 1-5 2l-7 7-3-3 7-7c1-1 2-3 2-5z"/><path d="M9 13l-2 2c-1 1-2 1-3 1l1-3c0-1 1-2 2-2l2 2z"/><circle cx="15" cy="9" r="1.4"/></>),
  car:      I(<><path d="M3 14l1.6-4.6A3 3 0 0 1 7.4 7.5h9.2a3 3 0 0 1 2.8 1.9L21 14"/><rect x="3" y="14" width="18" height="5" rx="1.4"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/></>),
  beach:    I(<><path d="M2 18h20"/><circle cx="7" cy="6" r="2"/><path d="M7 8v3"/><path d="M7 8c2.5-.5 5 0 7 2"/><path d="M7 8c-1.2 1-2 2.4-2.5 4"/><path d="M14 16c0-3 2-5 5-5"/></>),
  target:   I(<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></>),
  info:     I(<><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M11 12h1v5h1"/></>),
  globe:    I(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>),
  compass:  I(<><circle cx="12" cy="12" r="9"/><path d="M16 8l-2.5 5.5L8 16l2.5-5.5L16 8z"/></>),
  map:      I(<><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"/><path d="M9 3v15M15 6v15"/></>),
  heart:    I(<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>),
  mountain: I(<><path d="M3 20l5-8 3 4 3-6 7 10H3z"/><circle cx="16" cy="6" r="1.8"/></>),
  leaf:     I(<><path d="M4 20c0-9 5-14 16-16-1 11-7 16-16 16z"/><path d="M4 20l8-8"/></>),
}

function iconFor(key) {
  return ICON_MAP[key] || ICON_MAP.sparkles
}

function tabIcon(tab) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  switch (tab) {
    case 'Holidays':
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
      return (
        <svg {...props}>
          <path d="M2 16l20-7-7 12-2.5-5.5L2 16z" />
          <path d="M12.5 15.5L15 22" />
        </svg>
      )
    case 'Hotels':
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
      return (
        <svg {...props}>
          <rect x="4.5" y="2.5" width="15" height="19" rx="2.5" />
          <circle cx="12" cy="9" r="3" />
          <path d="M9.5 14h5" />
          <path d="M8.5 17h7" />
        </svg>
      )
    case 'Cars':
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
        </svg>
      )
  }
}
