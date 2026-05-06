import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCities } from '../api/client'
import CustomTourModal from '../components/CustomTourModal'
import './CitiesPage.css'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'

export default function CitiesPage() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [country, setCountry] = useState('all')
  const [customOpen, setCustomOpen] = useState(false)

  useEffect(() => {
    fetchCities()
      .then(setCities)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const countries = useMemo(
    () => ['all', ...Array.from(new Set(cities.map(c => c.country).filter(Boolean))).sort()],
    [cities]
  )

  const filtered = useMemo(() => {
    return cities.filter(c => {
      if (country !== 'all' && c.country !== country) return false
      if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !(c.country || '').toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [cities, q, country])

  return (
    <div className="cities-page">
      {/* Hero */}
      <header className="cities-hero">
        <div className="cities-hero__inner">
          <span className="cities-hero__tag">Browse by destination</span>
          <h1 className="cities-hero__title">Where will you go next?</h1>
          <p className="cities-hero__subtitle">
            From hill stations to island getaways — explore our curated packages by city.
          </p>
          <div className="cities-hero__cta">
            <button
              type="button"
              className="cities-hero__custom-btn"
              onClick={() => setCustomOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Plan a Custom Tour
            </button>
            <span className="cities-hero__cta-note">Don't see your dream destination? We'll build it for you.</span>
          </div>
          <div className="cities-hero__stats">
            <div><strong>{cities.length}</strong><span>Cities</span></div>
            <div><strong>{cities.reduce((s, c) => s + (c.count || 0), 0)}</strong><span>Packages</span></div>
            <div><strong>{Array.from(new Set(cities.map(c => c.country).filter(Boolean))).length}</strong><span>Countries</span></div>
          </div>
        </div>
      </header>

      <div className="cities-page__body">
        {/* Filters */}
        <div className="cities-filters">
          <div className="cities-filters__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search by city or country…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            {q && <button onClick={() => setQ('')} aria-label="Clear search">×</button>}
          </div>
          <div className="cities-filters__chips">
            {countries.map(c => (
              <button
                key={c}
                className={`cities-chip ${country === c ? 'is-active' : ''}`}
                onClick={() => setCountry(c)}
              >
                {c === 'all' ? 'All countries' : c}
              </button>
            ))}
          </div>
        </div>

        {/* States */}
        {loading && (
          <div className="cities-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="city-skeleton">
                <div className="city-skeleton__img" />
                <div className="city-skeleton__line" />
              </div>
            ))}
          </div>
        )}
        {error && <div className="cities-page__state cities-page__state--error">Couldn't load cities.</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="cities-page__empty">
            <h3>No matching cities</h3>
            <p>Try clearing your filters or search for something else.</p>
            <button onClick={() => { setQ(''); setCountry('all') }} className="cities-page__reset">Clear filters</button>
          </div>
        )}

        {/* Custom tour banner */}
        {!loading && (
          <div className="cities-cta">
            <div className="cities-cta__content">
              <h3>Looking for something different?</h3>
              <p>Our travel designers craft custom itineraries for any destination, budget, and group size.</p>
            </div>
            <button type="button" className="cities-cta__btn" onClick={() => setCustomOpen(true)}>
              Plan Custom Tour
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6"/>
              </svg>
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="cities-grid">
            {filtered.map(c => (
              <Link key={c.city} to={`/cities/${c.city}`} className="city-tile" aria-label={`Explore ${c.name}`}>
                <div className="city-tile__media">
                  <img
                    src={c.image || FALLBACK_IMG}
                    alt={c.name}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = FALLBACK_IMG }}
                  />
                  <div className="city-tile__shade" />
                  <div className="city-tile__pkgs">
                    {c.count} {c.count === 1 ? 'package' : 'packages'}
                  </div>
                  <div className="city-tile__overlay">
                    {c.country && <span className="city-tile__country">{c.country}</span>}
                    <h3 className="city-tile__name">{c.name}</h3>
                    {c.minPrice != null && (
                      <span className="city-tile__price">
                        From <strong>₹{Number(c.minPrice).toLocaleString('en-IN')}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CustomTourModal open={customOpen} onClose={() => setCustomOpen(false)} />
    </div>
  )
}
