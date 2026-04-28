import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchPackage } from '../api/client'
import './pages.css'

export default function PackageDetail() {
  const { slug } = useParams()
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchPackage(slug)
      .then(data => { setPkg(data); setActiveImg(0) })
      .catch(e => setError(e.response?.status === 404 ? 'Package not found.' : e.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="page"><div className="page__state">Loading…</div></div>
  if (error) return <div className="page"><div className="page__state page__state--error">{error}</div></div>
  if (!pkg) return null

  const images = [pkg.image, ...(pkg.gallery || [])].filter(Boolean)
  const hero = images[activeImg] || pkg.image

  return (
    <div className="page page--detail">
      <div className="detail__hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="detail__hero-overlay" />
        <div className="detail__hero-inner">
          {pkg.badge && <span className="detail__badge">{pkg.badge}</span>}
          <h1 className="detail__title">{pkg.title}</h1>
          <p className="detail__loc">{pkg.destination}{pkg.country ? `, ${pkg.country}` : ''} · {pkg.duration}</p>
        </div>
      </div>

      {images.length > 1 && (
        <div className="detail__thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`detail__thumb ${i === activeImg ? 'detail__thumb--active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
              onClick={() => setActiveImg(i)}
              aria-label={`View image ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="detail__body">
        <div className="detail__main">
          <section className="detail__section">
            <h2 className="detail__h2">Overview</h2>
            <p className="detail__p">{pkg.description || pkg.summary}</p>
          </section>

          {pkg.highlights?.length > 0 && (
            <section className="detail__section">
              <h2 className="detail__h2">Highlights</h2>
              <ul className="detail__list detail__list--grid">
                {pkg.highlights.map((h, i) => (
                  <li key={i}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {pkg.itinerary?.length > 0 && (
            <section className="detail__section">
              <h2 className="detail__h2">Itinerary</h2>
              <ol className="itinerary">
                {pkg.itinerary.map((d, i) => (
                  <li key={i} className="itinerary__day">
                    <div className="itinerary__num">Day {d.day}</div>
                    <div className="itinerary__content">
                      <h4>{d.title}</h4>
                      <p>{d.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="detail__cols">
            {pkg.inclusions?.length > 0 && (
              <section className="detail__section">
                <h2 className="detail__h2">Inclusions</h2>
                <ul className="detail__list">
                  {pkg.inclusions.map((x, i) => <li key={i}>✓ {x}</li>)}
                </ul>
              </section>
            )}
            {pkg.exclusions?.length > 0 && (
              <section className="detail__section">
                <h2 className="detail__h2">Exclusions</h2>
                <ul className="detail__list detail__list--ex">
                  {pkg.exclusions.map((x, i) => <li key={i}>✕ {x}</li>)}
                </ul>
              </section>
            )}
          </div>
        </div>

        <aside className="detail__aside">
          <div className="book-box">
            <span className="book-box__per">per person from</span>
            <div className="book-box__price">₹{Number(pkg.price).toLocaleString('en-IN')}</div>
            <div className="book-box__meta">{pkg.duration} · {pkg.rating} ★ ({pkg.reviews})</div>
            <Link to={`/book/${pkg.slug}`} className="book-box__btn">Book Now</Link>
            <Link to="/contact" className="book-box__alt">Talk to expert</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
