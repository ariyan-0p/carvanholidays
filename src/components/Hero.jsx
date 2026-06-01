import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { fetchHeroSlides } from '../api/client'
import './Hero.css'

// Default fallback slides — used until an admin adds dynamic hero slides.
const DEFAULT_SLIDES = [
  {
    _id: 'default-0',
    kind: 'image',
    label: 'Holiday Package',
    slug: 'bali-island-of-the-gods',
    destination: 'BALI',
    subtitle: 'Island of the Gods',
    description:
      'Experience breathtaking temples, lush rice terraces, and pristine beaches in the most magical island on earth.',
    price: '₹45,000',
    duration: '7N / 8D',
    ctaText: 'Explore',
    mediaUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1920&q=80',
    cards: [
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    _id: 'default-1',
    kind: 'image',
    label: 'Luxury Escape',
    slug: 'maldives-luxury-escape',
    destination: 'MALDIVES',
    subtitle: 'Paradise on Earth',
    description:
      'Drift into turquoise lagoons, overwater bungalows, and sunsets that paint the sky in shades of gold.',
    price: '₹85,000',
    duration: '5N / 6D',
    ctaText: 'Explore',
    mediaUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1920&q=80',
    cards: [
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    _id: 'default-2',
    kind: 'image',
    label: 'Heritage Tour',
    slug: 'golden-triangle',
    destination: 'RAJASTHAN',
    subtitle: 'Land of Kings',
    description:
      'Wander through royal palaces, golden deserts, and vibrant bazaars in the most colourful state of India.',
    price: '₹28,000',
    duration: '6N / 7D',
    ctaText: 'Explore',
    mediaUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1920&q=80',
    cards: [
      'https://images.unsplash.com/photo-1477587458883-47145ed86191?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80',
    ],
  },
]

// Resolve a media url — relative /uploads stays relative (proxied), absolute http(s) passes through.
const resolveUrl = (u) => u || ''

export default function Hero() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES)
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const heroRef = useRef(null)
  const videoRefs = useRef({})

  // Load dynamic slides from the API; fall back to defaults on error / empty.
  useEffect(() => {
    let mounted = true
    fetchHeroSlides()
      .then((list) => {
        if (!mounted) return
        if (Array.isArray(list) && list.length > 0) {
          setSlides(list)
          setCurrent(0)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  // Warm the browser cache for the first image slide so it paints instantly.
  useEffect(() => {
    const first = slides[0]
    if (!first || first.kind !== 'image' || !first.mediaUrl) return
    const img = new Image()
    img.src = resolveUrl(first.mediaUrl)
  }, [slides])

  const goTo = useCallback((idx) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 400)
  }, [animating])

  // Auto-advance every 5s (or 7s if the current slide is a video — gives it time to breathe)
  useEffect(() => {
    if (slides.length < 2) return
    const isVideo = slides[current]?.kind === 'video'
    const interval = isVideo ? 7000 : 5000
    const timer = setTimeout(() => {
      goTo((current + 1) % slides.length)
    }, interval)
    return () => clearTimeout(timer)
  }, [current, slides, goTo])

  // Restart video when its slide becomes active
  useEffect(() => {
    const active = slides[current]
    if (!active || active.kind !== 'video') return
    const v = videoRefs.current[active._id]
    if (v) {
      try {
        v.currentTime = 0
        const p = v.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } catch { /* noop */ }
    }
  }, [current, slides])

  // Mouse parallax on hero cards
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.setProperty('--mx', x.toFixed(3))
      el.style.setProperty('--my', y.toFixed(3))
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  // Scroll parallax on background
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const onScroll = () => {
      const y = window.scrollY
      el.style.setProperty('--scroll-y', `${y * 0.3}px`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!slides.length) return null
  const slide = slides[current]
  const cards = Array.isArray(slide.cards) ? slide.cards : []

  return (
    <section className="hero" ref={heroRef}>
      {/* Background layers — one per slide */}
      {slides.map((s, i) => {
        const isActive = i === current
        if (s.kind === 'video') {
          return (
            <div
              key={s._id || i}
              className={`hero__bg hero__bg--video ${isActive ? 'hero__bg--active' : ''}`}
            >
              <video
                ref={(el) => { if (el) videoRefs.current[s._id || i] = el }}
                src={resolveUrl(s.mediaUrl)}
                poster={resolveUrl(s.posterUrl) || undefined}
                muted
                loop
                playsInline
                autoPlay
                preload={isActive ? 'auto' : 'metadata'}
                style={{
                  objectFit: s.fitMode === 'contain' ? 'contain' : 'cover',
                  objectPosition: s.focusPoint || 'center',
                  background: s.fitMode === 'contain' ? '#06363c' : undefined,
                }}
              />
            </div>
          )
        }
        const fit = s.fitMode === 'contain' ? 'contain' : 'cover'
        const pos = s.focusPoint || 'center'
        return (
          <div
            key={s._id || i}
            className={`hero__bg hero__bg--${fit} ${isActive ? 'hero__bg--active' : ''}`}
            style={{
              backgroundImage: `url(${resolveUrl(s.mediaUrl)})`,
              backgroundSize: fit,
              backgroundPosition: pos,
              backgroundRepeat: 'no-repeat',
              backgroundColor: fit === 'contain' ? '#06363c' : undefined,
            }}
          />
        )
      })}

      {/* Gradient overlay */}
      {/* Dark overlay — togglable per slide (defaults to on) */}
      {slide?.showOverlay !== false && <div className="hero__overlay" />}

      {/* Content */}
      <div className={`hero__content ${animating ? 'hero__content--exit' : 'hero__content--enter'}`}>
        <div className="hero__text">
          {slide.label && <span className="hero__label">{slide.label}</span>}
          {slide.destination && <h1 className="hero__title">{slide.destination}</h1>}
          {slide.subtitle && <p className="hero__subtitle">{slide.subtitle}</p>}
          {slide.description && <p className="hero__desc">{slide.description}</p>}
          {(slide.duration || slide.price) && (
            <div className="hero__meta">
              {slide.duration && <span className="hero__duration">{slide.duration}</span>}
              {slide.price && <span className="hero__price">Starting {slide.price}</span>}
            </div>
          )}
          <div className="hero__cta-row">
            {slide.slug ? (
              <Link to={`/packages/${slide.slug}`} className="hero__btn">
                {slide.ctaText || 'Explore'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            ) : (
              <Link to="/packages" className="hero__btn">
                {slide.ctaText || 'Explore'}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            )}
            <Link to="/packages" className="hero__btn-ghost">View all packages</Link>
          </div>
        </div>

        {cards.length > 0 && (
          <div className="hero__cards">
            {cards.slice(0, 3).map((img, i) => (
              <div
                key={i}
                className={`hero__card hero__card--${i}`}
                style={{ backgroundImage: `url(${resolveUrl(img)})` }}
              />
            ))}
          </div>
        )}
      </div>

      {slides.length > 1 && (
        <div className="hero__dots">
          {slides.map((s, i) => (
            <button
              key={s._id || i}
              className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="hero__scroll-hint">
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}
