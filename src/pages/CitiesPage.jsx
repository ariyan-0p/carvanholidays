import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCities } from '../api/client'
import './pages.css'

export default function CitiesPage() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCities()
      .then(setCities)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page__hero">
        <div className="page__hero-inner">
          <span className="section-tag">Browse by city</span>
          <h1 className="page__title">Explore Destinations</h1>
          <p className="page__subtitle">Pick a city to see hand-picked packages curated just for it.</p>
        </div>
      </div>

      <div className="page__body">
        {loading && <div className="page__state">Loading…</div>}
        {error && <div className="page__state page__state--error">Couldn't load cities.</div>}
        {!loading && !error && cities.length === 0 && (
          <div className="page__state">No cities yet.</div>
        )}

        <div className="cities__grid">
          {cities.map(c => (
            <Link key={c.city} to={`/cities/${c.city}`} className="city-card">
              <div className="city-card__img-wrap">
                <img src={c.image} alt={c.name} className="city-card__img" />
                <div className="city-card__overlay" />
                <div className="city-card__meta">
                  <h3 className="city-card__name">{c.name}</h3>
                  {c.country && <span className="city-card__country">{c.country}</span>}
                </div>
              </div>
              <div className="city-card__footer">
                <span>{c.count} {c.count === 1 ? 'package' : 'packages'}</span>
                {c.minPrice != null && (
                  <span className="city-card__price">from ₹{Number(c.minPrice).toLocaleString('en-IN')}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
