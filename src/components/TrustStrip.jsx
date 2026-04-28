import './TrustStrip.css'

const items = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L15 8.5L22 9.5L17 14.5L18.5 22L12 18.5L5.5 22L7 14.5L2 9.5L9 8.5L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    label: '4.9 / 5 Rating',
    sub: 'Across 10,000+ travellers',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 21V8L12 3L21 8V21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    label: '40+ Packages',
    sub: 'Across 25 countries',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    label: '24×7 Support',
    sub: 'Real humans, on call',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 22C12 22 4 16 4 10C4 6 7 3 12 3C17 3 20 6 20 10C20 16 12 22 12 22Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    label: 'Hand-picked Stays',
    sub: '4–5★ verified hotels',
  },
]

export default function TrustStrip() {
  return (
    <section className="trust-strip">
      <div className="trust-strip__inner">
        {items.map((it, i) => (
          <div key={i} className="trust-strip__item">
            <span className="trust-strip__icon">{it.icon}</span>
            <div>
              <div className="trust-strip__label">{it.label}</div>
              <div className="trust-strip__sub">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
