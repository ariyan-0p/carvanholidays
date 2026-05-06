import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCity } from '../api/client'
import './CityDetailPage.css'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'

export default function CityDetailPage() {
  const { city } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchCity(city)
      .then(setData)
      .catch(e => setError(e?.response?.status === 404 ? 'No packages found for this city yet.' : e.message))
      .finally(() => setLoading(false))
  }, [city])

  if (loading) {
    return (
      <div className="city-detail">
        <div className="city-detail__hero city-detail__hero--loading" />
        <div className="city-detail__body">
          <div className="city-detail__state">Loading…</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="city-detail">
        <div className="city-detail__body">
          <div className="city-detail__empty">
            <h2>{error}</h2>
            <p>Browse other destinations or get in touch for a custom itinerary.</p>
            <div className="city-detail__empty-actions">
              <Link to="/cities" className="city-detail__btn">← All cities</Link>
              <Link to="/contact" className="city-detail__btn city-detail__btn--ghost">Plan custom trip</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { name, country, image, packages } = data
  const heroImg = image || FALLBACK_IMG
  const minPrice = packages.reduce((m, p) => Math.min(m, Number(p.price) || Infinity), Infinity)

  return (
    <div className="city-detail">
      {/* Hero */}
      <header
        className="city-detail__hero"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(8,67,74,0.55) 0%, rgba(8,67,74,0.85) 100%), url(${heroImg})` }}
      >
        <div className="city-detail__hero-inner">
          <Link to="/cities" className="city-detail__back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M11 6L5 12L11 18"/>
            </svg>
            All cities
          </Link>
          {country && <span className="city-detail__country">{country}</span>}
          <h1 className="city-detail__title">{name}</h1>
          <p className="city-detail__sub">
            {packages.length} {packages.length === 1 ? 'curated package' : 'curated packages'}
            {minPrice !== Infinity && (
              <> · from <strong>₹{Number(minPrice).toLocaleString('en-IN')}</strong></>
            )}
          </p>
        </div>
      </header>

      {/* Packages grid (uses .pkg cards from Packages.css) */}
      <div className="city-detail__body">
        <div className="city-detail__grid">
          {packages.map(pkg => (
            <Link to={`/packages/${pkg.slug}`} key={pkg._id || pkg.slug} className="pkg">
              <div className="pkg__media">
                <img
                  src={pkg.image || FALLBACK_IMG}
                  alt={pkg.title}
                  className="pkg__img"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG }}
                />
                <div className="pkg__shade" />
                {pkg.badge && <span className="pkg__badge">{pkg.badge}</span>}
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
                <div className="pkg__meta">
                  {pkg.rating ? (
                    <span className="pkg__rating">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21l1.18-6.88-5-4.87 6.91-1.01L12 2z"/>
                      </svg>
                      {Number(pkg.rating).toFixed(1)}
                      {pkg.reviews ? <span className="pkg__reviews">({pkg.reviews})</span> : null}
                    </span>
                  ) : <span />}
                  {pkg.category && <span className="pkg__chip">{pkg.category}</span>}
                </div>
                {Array.isArray(pkg.highlights) && pkg.highlights.length > 0 && (
                  <ul className="pkg__highlights">
                    {pkg.highlights.slice(0, 3).map((h, i) => (
                      <li key={i}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
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
      </div>
    </div>
  )
}
