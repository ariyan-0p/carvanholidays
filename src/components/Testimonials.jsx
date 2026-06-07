import { useEffect, useRef, useState } from 'react'
import { fetchTestimonials } from '../api/client'
import './Testimonials.css'

const FALLBACK = [
  {
    _id: 'f1', kind: 'message', name: 'Priya Sharma', location: 'Mumbai', trip: 'Bali, 7N/8D', rating: 5,
    quote: 'Carvaan Holidays made our anniversary trip absolutely magical. Every detail was taken care of — from airport pickup to the romantic candlelit dinner they arranged as a surprise.',
    mediaUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'f2', kind: 'message', name: 'Rahul Mehra', location: 'Delhi', trip: 'Europe Tour, 12N/13D', rating: 5,
    quote: 'Covered 6 countries in 13 days without a single hiccup. Their team handled visas, hotels, and transfers seamlessly. The local guides were incredible!',
    mediaUrl: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'f3', kind: 'message', name: 'Anjali Nair', location: 'Bangalore', trip: 'Kerala Backwaters, 5N/6D', rating: 5,
    quote: 'The houseboat experience they arranged was beyond words. Waking up to the backwaters with a Kerala breakfast ready — pure bliss.',
    mediaUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    _id: 'f4', kind: 'message', name: 'Vikram Patel', location: 'Ahmedabad', trip: 'Maldives, 5N/6D', rating: 5,
    quote: 'First time travelling internationally and Carvaan made it stress-free from day one. The overwater villa was a dream.',
    mediaUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
]

export default function Testimonials() {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchTestimonials()
      .then((list) => {
        setItems(Array.isArray(list) && list.length ? list : FALLBACK)
      })
      .catch(() => setItems(FALLBACK))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded) return null

  return (
    <section className="testimonials">
      <div className="testimonials__container">
        <div className="testimonials__header">
          <span className="section-tag">Real Stories</span>
          <h2 className="section-title">What Our Travellers Say</h2>
          <p className="section-subtitle">
            50,000+ happy travellers and counting — here's what they have to say
          </p>
        </div>

        <div className="testimonials__grid">
          {items.map((t) => (
            <TestimonialCard key={t._id} t={t} />
          ))}
        </div>

        <div className="testimonials__badge">
          <span className="testimonials__badge-stars">★★★★★</span>
          <div>
            <span className="testimonials__badge-score">4.9 / 5</span>
            <span className="testimonials__badge-source">Based on 1,200+ Google Reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ t }) {
  const stars = '★'.repeat(Math.max(1, Math.min(5, t.rating || 5)))
  const meta = [t.location, t.trip].filter(Boolean).join(' • ')
  const isVideo = t.kind === 'video' && t.mediaUrl
  const isPhoto = t.kind === 'photo' && t.mediaUrl
  const isMessage = !isVideo && !isPhoto

  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)

  // Auto-play / pause as the reel enters / leaves the viewport (Instagram style)
  useEffect(() => {
    const v = videoRef.current
    if (!v || !isVideo) return
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const p = v.play()
            if (p && typeof p.catch === 'function') p.catch(() => {})
          } else {
            v.pause()
          }
        })
      },
      { threshold: 0.55 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [isVideo])

  const toggleMute = (e) => {
    e.stopPropagation()
    setMuted((m) => !m)
  }

  return (
    <div className={`review-card ${isVideo ? 'review-card--reel' : ''}`}>
      {isVideo && (
        <div className="review-card__media review-card__media--reel">
          <video
            ref={videoRef}
            src={t.mediaUrl}
            poster={t.posterUrl || undefined}
            muted={muted}
            loop
            playsInline
            preload="metadata"
          />
          <button
            type="button"
            className="review-card__mute"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
              </svg>
            )}
          </button>
        </div>
      )}
      {isPhoto && (
        <div className="review-card__media">
          <img src={t.mediaUrl} alt={t.name} loading="lazy" />
        </div>
      )}

      <div className="review-card__body">
        <div className="review-card__stars">{stars}</div>
        {t.quote && <p className="review-card__text">"{t.quote}"</p>}
      </div>

      <div className="review-card__reviewer">
        {isMessage && t.mediaUrl && (
          <img src={t.mediaUrl} alt={t.name} className="review-card__avatar" />
        )}
        <div>
          <span className="review-card__name">{t.name}</span>
          {meta && <span className="review-card__meta">{meta}</span>}
        </div>
      </div>
    </div>
  )
}
