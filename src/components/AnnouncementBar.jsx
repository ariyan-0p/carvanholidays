import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAnnouncements } from '../api/client'
import './AnnouncementBar.css'

export default function AnnouncementBar() {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setReady(true))
  }, [])

  // Push navbar/subnav down by the bar's height while it's on screen.
  useEffect(() => {
    const visible = ready && items.length > 0
    const h = visible ? (window.matchMedia('(max-width: 600px)').matches ? '34px' : '38px') : '0px'
    document.documentElement.style.setProperty('--annbar-h', h)
    return () => document.documentElement.style.setProperty('--annbar-h', '0px')
  }, [ready, items.length])

  if (!ready || items.length === 0) return null

  // Marquee uses the first item's colors as the bar background.
  const head = items[0]
  const bg = head.bgColor || '#12B84A'
  const fg = head.textColor || '#ffffff'
  const animation = head.animation || 'marquee'

  // Build a doubled track so the marquee loops seamlessly.
  const renderItem = (a, key) => {
    const inner = (
      <span className="annbar__item" key={key}>
        <span className="annbar__sparkle" aria-hidden="true">✦</span>
        <span className="annbar__text">{a.text}</span>
      </span>
    )
    return a.link ? (
      <Link to={a.link} className="annbar__link" key={key}>{inner}</Link>
    ) : inner
  }

  return (
    <div
      className={`annbar annbar--${animation}`}
      style={{ background: bg, color: fg }}
      role="region"
      aria-label="Announcements"
    >
      <div className="annbar__shimmer" aria-hidden="true" />
      {animation === 'marquee' ? (
        <div className="annbar__viewport">
          <div className="annbar__track">
            {items.map((a, i) => renderItem(a, `a-${i}`))}
            {items.map((a, i) => renderItem(a, `b-${i}`))}
          </div>
        </div>
      ) : (
        <div className="annbar__static">
          {items.map((a, i) => renderItem(a, i))}
        </div>
      )}
    </div>
  )
}
