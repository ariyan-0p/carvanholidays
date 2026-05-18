import { useEffect, useState } from 'react'
import './Preloader.css'

const SESSION_KEY = 'ch_preloader_shown'
const MIN_DURATION = 2200 // ms — minimum time the preloader is visible
const MAX_DURATION = 3500 // ms — hard cap

export default function Preloader() {
  // Don't show if already seen this session (avoids flashing on SPA nav reloads)
  const initial = typeof window !== 'undefined' && !sessionStorage.getItem(SESSION_KEY)
  const [visible, setVisible] = useState(initial)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (!visible) return

    const start = performance.now()
    const finish = () => {
      const elapsed = performance.now() - start
      const remaining = Math.max(0, MIN_DURATION - elapsed)
      setTimeout(() => {
        setExiting(true)
        // After the exit transition, fully unmount.
        setTimeout(() => {
          setVisible(false)
          try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* noop */ }
        }, 700)
      }, remaining)
    }

    if (document.readyState === 'complete') {
      // Already loaded — wait for the minimum duration so the animation can breathe
      finish()
    } else {
      window.addEventListener('load', finish, { once: true })
    }

    // Hard cap in case `load` never fires
    const cap = setTimeout(finish, MAX_DURATION)
    return () => {
      window.removeEventListener('load', finish)
      clearTimeout(cap)
    }
  }, [visible])

  // Lock body scroll while preloader is visible
  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`preloader ${exiting ? 'preloader--exit' : ''}`} aria-hidden="true">
      {/* Soft moving aurora behind everything */}
      <div className="preloader__aurora" />

      {/* Drifting clouds */}
      <div className="preloader__clouds">
        <span className="preloader__cloud preloader__cloud--1" />
        <span className="preloader__cloud preloader__cloud--2" />
        <span className="preloader__cloud preloader__cloud--3" />
      </div>

      {/* Plane + dashed flight path */}
      <div className="preloader__stage">
        <svg
          className="preloader__path"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M -40 130 Q 250 20, 500 100 T 1040 70"
            fill="none"
            stroke="rgba(168, 245, 124, 0.55)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="6 10"
            className="preloader__path-line"
          />
        </svg>

        <span className="preloader__plane" aria-hidden="true">
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
              fill="currentColor"
            />
          </svg>
        </span>
      </div>

      {/* Brand wordmark */}
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
