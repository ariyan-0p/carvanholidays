import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchCity } from '../api/client'
import './pages.css'

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
      .catch(e => setError(e?.response?.status === 404 ? 'No packages found for this city.' : e.message))
      .finally(() => setLoading(false))
  }, [city])

  if (loading) return <div className="page"><div className="page__body"><div className="page__state">Loading…</div></div></div>
  if (error) return (
    <div className="page">
      <div className="page__body">
        <div className="page__state page__state--error">{error}</div>
        <div className="page__state"><Link to="/cities">← Back to all cities</Link></div>
      </div>
    </div>
  )
  if (!data) return null

  const { name, country, image, packages } = data
  return (
    <div className="page">
      <div className="page__hero page__hero--image" style={{ backgroundImage: `url(${image})` }}>
        <div className="page__hero-inner">
          <span className="section-tag">{country}</span>
          <h1 className="page__title">{name}</h1>
          <p className="page__subtitle">
            {packages.length} {packages.length === 1 ? 'package' : 'packages'} in {name}
          </p>
        </div>
      </div>

      <div className="page__body">
        <div className="packages__grid">
          {packages.map(pkg => (
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
