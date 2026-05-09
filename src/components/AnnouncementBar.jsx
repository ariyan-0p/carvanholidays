import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAnnouncements } from '../api/client'
import './AnnouncementBar.css'

const ROTATE_MS = 5500

export default function AnnouncementBar() {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    fetchAnnouncements()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setReady(true))
  }, [])

  // Reserve space at the top of the page for the bar.
  useEffect(() => {
    const visible = ready && items.length > 0
    const h = visible ? (window.matchMedia('(max-width: 600px)').matches ? '34px' : '38px') : '0px'
    document.documentElement.style.setProperty('--annbar-h', h)
    return () => document.documentElement.style.setProperty('--annbar-h', '0px')
  }, [ready, items.length])

  // Auto-rotate when there are multiple announcements.
  useEffect(() => {
    if (items.length < 2) return
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % items.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [items.length])

  if (!ready || items.length === 0) return null

  const current = items[idx % items.length]
  const bg = current.bgColor || '#12B84A'
  const fg = current.textColor || '#ffffff'

  const renderItem = (a) => (
    <span className="annbar__item">
      <span className="annbar__sparkle" aria-hidden="true">✦</span>
      <span className="annbar__text">{a.text}</span>
    </span>
  )

  const wrapLink = (a, node) =>
    a.link ? <Link to={a.link} className="annbar__link">{node}</Link> : node

  return (
    <div
      className="annbar"
      style={{ background: bg, color: fg }}
      role="region"
      aria-label="Announcements"
    >
      <div className="annbar__shimmer" aria-hidden="true" />

      <div className="annbar__stage">
        {/* Single key per index forces React to remount → re-fires the slide-in animation */}
        <div key={idx} className="annbar__slide">
          {wrapLink(current, renderItem(current))}
        </div>
      </div>

      {items.length > 1 && (
        <div className="annbar__dots" aria-hidden="true">
          {items.map((_, i) => (
            <span key={i} className={`annbar__dot ${i === idx ? 'is-active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  )
}
