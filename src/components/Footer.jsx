import { Link } from 'react-router-dom'
import logo from '../assets/logotransparent.PNG'
import brandMark from '../assets/brand-mark-inverted.png'
import './Footer.css'

const footerLinks = {
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Our Story', to: '/about' },
    { label: 'Careers', to: '#' },
    { label: 'Blog', to: '/blog' },
  ],
  Destinations: [
    { label: 'Bali', to: '/packages?q=bali' },
    { label: 'Maldives', to: '/packages?q=maldives' },
    { label: 'Dubai', to: '/packages?q=dubai' },
    { label: 'Europe', to: '/packages?q=europe' },
    { label: 'Goa', to: '/packages?q=goa' },
    { label: 'Kerala', to: '/packages?q=kerala' },
  ],
  Services: [
    { label: 'Holiday Packages', to: '/packages' },
    { label: 'Car Rentals', to: '/car-rentals' },
    { label: 'Beach Holidays', to: '/packages?category=beach' },
    { label: 'Heritage Tours', to: '/packages?category=heritage' },
    { label: 'Luxury Escapes', to: '/packages?category=luxury' },
    { label: 'Honeymoon', to: '/packages?category=honeymoon' },
  ],
  Support: [
    { label: 'Contact Us', to: '/contact' },
    { label: 'FAQ', to: '#' },
    { label: 'Track Booking', to: '#' },
    { label: 'Cancellation Policy', to: '#' },
    { label: 'Terms & Privacy', to: '#' },
  ],
}

const socials = [
  {
    name: 'Instagram',
    href: 'https://instagram.com/carvaanholidays',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Twitter / X',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: '#',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" stroke="currentColor" strokeWidth="2"/>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <img src={brandMark} alt="" aria-hidden className="footer__watermark" />
      {/* Marquee ticker */}
      <div className="footer__ticker">
        <div className="footer__ticker-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="footer__ticker-item">
              ✈ discover your adventure
            </span>
          ))}
        </div>
      </div>

      <div className="footer__main">
        <div className="footer__inner">
          {/* Brand column */}
          <div className="footer__brand">
            <img src={logo} alt="Carvaan Holidays" className="footer__logo" />
            <p className="footer__tagline">Travel the Way You Imagine.</p>
            <p className="footer__desc">
              We handle the stress, you enjoy the rest. Let us craft your perfect holiday experience.
            </p>
            <div className="footer__contact">
              <a href="tel:+919131978160" className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.19 2 2 0 012 .01h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                +91 91319 78160
              </a>
              <a href="mailto:info@carvaanholidays.com" className="footer__contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                info@carvaanholidays.com
              </a>
            </div>
            <div className="footer__socials">
              {socials.map(s => (
                <a key={s.name} href={s.href} className="footer__social" aria-label={s.name} target="_blank" rel="noreferrer">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="footer__col">
              <h4 className="footer__col-heading">{heading}</h4>
              <ul className="footer__col-links">
                {links.map(link => (
                  <li key={link.label}>
                    {link.to.startsWith('/') ? (
                      <Link to={link.to} className="footer__link">{link.label}</Link>
                    ) : (
                      <a href={link.to} className="footer__link">{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner">
          <span>© {new Date().getFullYear()} Carvaan Holidays. All rights reserved.</span>
          <span className="footer__bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Sitemap</a>
          </span>
        </div>
        <div className="footer__credit">
          Powered by{' '}
          <a
            href="https://ariyan-0p.github.io/Ariyan-portlio/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__credit-link"
          >
            Ariyan Samal
          </a>
        </div>
      </div>
    </footer>
  )
}
