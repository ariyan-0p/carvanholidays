import { useEffect, useState } from 'react'
import { fetchPartners } from '../api/client'
import './OfficialPartners.css'

export default function OfficialPartners() {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchPartners()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || items.length === 0) return null

  // Duplicate the list so the marquee loops seamlessly when there are several
  // partners. With only 1–2 the static row centers without scrolling.
  const shouldMarquee = items.length > 4
  const looped = shouldMarquee ? [...items, ...items] : items

  const renderLogo = (p, i) => {
    const inner = (
      <span className="partners__logo" key={`${p._id}-${i}`} title={p.name}>
        <img src={p.logoUrl} alt={p.name} loading="lazy" />
      </span>
    )
    return p.link ? (
      <a key={`${p._id}-${i}`} href={p.link} className="partners__link" target="_blank" rel="noreferrer">
        {inner}
      </a>
    ) : inner
  }

  return (
    <section className="partners" aria-label="Official partners">
      <div className="partners__container">
        <div className="partners__heading">
          <span className="partners__line" />
          <h3 className="partners__label">Official Partners</h3>
          <span className="partners__line" />
        </div>

        {shouldMarquee ? (
          <div className="partners__marquee" aria-hidden="false">
            <div className="partners__track">
              {looped.map(renderLogo)}
            </div>
          </div>
        ) : (
          <div className="partners__row">
            {items.map(renderLogo)}
          </div>
        )}
      </div>
    </section>
  )
}
