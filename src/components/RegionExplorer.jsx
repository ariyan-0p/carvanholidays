import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCities, fetchPackages } from '../api/client'
import './RegionExplorer.css'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'

const isIndia = (country) => String(country || '').trim().toLowerCase() === 'india'

export default function RegionExplorer() {
  const [region, setRegion] = useState('india') // 'india' | 'international'
  const [cities, setCities] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let m = true
    setLoading(true)
    Promise.all([fetchCities(), fetchPackages({ limit: 100 })])
      .then(([c, p]) => {
        if (!m) return
        setCities(c)
        setPackages(p)
      })
      .catch(() => m && (setCities([]), setPackages([])))
      .finally(() => m && setLoading(false))
    return () => { m = false }
  }, [])

  const filteredCities = useMemo(() => {
    const inRegion = cities.filter(c =>
      region === 'india' ? isIndia(c.country) : !isIndia(c.country)
    )
    return inRegion.slice(0, 6)
  }, [cities, region])

  const filteredPackages = useMemo(() => {
    const inRegion = packages.filter(p =>
      region === 'india' ? isIndia(p.country) : !isIndia(p.country)
    )
    // Prefer featured first, then cheapest
    return [...inRegion]
      .sort((a, b) => Number(b.featured || 0) - Number(a.featured || 0) || (a.price || 0) - (b.price || 0))
      .slice(0, 4)
  }, [packages, region])

  const counts = useMemo(() => ({
    india: cities.filter(c => isIndia(c.country)).reduce((s, c) => s + (c.count || 0), 0),
    international: cities.filter(c => !isIndia(c.country)).reduce((s, c) => s + (c.count || 0), 0),
  }), [cities])

  return (
    <section className="region">
      <div className="region__container">
        <div className="region__header">
          <div>
            <span className="region__tag">Where to next?</span>
            <h2 className="region__title">Explore by region</h2>
            <p className="region__subtitle">
              Switch between Indian getaways and international escapes — packages, cities and prices update instantly.
            </p>
          </div>

          <div className="region__toggle" role="tablist" aria-label="Region">
            <button
              type="button"
              role="tab"
              aria-selected={region === 'india'}
              className={`region__toggle-btn ${region === 'india' ? 'is-active' : ''}`}
              onClick={() => setRegion('india')}
            >
              <span className="region__toggle-flag">🇮🇳</span>
              India
              <span className="region__toggle-count">{counts.india}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={region === 'international'}
              className={`region__toggle-btn ${region === 'international' ? 'is-active' : ''}`}
              onClick={() => setRegion('international')}
            >
              <span className="region__toggle-flag">🌍</span>
              International
              <span className="region__toggle-count">{counts.international}</span>
            </button>
          </div>
        </div>

        {/* Cities row */}
        <div className="region__sub">
          <h3 className="region__sub-title">
            {region === 'india' ? 'Cities across India' : 'International destinations'}
          </h3>
          <Link to="/cities" className="region__sub-link">
            View all
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="region__cities">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="region-skel region-skel--city" />)}
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="region__empty">
            No {region === 'india' ? 'Indian' : 'international'} cities yet — check back soon.
          </div>
        ) : (
          <div className="region__cities">
            {filteredCities.map(c => (
              <Link to={`/cities/${c.city}`} key={c.city} className="region-city" aria-label={`Explore ${c.name}`}>
                <img src={c.image || FALLBACK_IMG} alt={c.name} loading="lazy" onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} />
                <div className="region-city__shade" />
                <div className="region-city__overlay">
                  {c.country && <span className="region-city__country">{c.country}</span>}
                  <span className="region-city__name">{c.name}</span>
                  <span className="region-city__count">{c.count} {c.count === 1 ? 'package' : 'packages'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Packages row */}
        <div className="region__sub">
          <h3 className="region__sub-title">
            Top packages in {region === 'india' ? 'India' : 'international'}
          </h3>
          <Link to="/packages" className="region__sub-link">
            All packages
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="region__pkgs">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="region-skel region-skel--pkg" />)}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="region__empty">No packages in this region yet.</div>
        ) : (
          <div className="region__pkgs">
            {filteredPackages.map(pkg => (
              <Link to={`/packages/${pkg.slug}`} key={pkg._id || pkg.slug} className="pkg pkg--compact">
                <div className="pkg__media">
                  <img src={pkg.image || FALLBACK_IMG} alt={pkg.title} className="pkg__img" loading="lazy" onError={(e) => { e.currentTarget.src = FALLBACK_IMG }} />
                  <div className="pkg__shade" />
                  {pkg.duration && (
                    <span className="pkg__duration">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {pkg.duration}
                    </span>
                  )}
                  <div className="pkg__overlay">
                    {pkg.destination && (
                      <span className="pkg__location">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M12 22s-7-7.58-7-12a7 7 0 1 1 14 0c0 4.42-7 12-7 12z" strokeLinejoin="round"/>
                          <circle cx="12" cy="10" r="2.5"/>
                        </svg>
                        {pkg.destination}
                      </span>
                    )}
                    <h3 className="pkg__title">{pkg.title}</h3>
                  </div>
                </div>
                <div className="pkg__body">
                  <div className="pkg__footer">
                    <div className="pkg__price-block">
                      <span className="pkg__price-label">From</span>
                      <span className="pkg__price">
                        ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
                        <span className="pkg__per">/ person</span>
                      </span>
                    </div>
                    <span className="pkg__cta">
                      View
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
