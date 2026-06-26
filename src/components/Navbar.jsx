import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logotransparent.PNG'
import './Navbar.css'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Destinations', to: '/cities' },
  { label: 'Packages', to: '/packages' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

const quickLinks = [
  { label: 'Group Tours',      to: '/packages',                 emoji: '👥' },
  { label: 'Holiday Deals',    to: '/packages',                 emoji: '🔥' },
  { label: 'Car Rentals',      to: '/car-rentals',              emoji: '🚗' },
  { label: 'Weekend Getaways', to: '/cities',                   emoji: '🏖️' },
]

const PHONE = '+919131978160'
const WHATSAPP = '919131978160'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Publish the navbar's rendered height as --nav-h so layout-aware
  // components (e.g. the hero) can offset by the exact pixel value,
  // automatically picking up the mobile breakpoint change.
  useEffect(() => {
    const el = navRef.current
    const update = () => {
      const h = el ? el.offsetHeight : 0
      document.documentElement.style.setProperty('--nav-h', `${h}px`)
    }
    update()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    if (ro && el) ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      if (ro) ro.disconnect()
    }
  }, [])

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <>
      <nav ref={navRef} className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
            <img src={logo} alt="Carvaan Holidays" />
          </Link>

          <ul className="navbar__links">
            {navLinks.map(link => (
              <li key={link.label}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <Link to="/packages" className="navbar__cta">Book Now</Link>

          <button
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* === Mobile slide-in drawer === */}
      <div
        className={`mnav ${menuOpen ? 'mnav--open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <aside
          className="mnav__panel"
          role="dialog"
          aria-label="Site navigation"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="mnav__head">
            <Link to="/" className="mnav__brand" onClick={() => setMenuOpen(false)}>
              <img src={logo} alt="Carvaan Holidays" />
            </Link>
            <button
              type="button"
              className="mnav__close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >×</button>
          </header>

          <nav className="mnav__nav">
            {navLinks.map((link, i) => (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/'}
                style={{ '--i': i }}
                className={({ isActive }) =>
                  `mnav__link ${isActive ? 'mnav__link--active' : ''}`
                }
              >
                <span>{link.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </NavLink>
            ))}
          </nav>

          <div className="mnav__quick">
            <span className="mnav__quick-label">Quick picks</span>
            <div className="mnav__quick-grid">
              {quickLinks.map((q, i) => (
                <Link
                  key={q.label}
                  to={q.to}
                  className="mnav__quick-tile"
                  style={{ '--i': i + navLinks.length }}
                >
                  <span className="mnav__quick-emoji" aria-hidden="true">{q.emoji}</span>
                  <span>{q.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mnav__cta-row">
            <a
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi! I want to plan a trip with Carvaan Holidays.')}`}
              target="_blank"
              rel="noreferrer"
              className="mnav__cta mnav__cta--wa"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.05 1.5 5.74L2 22l4.49-1.59a9.9 9.9 0 005.55 1.69h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0012.04 2zm0 18.18a8.27 8.27 0 01-4.21-1.15l-.3-.18-3.13 1.1 1.13-3.05-.2-.31a8.24 8.24 0 011.27-10.34 8.25 8.25 0 0111.66 0 8.25 8.25 0 010 11.66 8.21 8.21 0 01-6.22 2.27zm4.53-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.39.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.06s.89 2.39 1.01 2.55c.12.17 1.74 2.66 4.22 3.73.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z"/>
              </svg>
              WhatsApp
            </a>
            <a href={`tel:${PHONE}`} className="mnav__cta mnav__cta--call">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Call us
            </a>
          </div>

          <p className="mnav__footer">
            <strong>Carvaan Holidays</strong>
            <span>Travel the way you imagine.</span>
          </p>
        </aside>
      </div>
    </>
  )
}
