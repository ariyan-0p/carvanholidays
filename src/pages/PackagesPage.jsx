import { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchPackages } from '../api/client'
import { useReveal } from '../hooks/useReveal'
import '../components/Packages.css'
import './pages.css'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'beach', label: 'Beach' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'honeymoon', label: 'Honeymoon' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'family', label: 'Family' },
  { value: 'multi-country', label: 'Multi-Country' },
]

// One reusable card — matches the editorial PkgCard used on the homepage shelf.
function PkgCard({ pkg, index }) {
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
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div ref={ref} className={`pkg-wrap reveal ${visible ? 'is-visible' : ''}`}>
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

export default function PackagesPage() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState(params.get('q') || '')

  const category = params.get('category') || ''
  const q = params.get('q') || ''

  useEffect(() => {
    setLoading(true)
    fetchPackages({ category: category || undefined, q: q || undefined })
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch((e) => setError(e?.message || 'load failed'))
      .finally(() => setLoading(false))
  }, [category, q])

  useEffect(() => { setSearchInput(q) }, [q])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }

  const { eyebrow, title, sub } = useMemo(() => {
    if (q) return { eyebrow: 'Search results', title: <>Showing trips for <em>"{q}"</em></>, sub: `${items.length} ${items.length === 1 ? 'result' : 'results'} matching your search.` }
    if (category) {
      const label = CATEGORIES.find(c => c.value === category)?.label || category
      return { eyebrow: 'Category', title: <><em>{label}</em> holidays</>, sub: `Hand-picked ${label.toLowerCase()} itineraries across every budget.` }
    }
    return { eyebrow: 'Find your trip', title: <>All <em>holiday</em> packages</>, sub: 'Hand-picked itineraries across every budget and mood.' }
  }, [category, q, items.length])

  const [headerRef, headerVisible] = useReveal()

  return (
    <div className="pkgs-page">
      {/* Editorial hero band */}
      <header className="pkgs-page__hero">
        <div className="pkgs-page__hero-aurora" aria-hidden="true" />
        <div
          ref={headerRef}
          className={`pkgs-page__hero-inner reveal ${headerVisible ? 'is-visible' : ''}`}
        >
          <span className="section-tag pkgs-page__eyebrow">{eyebrow}</span>
          <h1 className="pkgs-page__title">{title}</h1>
          <p className="pkgs-page__subtitle">{sub}</p>
        </div>
      </header>

      <div className="pkgs-page__body">
        {/* Sticky filter strip */}
        <div className="pkgs-filter">
          <div className="pkgs-filter__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7"/>
              <path d="m20 20-3.5-3.5"/>
            </svg>
            <input
              type="text"
              placeholder="Search destination, country, city…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') updateParam('q', searchInput.trim()) }}
            />
            {searchInput && (
              <button
                type="button"
                className="pkgs-filter__clear"
                onClick={() => { setSearchInput(''); updateParam('q', '') }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="pkgs-filter__chips" role="tablist" aria-label="Categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.value || 'all'}
                type="button"
                role="tab"
                aria-selected={category === c.value}
                className={`pkgs-chip ${category === c.value ? 'is-active' : ''}`}
                onClick={() => updateParam('category', c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {!loading && !error && items.length > 0 && (
          <div className="pkgs-page__count">
            {items.length} {items.length === 1 ? 'package' : 'packages'} found
            {(q || category) && (
              <button
                type="button"
                className="pkgs-page__reset"
                onClick={() => setParams({}, { replace: true })}
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {/* States */}
        {loading && (
          <div className="pkgs__grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pkg-skeleton">
                <div className="pkg-skeleton__img" />
                <div className="pkg-skeleton__line pkg-skeleton__line--wide" />
                <div className="pkg-skeleton__line" />
                <div className="pkg-skeleton__footer" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="pkgs-page__empty">
            <div className="pkgs-page__empty-icon" aria-hidden="true">⚠️</div>
            <h2>Couldn't load packages</h2>
            <p>{error}. Please try again in a moment.</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="pkgs-page__empty">
            <div className="pkgs-page__empty-icon" aria-hidden="true">🧭</div>
            <h2>No packages match your filters</h2>
            <p>Try clearing the search or picking a different category.</p>
            {(q || category) && (
              <button
                type="button"
                className="pkgs-page__reset pkgs-page__reset--solo"
                onClick={() => setParams({}, { replace: true })}
              >
                Reset filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="pkgs__grid">
            {items.map((pkg, i) => (
              <PkgCard key={pkg._id || pkg.slug} pkg={pkg} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
