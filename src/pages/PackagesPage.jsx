import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchPackages } from '../api/client'
import './pages.css'

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

export default function PackagesPage() {
  const [params, setParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const category = params.get('category') || ''
  const q = params.get('q') || ''

  useEffect(() => {
    setLoading(true)
    fetchPackages({ category: category || undefined, q: q || undefined })
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [category, q])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }

  const heading = useMemo(() => {
    if (q) return `Results for "${q}"`
    if (category) return CATEGORIES.find(c => c.value === category)?.label + ' Holidays'
    return 'All Holiday Packages'
  }, [category, q])

  return (
    <div className="page">
      <div className="page__hero">
        <div className="page__hero-inner">
          <span className="section-tag">Find your trip</span>
          <h1 className="page__title">{heading}</h1>
          <p className="page__subtitle">Hand-picked itineraries across every budget and mood.</p>
        </div>
      </div>

      <div className="page__body">
        <div className="filter-bar">
          <input
            className="filter-bar__search"
            placeholder="Search destination, country…"
            defaultValue={q}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParam('q', e.currentTarget.value) }}
          />
          <div className="filter-bar__chips">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                className={`chip ${category === c.value ? 'chip--active' : ''}`}
                onClick={() => updateParam('category', c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="page__state">Loading…</div>}
        {error && <div className="page__state page__state--error">Couldn't load packages.</div>}
        {!loading && !error && items.length === 0 && <div className="page__state">No packages match your filters.</div>}

        <div className="packages__grid">
          {items.map(pkg => (
            <Link to={`/packages/${pkg.slug}`} key={pkg._id || pkg.slug} className="pkg-card">
              <div className="pkg-card__img-wrap">
                <img src={pkg.image} alt={pkg.title} className="pkg-card__img" />
                {pkg.badge && <span className="pkg-card__badge">{pkg.badge}</span>}
                <span className="pkg-card__duration">{pkg.duration}</span>
              </div>
              <div className="pkg-card__body">
                <h3 className="pkg-card__title">{pkg.title}</h3>
                <div className="pkg-card__rating">
                  <span className="pkg-card__stars">{'★'.repeat(Math.floor(pkg.rating || 0))}</span>
                  <span className="pkg-card__rating-val">{pkg.rating}</span>
                  <span className="pkg-card__reviews">({pkg.reviews})</span>
                </div>
                <ul className="pkg-card__highlights">
                  {(pkg.highlights || []).slice(0, 4).map((h, i) => (
                    <li key={i}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="pkg-card__footer">
                  <div className="pkg-card__price-block">
                    <span className="pkg-card__per">per person from</span>
                    <span className="pkg-card__price">₹{Number(pkg.price).toLocaleString('en-IN')}</span>
                  </div>
                  <span className="pkg-card__btn">View</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
