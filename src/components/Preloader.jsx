import { useEffect, useState } from 'react'
import './Preloader.css'

const MIN_DURATION = 2400 // ms — minimum time the preloader is visible
const MAX_DURATION = 4000 // ms — hard cap

export default function Preloader() {
  // Play on every full page load / refresh.
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    const finish = () => {
      const elapsed = performance.now() - start
      const remaining = Math.max(0, MIN_DURATION - elapsed)
      setTimeout(() => {
        setExiting(true)
        setTimeout(() => setVisible(false), 800)
      }, remaining)
    }
    if (document.readyState === 'complete') finish()
    else window.addEventListener('load', finish, { once: true })
    const cap = setTimeout(finish, MAX_DURATION)
    return () => {
      window.removeEventListener('load', finish)
      clearTimeout(cap)
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`preloader ${exiting ? 'preloader--exit' : ''}`} aria-hidden="true">
      {/* Aurora wash + slow grid */}
      <div className="preloader__aurora" />
      <div className="preloader__grid" />

      {/* Vertical trail line — drawn behind the plane */}
      <div className="preloader__trail">
        <span className="preloader__trail-line" />
        <span className="preloader__trail-glow" />
      </div>

      {/* Vapor / contrail particles */}
      <div className="preloader__contrail">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="preloader__puff" style={{ '--i': i }} />
        ))}
      </div>

      {/* Big plane that sweeps from bottom to top */}
      <div className="preloader__plane-wrap">
        <svg
          className="preloader__plane"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"  stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#E7FFD5" />
              <stop offset="100%" stopColor="#63D60A" />
            </linearGradient>
            <filter id="planeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
            fill="url(#planeGrad)"
            filter="url(#planeGlow)"
          />
        </svg>
      </div>

      {/* Brand block */}
      <div className="preloader__brand">
        <span className="preloader__tag">— Carvaan Holidays —</span>
        <h1 className="preloader__title">
          Travel the way <em>you imagine.</em>
        </h1>
        <div className="preloader__loader">
          <span className="preloader__loader-fill" />
        </div>
      </div>
    </div>
  )
}
