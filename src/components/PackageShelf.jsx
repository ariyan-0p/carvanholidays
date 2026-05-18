import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { fetchPackages } from '../api/client'
import { useReveal } from '../hooks/useReveal'
import './Packages.css'

function PkgCard({ pkg, index, FALLBACK_IMG }) {
  const [ref, visible] = useReveal({ delay: (index % 3) * 100 })
  const tiltRef = useRef(null)

  const handleMove = (e) => {
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - y) * 6
    const ry = (x - 0.5) * 6
    el.style.setProperty('--rx', `${rx}deg`)
    el.style.setProperty('--ry', `${ry}deg`)
    el.style.setProperty('--mx', `${x * 100}%`)
    el.style.setProperty('--my', `${y * 100}%`)
  }
  const handleLeave = () => {
    const el = tiltRef.current
    if (!el) return
    el.style.setProperty('--rx', `0deg`)
    el.style.setProperty('--ry', `0deg`)
  }

  return (
    <div
      ref={ref}
      className={`pkg-wrap reveal ${visible ? 'is-visible' : ''}`}
    >
      <Link
        to={`/packages/${pkg.slug}`}
        ref={tiltRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="pkg pkg--tilt glow-on-hover"
        aria-label={`View ${pkg.title} package`}
      >
        <div className="pkg__media">
          <img
            src={pkg.image || FALLBACK_IMG}
            alt={pkg.title}
            className="pkg__img"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = FALLBACK_IMG }}
          />
          <div className="pkg__shade" />
          <div className="pkg__sheen" aria-hidden="true" />

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
              <span className="pkg__rating" aria-label={`Rated ${pkg.rating}`}>
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
    </div>
  )
}

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'

export default function PackageShelf({
  section = 'featured',
  tag,
  title,
  subtitle,
  limit = 6,
  hideIfEmpty = true,
  variant,
}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchPackages({ section, limit })
      .then((data) => mounted && setItems(Array.isArray(data) ? data : []))
      .catch((e) => mounted && setError(e?.response?.data?.error || e.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [section, limit])

  const [headerRef, headerVisible] = useReveal()

  if (!loading && items.length === 0 && hideIfEmpty) return null

  return (
    <section className={`pkgs ${variant ? `pkgs--${variant}` : ''}`} data-section={section}>
      <div className="pkgs__container">
        <div
          ref={headerRef}
          className={`pkgs__header reveal ${headerVisible ? 'is-visible' : ''}`}
        >
          <div className="pkgs__heading">
            {tag && <span className="pkgs__tag">{tag}</span>}
            {title && <h2 className="pkgs__title">{title}</h2>}
            {subtitle && <p className="pkgs__subtitle">{subtitle}</p>}
          </div>
          <Link to="/packages" className="pkgs__view-all">
            Explore all
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {loading && (
          <div className="pkgs__grid">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="pkg-skeleton">
                <div className="pkg-skeleton__img" />
                <div className="pkg-skeleton__line pkg-skeleton__line--wide" />
                <div className="pkg-skeleton__line" />
                <div className="pkg-skeleton__footer" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="pkgs__state pkgs__state--error">
            Couldn't load packages right now. Please try again in a moment.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="pkgs__grid">
            {items.map((pkg, i) => (
              <PkgCard key={pkg._id || pkg.slug} pkg={pkg} index={i} FALLBACK_IMG={FALLBACK_IMG} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
