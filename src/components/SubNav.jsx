import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './SubNav.css'

const I = (paths) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths}
  </svg>
)

const ICONS = {
  group: I(<><circle cx="9" cy="8" r="3.2" /><path d="M2 21c.5-3 3.2-5 7-5s6.5 2 7 5" /><circle cx="17" cy="9.5" r="2.5" /><path d="M22 19c-.3-2-1.6-3.4-3.5-4" /></>),
  fire: I(<><path d="M12 3c1.5 3 4 4.5 4 7.5a4 4 0 0 1-8 0c0-1 .4-1.8 1-2.5" /><path d="M9.5 14a3.5 3.5 0 1 0 5 0c-.7-.7-1.2-1.6-1.5-2.5-1 1-2.5 1-3.5 2.5z" /></>),
  sparkles: I(<><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" /></>),
  rocket: I(<><path d="M14 4c4 0 6 2 6 6-2 0-4 1-5 2l-7 7-3-3 7-7c1-1 2-3 2-5z" /><path d="M9 13l-2 2c-1 1-2 1-3 1l1-3c0-1 1-2 2-2l2 2z" /><circle cx="15" cy="9" r="1.4" /></>),
  beach: I(<><path d="M2 18h20" /><circle cx="7" cy="6" r="2" /><path d="M7 8v3" /><path d="M7 8c2.5-.5 5 0 7 2" /><path d="M7 8c-1.2 1-2 2.4-2.5 4" /><path d="M14 16c0-3 2-5 5-5" /></>),
  car: I(<><path d="M3 14l1.6-4.6A3 3 0 0 1 7.4 7.5h9.2a3 3 0 0 1 2.8 1.9L21 14" /><rect x="3" y="14" width="18" height="5" rx="1.4" /><circle cx="7.5" cy="19" r="1.5" /><circle cx="16.5" cy="19" r="1.5" /></>),
  target: I(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /></>),
  info: I(<><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v5h1" /></>),
}

const items = [
  {
    icon: ICONS.group, label: 'Group Tours', to: '/packages', color: '#2563eb',
    children: [
      { label: 'India Tours', to: '/packages?q=India' },
      { label: 'Europe Tours', to: '/packages?q=Europe' },
      { label: 'Maldives', to: '/packages?q=Maldives' },
      { label: 'Bhutan & Nepal', to: '/packages?q=Bhutan' },
      { label: 'Sri Lanka', to: '/packages?q=Sri+Lanka' },
      { label: 'View all packages', to: '/packages', emphasis: true },
    ],
  },
  {
    icon: ICONS.fire, label: 'Holiday Deals', to: '/packages', color: '#f59e0b',
    children: [
      { label: 'Beach Deals', to: '/packages?category=beach' },
      { label: 'Honeymoon Deals', to: '/packages?category=honeymoon' },
      { label: 'Luxury Escapes', to: '/packages?category=luxury' },
      { label: 'Heritage Tours', to: '/packages?category=heritage' },
      { label: 'View all deals', to: '/packages', emphasis: true },
    ],
  },
  {
    icon: ICONS.sparkles, label: 'Travel Styles', to: '/packages', color: '#8b5cf6',
    children: [
      { label: 'Honeymoon', to: '/packages?category=honeymoon' },
      { label: 'Family', to: '/packages?category=family' },
      { label: 'Adventure', to: '/packages?category=adventure' },
      { label: 'Beach & Leisure', to: '/packages?category=beach' },
      { label: 'Heritage', to: '/packages?category=heritage' },
      { label: 'Multi-Country', to: '/packages?category=multi-country' },
    ],
  },
  {
    icon: ICONS.rocket, label: 'Upcoming Tours', to: '/packages', color: '#10b981',
  },
  {
    icon: ICONS.car, label: 'Car Rentals', to: '/car-rentals', color: '#0ea5e9',
  },
  {
    icon: ICONS.beach, label: 'Weekend Getaways', to: '/cities', color: '#ec4899',
    children: [
      { label: 'Jaipur', to: '/cities/jaipur' },
      { label: 'Shimla', to: '/cities/shimla' },
      { label: 'Srinagar', to: '/cities/srinagar' },
      { label: 'Gangtok', to: '/cities/gangtok' },
      { label: 'Mysore', to: '/cities/mysore' },
      { label: 'View all destinations', to: '/cities', emphasis: true },
    ],
  },
  {
    icon: ICONS.target, label: 'Customised Trips', to: '/contact', color: '#14b8a6',
  },
  {
    icon: ICONS.info, label: 'More about us', to: '/about', color: '#475569',
    children: [
      { label: 'About Carvaan', to: '/about' },
      { label: 'Travel Blog', to: '/blog' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Browse Packages', to: '/packages' },
      { label: 'Destinations', to: '/cities' },
    ],
  },
]

export default function SubNav() {
  const [openIdx, setOpenIdx] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpenIdx(null)
    }
    const onKey = (e) => e.key === 'Escape' && setOpenIdx(null)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Expose the SubNav's rendered height as --subnav-h so layout-aware
  // sections (like the hero) can offset by exactly the right amount,
  // regardless of whether the responsive media query has hidden the bar.
  useEffect(() => {
    const el = ref.current
    const update = () => {
      const h = el && getComputedStyle(el).display !== 'none' ? el.offsetHeight : 0
      document.documentElement.style.setProperty('--subnav-h', `${h}px`)
    }
    update()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    if (ro && el) ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('resize', update)
      if (ro) ro.disconnect()
      document.documentElement.style.setProperty('--subnav-h', '0px')
    }
  }, [])

  return (
    <div className="subnav" ref={ref}>
      <div className="subnav__inner">
        <ul className="subnav__list">
          {items.map((it, idx) => {
            const hasChildren = Array.isArray(it.children) && it.children.length > 0
            const open = openIdx === idx
            const style = { '--accent': it.color }

            return (
              <li
                key={it.label}
                className={`subnav__li ${hasChildren ? 'has-children' : ''} ${open ? 'is-open' : ''}`}
                style={style}
                onMouseEnter={() => hasChildren && setOpenIdx(idx)}
                onMouseLeave={() => hasChildren && setOpenIdx(null)}
              >
                {hasChildren ? (
                  <button
                    type="button"
                    className="subnav__item subnav__item--toggle"
                    aria-expanded={open}
                    onClick={() => setOpenIdx(open ? null : idx)}
                  >
                    <span className="subnav__icon" aria-hidden="true">{it.icon}</span>
                    <span className="subnav__label">{it.label}</span>
                    <svg className="subnav__chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                ) : (
                  <Link to={it.to} className="subnav__item">
                    <span className="subnav__icon" aria-hidden="true">{it.icon}</span>
                    <span className="subnav__label">{it.label}</span>
                  </Link>
                )}

                {hasChildren && (
                  <div className="subnav__menu" role="menu">
                    <div className="subnav__menu-accent" />
                    {it.children.map((c) => (
                      <Link
                        key={c.label}
                        to={c.to}
                        className={`subnav__menu-item ${c.emphasis ? 'is-emphasis' : ''}`}
                        onClick={() => setOpenIdx(null)}
                        role="menuitem"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
