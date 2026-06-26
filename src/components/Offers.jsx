import './Offers.css'

const offers = [
  {
    id: 1,
    title: 'Early Bird Special',
    subtitle: 'Book 60 days in advance',
    discount: '20% OFF',
    desc: 'Plan ahead and save big. Valid on all international holiday packages.',
    code: 'EARLYBIRD20',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80',
    expiry: 'Valid till 31 May 2026',
    color: '#0D3B40',
  },
  {
    id: 2,
    title: 'Monsoon Magic',
    subtitle: 'Domestic packages',
    discount: '15% OFF',
    desc: 'Embrace the rains! Special discounts on Kerala, Goa, and Coorg packages.',
    code: 'MONSOON15',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=900&q=80',
    expiry: 'Valid June – September 2026',
    color: '#0a5560',
  },
  {
    id: 3,
    title: 'Honeymoon Special',
    subtitle: 'Couple packages',
    discount: '₹5,000 OFF',
    desc: 'Celebrate love with a dreamy getaway. Complimentary romantic dinner included.',
    code: 'LOVE5K',
    image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80',
    expiry: 'No expiry',
    color: '#0D3B40',
  },
]

export default function Offers() {
  const copyCode = (code) => {
    navigator.clipboard?.writeText(code)
  }

  return (
    <section className="offers" id="offers">
      <div className="offers__container">
        <div className="offers__header">
          <span className="section-tag">Limited Time</span>
          <h2 className="section-title">Exclusive Deals</h2>
          <p className="section-subtitle">Grab these offers before they're gone</p>
        </div>

        <div className="offers__grid">
          {offers.map(offer => (
            <div
              key={offer.id}
              className="offer-card"
              style={{ '--offer-color': offer.color }}
            >
              <div className="offer-card__img-wrap">
                <img src={offer.image} alt={offer.title} className="offer-card__img" />
                <div className="offer-card__overlay" />
                <div className="offer-card__badge">{offer.discount}</div>
              </div>

              <div className="offer-card__body">
                <span className="offer-card__subtitle">{offer.subtitle}</span>
                <h3 className="offer-card__title">{offer.title}</h3>
                <p className="offer-card__desc">{offer.desc}</p>

                <div className="offer-card__code-row">
                  <div className="offer-card__code">
                    <span>USE CODE:</span>
                    <strong>{offer.code}</strong>
                  </div>
                  <button
                    className="offer-card__copy"
                    onClick={() => copyCode(offer.code)}
                    title="Copy code"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Copy
                  </button>
                </div>

                <span className="offer-card__expiry">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  {offer.expiry}
                </span>

                <button className="offer-card__btn">Grab This Deal</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
