import { useEffect, useRef, useState } from 'react'
import { fetchInsta } from '../api/client'
import './InstaShowcase.css'

const INSTA_HANDLE = '@carvaanholidays'
const INSTA_PROFILE = 'https://www.instagram.com/carvaanholidays/'

export default function InstaShowcase() {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchInsta()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || items.length === 0) return null

  return (
    <section className="insta">
      <div className="insta__container">
        <div className="insta__header">
          <span className="section-tag">@ Instagram</span>
          <h2 className="section-title">See us in motion</h2>
          <p className="section-subtitle">
            Real moments from real travellers — tap any reel to watch on Instagram
          </p>
        </div>

        <div className="insta__grid">
          {items.map((it) => (
            <InstaCard key={it._id} post={it} />
          ))}
        </div>

        <div className="insta__footer">
          <a
            href={INSTA_PROFILE}
            className="insta__follow"
            target="_blank"
            rel="noreferrer"
          >
            <InstaIcon />
            Follow us {INSTA_HANDLE}
          </a>
        </div>
      </div>
    </section>
  )
}

function InstaCard({ post }) {
  const videoRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (hovered) v.play().catch(() => {})
    else { try { v.pause(); v.currentTime = 0 } catch {} }
  }, [hovered])

  const open = () => {
    if (post.instaUrl) window.open(post.instaUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      className="insta-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onClick={open}
      aria-label={`Open Instagram post${post.caption ? `: ${post.caption}` : ''}`}
    >
      {post.videoUrl ? (
        <video
          ref={videoRef}
          className="insta-card__media"
          src={post.videoUrl}
          poster={post.posterUrl || undefined}
          muted
          loop
          playsInline
          preload="metadata"
        />
      ) : post.posterUrl ? (
        <img className="insta-card__media" src={post.posterUrl} alt={post.caption || 'Instagram post'} loading="lazy" />
      ) : (
        <div className="insta-card__placeholder"><InstaIcon /></div>
      )}

      <div className="insta-card__overlay">
        <span className="insta-card__badge">
          <InstaIcon />
          View on Instagram
        </span>
        {post.caption && <p className="insta-card__caption">{post.caption}</p>}
      </div>
    </button>
  )
}

function InstaIcon() {
  return (
    <svg className="insta-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}
