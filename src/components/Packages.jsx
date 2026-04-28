import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPackages } from '../api/client'
import './Packages.css'

export default function Packages({ limit = 4, showHeader = true }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchPackages({ featured: true, limit })
      .then(data => mounted && setPackages(data))
      .catch(e => mounted && setError(e.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [limit])

  return (
    <section className="packages" id="packages">
      <div className="packages__container">
        {showHeader && (
          <div className="packages__header">
            <div>
              <span className="section-tag">Curated for you</span>
              <h2 className="section-title">Our Holiday Packages</h2>
              <p className="section-subtitle">
                Everything planned — all you need to do is pack your bags
              </p>
            </div>
            <Link to="/packages" className="view-all-btn">
              All Packages
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </Link>
          </div>
        )}

        {loading && <div className="packages__state">Loading packages…</div>}
        {error && (
          <div className="packages__state packages__state--error">
            Couldn't load packages. Make sure the API is running on port 5000.
          </div>
        )}
        {!loading && !error && packages.length === 0 && (
          <div className="packages__state">No packages yet.</div>
        )}

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
                  <span className="pkg-card__stars">
                    {'★'.repeat(Math.floor(pkg.rating || 0))}
                  </span>
                  <span className="pkg-card__rating-val">{pkg.rating}</span>
                  <span className="pkg-card__reviews">({pkg.reviews} reviews)</span>
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
    </section>
  )
}
