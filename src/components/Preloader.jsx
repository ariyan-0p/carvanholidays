import { useEffect, useState } from 'react'
import brandMark from '../assets/brand-mark.png'
import './Preloader.css'

const MIN_DURATION = 3400 // ms — minimum time the preloader is visible
const MAX_DURATION = 5200 // ms — hard cap

// x = horizontal position (%), s = size (vmin), t = travel time (s), d = delay (s)
const CLOUDS = [
  { x: 8,  s: 34, t: 2.1, d: 0.2 }, { x: 86, s: 40, t: 2.4, d: 0.5 },
  { x: 24, s: 26, t: 1.9, d: 0.9 }, { x: 70, s: 30, t: 2.0, d: 1.1 },
  { x: 50, s: 22, t: 1.8, d: 0.4 }, { x: 94, s: 24, t: 1.9, d: 1.6 },
  { x: 4,  s: 28, t: 2.0, d: 1.5 },
]

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
    <div className={`preloader ${exiting ? 'preloader--exit' : ''}`} role="status" aria-label="Loading Carvaan Holidays">
      <div className="preloader__glow" />

      {/* Clouds rush downward to sell the speed of the climb */}
      <div className="preloader__clouds" aria-hidden="true">
        {CLOUDS.map((c, i) => (
          <span key={i} className="preloader__cloud" style={{ '--x': c.x, '--s': c.s, '--t': c.t, '--d': c.d }} />
        ))}
      </div>

      {/* Brand block — revealed in the plane's wake */}
      <div className="preloader__stage">
        <div className="preloader__logo-wrap">
          <img className="preloader__logo" src={brandMark} alt="Carvaan Holidays" />
        </div>
        <p className="preloader__tagline">Travel the way <em>you imagine</em></p>
      </div>

      {/* Airliner flying bottom -> top */}
      <div className="preloader__flight" aria-hidden="true">
        <div className="preloader__sway">
          <span className="preloader__contrail preloader__contrail--l" />
          <span className="preloader__contrail preloader__contrail--r" />
          <span className="preloader__contrail preloader__contrail--tip-l" />
          <span className="preloader__contrail preloader__contrail--tip-r" />

          <svg className="preloader__plane" viewBox="0 0 200 215" fill="none">
            <defs>
              <linearGradient id="plFuse" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#B5C6C4" />
                <stop offset="0.35" stopColor="#FFFFFF" />
                <stop offset="0.65" stopColor="#F2F7F4" />
                <stop offset="1" stopColor="#A9BCBA" />
              </linearGradient>
              <linearGradient id="plWing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#AFC2C0" />
              </linearGradient>
              <linearGradient id="plNac" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#9DB1AF" />
                <stop offset="0.5" stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#9DB1AF" />
              </linearGradient>
              <g id="plHalf">
                {/* main wing */}
                <path d="M111 84 L189 139 Q192 141 191 145 L190 150 L184 152 L111 123 Z" fill="url(#plWing)" />
                {/* flap / aileron panel lines */}
                <path d="M118 112 L180 142 M118 100 L170 135" stroke="rgba(13,59,64,0.16)" strokeWidth="0.8" />
                {/* winglet */}
                <path d="M189 139 L196 126 L197 128 L191 146 Z" fill="#63D60A" />
                {/* tailplane */}
                <path d="M111 172 L142 196 Q144 198 143 201 L111 193 Z" fill="url(#plWing)" />
                {/* engine nacelle */}
                <rect x="131" y="97" width="16" height="38" rx="8" fill="url(#plNac)" />
                <ellipse cx="139" cy="100" rx="6.4" ry="2.8" fill="#0D3B40" />
                <ellipse cx="139" cy="100" rx="6.4" ry="2.8" stroke="#63D60A" strokeWidth="1.2" />
                <path d="M139 106 L139 130" stroke="rgba(13,59,64,0.18)" strokeWidth="0.8" />
              </g>
            </defs>

            {/* wings, engines, tailplanes — right half, then mirrored */}
            <use href="#plHalf" />
            <use href="#plHalf" transform="translate(200 0) scale(-1 1)" />

            {/* fuselage */}
            <path
              d="M100 5 C108 5 111 21 111 40 L111 168 C111 183 107 197 103 207 L97 207 C93 197 89 183 89 168 L89 40 C89 21 92 5 100 5Z"
              fill="url(#plFuse)"
            />
            {/* lime livery stripes + tail fin spine */}
            <path d="M89 52 L89 150 L92 150 L92 52Z M111 52 L111 150 L108 150 L108 52Z" fill="#63D60A" opacity="0.9" />
            <rect x="98.8" y="150" width="2.4" height="52" rx="1.2" fill="#63D60A" />
            {/* cockpit glass */}
            <path d="M93.5 21 Q100 15.5 106.5 21 L105.5 28 Q100 25 94.5 28Z" fill="#0D3B40" />
            <path d="M95 22 Q100 18.5 105 22" stroke="rgba(255,255,255,0.55)" strokeWidth="0.9" strokeLinecap="round" />
            {/* passenger window rows */}
            <g fill="#0D3B40" opacity="0.5">
              {Array.from({ length: 16 }).map((_, i) => (
                <g key={i}>
                  <rect x="93.2" y={38 + i * 7.4} width="1.6" height="2.6" rx="0.8" />
                  <rect x="105.2" y={38 + i * 7.4} width="1.6" height="2.6" rx="0.8" />
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
