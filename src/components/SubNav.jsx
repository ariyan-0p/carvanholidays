import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './SubNav.css'

const items = [
  {
    icon: '👥', label: 'Group Tours', to: '/packages',
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
    icon: '🏷️', label: 'Holiday Deals', to: '/packages',
    children: [
      { label: 'Beach Deals', to: '/packages?category=beach' },
      { label: 'Honeymoon Deals', to: '/packages?category=honeymoon' },
      { label: 'Luxury Escapes', to: '/packages?category=luxury' },
      { label: 'Heritage Tours', to: '/packages?category=heritage' },
      { label: 'View all deals', to: '/packages', emphasis: true },
    ],
  },
  {
    icon: '🧳', label: 'Travel Styles', to: '/packages',
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
    icon: '🎒', label: 'Upcoming Tours', to: '/packages',
  },
  {
    icon: '🏖️', label: 'Weekend Getaways', to: '/cities',
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
    icon: '🌍', label: 'Customised Trips', to: '/contact',
  },
  {
    icon: 'ℹ️', label: 'More about us', to: '/about',
    children: [
      { label: 'About Carvaan', to: '/about' },
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

  return (
    <div className="subnav" ref={ref}>
      <div className="subnav__inner">
        <ul className="subnav__list">
          {items.map((it, idx) => {
            const hasChildren = Array.isArray(it.children) && it.children.length > 0
            const open = openIdx === idx

            return (
              <li
                key={it.label}
                className={`subnav__li ${hasChildren ? 'has-children' : ''} ${open ? 'is-open' : ''}`}
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
                    <svg className="subnav__chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
