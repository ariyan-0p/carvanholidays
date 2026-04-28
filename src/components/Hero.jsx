import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Hero.css'

const slides = [
  {
    id: 0,
    label: 'Holiday Package',
    slug: 'bali-island-of-the-gods',
    destination: 'BALI',
    subtitle: 'Island of the Gods',
    description:
      'Experience breathtaking temples, lush rice terraces, and pristine beaches in the most magical island on earth.',
    price: '₹45,000',
    duration: '7N / 8D',
    bg: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1920&q=80',
    cards: [
      'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 1,
    label: 'Luxury Escape',
    slug: 'maldives-luxury-escape',
    destination: 'MALDIVES',
    subtitle: 'Paradise on Earth',
    description:
      'Drift into turquoise lagoons, overwater bungalows, and sunsets that paint the sky in shades of gold.',
    price: '₹85,000',
    duration: '5N / 6D',
    bg: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1920&q=80',
    cards: [
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1540202404-a2f29016b523?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=400&q=80',
    ],
  },
  {
    id: 2,
    label: 'Heritage Tour',
    slug: 'golden-triangle',
    destination: 'RAJASTHAN',
    subtitle: 'Land of Kings',
    description:
      'Wander through royal palaces, golden deserts, and vibrant bazaars in the most colourful state of India.',
    price: '₹28,000',
    duration: '6N / 7D',
    bg: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1920&q=80',
    cards: [
      'https://images.unsplash.com/photo-1477587458883-47145ed86191?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=400&q=80',
    ],
  },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((idx) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(idx)
      setAnimating(false)
    }, 400)
  }, [animating])

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [current, goTo])

  const slide = slides[current]

  return (
    <section className="hero">
      {/* Background image */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`hero__bg ${i === current ? 'hero__bg--active' : ''}`}
          style={{ backgroundImage: `url(${s.bg})` }}
        />
      ))}

      {/* Gradient overlay */}
      <div className="hero__overlay" />

      {/* Content */}
      <div className={`hero__content ${animating ? 'hero__content--exit' : 'hero__content--enter'}`}>
        {/* Left: text */}
        <div className="hero__text">
          <span className="hero__label">{slide.label}</span>
          <h1 className="hero__title">{slide.destination}</h1>
          <p className="hero__subtitle">{slide.subtitle}</p>
          <p className="hero__desc">{slide.description}</p>
          <div className="hero__meta">
            <span className="hero__duration">{slide.duration}</span>
            <span className="hero__price">Starting {slide.price}</span>
          </div>
          <div className="hero__cta-row">
            <Link to={`/packages/${slide.slug}`} className="hero__btn">
              Explore
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/packages" className="hero__btn-ghost">View all packages</Link>
          </div>
        </div>

        {/* Right: floating image cards */}
        <div className="hero__cards">
          {slide.cards.map((img, i) => (
            <div
              key={i}
              className={`hero__card hero__card--${i}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
      </div>

      {/* Dot navigation */}
      <div className="hero__dots">
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div className="hero__scroll-hint">
        <div className="hero__scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  )
}
