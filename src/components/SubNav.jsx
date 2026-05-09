import { Link } from 'react-router-dom'
import './SubNav.css'

const items = [
  { icon: '👥', label: 'Group Tours', to: '/packages' },
  { icon: '🏷️', label: 'Holiday Deals', to: '/packages' },
  { icon: '🧳', label: 'Travel Styles', to: '/cities' },
  { icon: '🎒', label: 'Upcoming Tours', to: '/packages' },
  { icon: '🏖️', label: 'Weekend Getaways', to: '/packages' },
  { icon: '🌍', label: 'Customised Trips', to: '/contact' },
  { icon: 'ℹ️', label: 'About Us', to: '/about' },
]

export default function SubNav() {
  return (
    <div className="subnav">
      <div className="subnav__inner">
        <ul className="subnav__list">
          {items.map((it) => (
            <li key={it.label}>
              <Link to={it.to} className="subnav__item">
                <span className="subnav__icon" aria-hidden="true">{it.icon}</span>
                <span className="subnav__label">{it.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
