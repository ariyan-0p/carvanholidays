import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCities } from '../api/client'
import './FeaturedCities.css'

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'

export default function FeaturedCities({ limit = 8 }) {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let m = true
    fetchCities()
      .then(d => m && setCities(d.slice(0, limit)))
      .catch(() => m && setCities([]))
      .finally(() => m && setLoading(false))
    return () => { m = false }
  }, [limit])

  if (!loading && cities.length === 0) return null

  return (
    <section className="fcities">
      <div className="fcities__container">
        <div className="fcities__header">
          <div>
            <span className="fcities__tag">Travel by destination</span>
            <h2 className="fcities__title">Popular cities</h2>
            <p className="fcities__subtitle">
              Browse packages by where you want to go.
            </p>
          </div>
          <Link to="/cities" className="fcities__view-all">
            All cities
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="fcities__grid">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="fcity-skel" />
            ))}
          </div>
        ) : (
          <div className="fcities__grid">
            {cities.map(c => (
              <Link key={c.city} to={`/cities/${c.city}`} className="fcity" aria-label={`Explore ${c.name}`}>
                <img
                  src={c.image || FALLBACK_IMG}
                  alt={c.name}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG }}
                />
                <div className="fcity__shade" />
                <div className="fcity__overlay">
                  {c.country && <span className="fcity__country">{c.country}</span>}
                  <span className="fcity__name">{c.name}</span>
                  <span className="fcity__count">{c.count} {c.count === 1 ? 'package' : 'packages'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
