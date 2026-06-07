import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchBanners } from '../api/client'
import './PromoBanner.css'

const ROTATE_MS = 6000

function BannerLink({ banner, children }) {
  const link = banner.link?.trim()
  if (!link) return <div className="promo-banner__media-wrap">{children}</div>
  const isExternal = /^(https?:)?\/\//i.test(link)
  if (isExternal) {
    return (
      <a
        href={link}
        target={banner.openInNewTab ? '_blank' : undefined}
        rel={banner.openInNewTab ? 'noopener noreferrer' : undefined}
        className="promo-banner__media-wrap"
      >
        {children}
      </a>
    )
  }
  return (
    <Link
      to={link}
      target={banner.openInNewTab ? '_blank' : undefined}
      className="promo-banner__media-wrap"
    >
      {children}
    </Link>
  )
}

export default function PromoBanner({ slot }) {
  const [items, setItems] = useState([])
  const [idx, setIdx] = useState(0)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let mounted = true
    fetchBanners(slot)
      .then((list) => mounted && setItems(Array.isArray(list) ? list : []))
      .catch((e) => mounted && setErr(e?.message || 'load failed'))
    return () => { mounted = false }
  }, [slot])

  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % items.length)
    }, ROTATE_MS)
    return () => clearInterval(t)
  }, [items.length])

  if (err) {
    // Surface load errors to the console rather than rendering nothing silently
    console.warn(`[PromoBanner:${slot}]`, err)
  }
  if (!items.length) return null
  const current = items[idx % items.length]

  return (
    <section className="promo-banner" data-slot={slot}>
      <div className="promo-banner__container">
        <BannerLink banner={current}>
          <picture>
            {current.mobileImageUrl && (
              <source media="(max-width: 720px)" srcSet={current.mobileImageUrl} />
            )}
            <img
              key={current._id}
              src={current.imageUrl}
              alt={current.title || ''}
              className="promo-banner__img"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </picture>
        </BannerLink>

        {items.length > 1 && (
          <div className="promo-banner__dots" aria-hidden="true">
            {items.map((b, i) => (
              <button
                key={b._id}
                type="button"
                className={`promo-banner__dot ${i === idx ? 'is-active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Go to banner ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
