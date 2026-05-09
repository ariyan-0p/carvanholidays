import { useEffect, useRef, useState } from 'react'
import { fetchInsta } from '../api/client'
import './InstaShowcase.css'

const INSTA_HANDLE = '@carvaanholidays'
const INSTA_PROFILE = 'https://www.instagram.com/carvaanholidays/'

export default function InstaShowcase() {
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)
  // id of the currently-audible video (only one at a time)
  const [audibleId, setAudibleId] = useState(null)

  useEffect(() => {
    fetchInsta()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || items.length === 0) return null

  const toggleAudible = (id) => {
    setAudibleId((cur) => (cur === id ? null : id))
  }

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
            <InstaCard
              key={it._id}
              post={it}
              isAudible={audibleId === it._id}
              onToggleAudible={() => toggleAudible(it._id)}
            />
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

function InstaCard({ post, isAudible, onToggleAudible }) {
  const videoRef = useRef(null)

  // Autoplay muted on mount + loop forever. Browsers permit autoplay only when
  // muted, so we keep the default state muted and respond to user interaction
  // for sound.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.loop = true
    const tryPlay = () => v.play().catch(() => {})
    tryPlay()
    // Some browsers pause autoplay when the tab is hidden; resume on visibility.
    const onVis = () => { if (!document.hidden) tryPlay() }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // React to the parent picking a different "currently audible" video.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !isAudible
    if (isAudible) {
      v.volume = 1
      // Re-trigger play in case mute change paused it on some browsers.
      v.play().catch(() => {})
    }
  }, [isAudible])

  const openInsta = () => {
    if (post.instaUrl) window.open(post.instaUrl, '_blank', 'noopener,noreferrer')
  }

  const onSoundClick = (e) => {
    e.stopPropagation()
    onToggleAudible()
  }

  return (
    <div
      className="insta-card"
      role="button"
      tabIndex={0}
      onClick={openInsta}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInsta() } }}
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
          autoPlay
          playsInline
          preload="metadata"
        />
      ) : post.posterUrl ? (
        <img className="insta-card__media" src={post.posterUrl} alt={post.caption || 'Instagram post'} loading="lazy" />
      ) : (
        <div className="insta-card__placeholder"><InstaIcon /></div>
      )}

      {post.videoUrl && (
        <button
          type="button"
          className={`insta-card__sound ${isAudible ? 'is-on' : ''}`}
          onClick={onSoundClick}
          aria-label={isAudible ? 'Mute video' : 'Unmute video'}
          title={isAudible ? 'Tap to mute' : 'Tap for sound'}
        >
          {isAudible ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
        </button>
      )}

      <div className="insta-card__overlay">
        <span className="insta-card__badge">
          <InstaIcon />
          View on Instagram
        </span>
        {post.caption && <p className="insta-card__caption">{post.caption}</p>}
      </div>
    </div>
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

function SpeakerOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5z"/>
      <line x1="22" y1="9" x2="16" y2="15"/>
      <line x1="16" y1="9" x2="22" y2="15"/>
    </svg>
  )
}

function SpeakerOnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5z"/>
      <path d="M15.5 9.5a4 4 0 0 1 0 5"/>
      <path d="M19 6a8 8 0 0 1 0 12"/>
    </svg>
  )
}
