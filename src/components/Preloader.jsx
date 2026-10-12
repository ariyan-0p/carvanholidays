import { useEffect, useState } from 'react'
import brandMark from '../assets/brand-mark.png'
import './Preloader.css'

const MIN_DURATION = 3400 // ms — minimum time the preloader is visible
const MAX_DURATION = 5200 // ms — hard cap

export default function Preloader() {
  // Play on every full page load / refresh.
  const [visible, setVisible] = useState(true)
  const [exiting, setExiting] = useState(false)
  const [pct, setPct] = useState(0)

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

  // Eases 0 -> 100 across the minimum duration so the number matches the bar.
  useEffect(() => {
    if (!visible) return
    let raf
    const t0 = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / MIN_DURATION)
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  if (!visible) return null

  return (
    <div className={`preloader ${exiting ? 'preloader--exit' : ''}`} role="status" aria-label="Loading Carvaan Holidays">
      <div className="preloader__glow" />

      <div className="preloader__stage">
        {/* Flight route: glowing trail, wake puffs, banking airliner, destination pin */}
        <svg className="preloader__route" viewBox="0 0 400 130" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="preTrail" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="390" y2="0">
              <stop offset="0" stopColor="#63D60A" stopOpacity="0" />
              <stop offset="0.55" stopColor="#63D60A" stopOpacity="0.9" />
              <stop offset="1" stopColor="#FFFFFF" />
            </linearGradient>
            <linearGradient id="preBody" x1="0" y1="-1" x2="0" y2="1">
              <stop offset="0" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#CFEFC0" />
            </linearGradient>
          </defs>

          {/* Faint planned route */}
          <path className="preloader__route-path" d="M14 112 C 110 -14, 290 -14, 386 112" pathLength="100" />
          {/* Glowing trail that draws behind the plane */}
          <path className="preloader__trail preloader__trail--glow" d="M14 112 C 110 -14, 290 -14, 386 112" pathLength="100" stroke="url(#preTrail)" />
          <path className="preloader__trail" d="M14 112 C 110 -14, 290 -14, 386 112" pathLength="100" stroke="url(#preTrail)" />

          {/* Origin dot and destination pin */}
          <circle className="preloader__origin" cx="14" cy="112" r="3.2" />
          <g className="preloader__pin" transform="translate(386 112)">
            <circle className="preloader__ripple" r="4" />
            <circle className="preloader__ripple preloader__ripple--2" r="4" />
            <circle className="preloader__pin-dot" r="3.6" />
          </g>

          {/* Vapour puffs left in the plane's wake */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <circle key={i} className="preloader__puff" r="3" style={{ '--d': `${0.35 + (i + 1) * 0.1}s` }} />
          ))}

          {/* The plane: soft shadow underneath, banking body on top */}
          <g className="preloader__plane">
            <g className="preloader__shadow" transform="translate(5 9)">
              <path d="M17 0 C17 -2.2 12 -2.6 6 -2.6 L-14 -1.6 L-17 -1 L-17 1 L-14 1.6 L6 2.6 C12 2.6 17 2.2 17 0Z M5 -2 L-5 -17 L-9 -17 L-4 -2Z M5 2 L-5 17 L-9 17 L-4 2Z" />
            </g>
            <g className="preloader__bank">
              {/* wings */}
              <path d="M5 -2 L-5 -17.5 L-9.5 -17.5 L-4.5 -2Z" fill="url(#preBody)" />
              <path d="M5 2 L-5 17.5 L-9.5 17.5 L-4.5 2Z" fill="url(#preBody)" />
              {/* tailplanes */}
              <path d="M-12 -1.3 L-17 -7.5 L-20 -7.5 L-16.5 -1.1Z" fill="url(#preBody)" />
              <path d="M-12 1.3 L-17 7.5 L-20 7.5 L-16.5 1.1Z" fill="url(#preBody)" />
              {/* engines */}
              <ellipse cx="-1.5" cy="-10" rx="3.2" ry="1.5" fill="#E6F7DC" />
              <ellipse cx="-1.5" cy="10" rx="3.2" ry="1.5" fill="#E6F7DC" />
              {/* fuselage */}
              <path d="M18 0 C18 -2.3 12.5 -2.8 6 -2.8 L-14 -1.7 L-18 -1 L-18 1 L-14 1.7 L6 2.8 C12.5 2.8 18 2.3 18 0Z" fill="url(#preBody)" />
              {/* lime livery stripe + cockpit */}
              <path d="M10 -2.5 L-15 -1.5 L-15 1.5 L10 2.5Z" fill="#63D60A" opacity="0.85" />
              <path d="M16.5 0 C16.5 -1.2 14.5 -1.6 13 -1.5 L13 1.5 C14.5 1.6 16.5 1.2 16.5 0Z" fill="#0D3B40" />
            </g>
          </g>
        </svg>

        {/* Logo — wipes in from the left */}
        <div className="preloader__logo-wrap">
          <img className="preloader__logo" src={brandMark} alt="Carvaan Holidays" />
        </div>

        <p className="preloader__tagline">Travel the way <em>you imagine</em></p>

        <div className="preloader__progress">
          <div className="preloader__bar"><span className="preloader__bar-fill" /></div>
          <span className="preloader__pct">{String(pct).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  )
}
