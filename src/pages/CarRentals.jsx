import SearchBar from '../components/SearchBar'
import './CarRentals.css'

const features = [
  {
    title: '24/7 Driver Support',
    desc: 'Trained chauffeurs, on-call assistance, and instant replacements wherever the road takes you.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v2"/><path d="M4 12H2M22 12h-2"/><circle cx="12" cy="12" r="9"/><path d="M8 14a4 4 0 0 0 8 0"/><circle cx="9" cy="10" r="0.6"/><circle cx="15" cy="10" r="0.6"/>
      </svg>
    ),
  },
  {
    title: 'Wide Fleet',
    desc: 'Hatchbacks, sedans, SUVs, premium MPVs and tempo travellers — pick what fits your group.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 14l1.6-4.6A3 3 0 0 1 7.4 7.5h9.2a3 3 0 0 1 2.8 1.9L21 14"/><rect x="3" y="14" width="18" height="5" rx="1.4"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/>
      </svg>
    ),
  },
  {
    title: 'Pan-India Pickup',
    desc: 'Airport, station, hotel or your doorstep — we cover all major cities and tourist destinations.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.6"/>
      </svg>
    ),
  },
  {
    title: 'Transparent Pricing',
    desc: 'Per-km and per-day rates with no surprise fees. Toll, parking and driver allowance disclosed up-front.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M14 9.5c-.7-1-2.3-1-3.5-.5s-1.5 2 .5 2.5l2 .5c2 .5 1.7 2 .5 2.5s-2.8.5-3.5-.5"/><path d="M12 7v1.5M12 15.5V17"/>
      </svg>
    ),
  },
]

const fleet = [
  { name: 'Hatchback', seats: '4 + driver', good: 'City runs, airport drops', priceFrom: '₹12/km' },
  { name: 'Sedan', seats: '4 + driver', good: 'Business travel, weekends', priceFrom: '₹14/km' },
  { name: 'SUV', seats: '6 + driver', good: 'Hill stations, family trips', priceFrom: '₹18/km' },
  { name: 'Premium SUV', seats: '6 + driver', good: 'Long-distance comfort', priceFrom: '₹22/km' },
  { name: 'Tempo Traveller', seats: '11 + driver', good: 'Group tours, large families', priceFrom: '₹28/km' },
  { name: 'Luxury / Innova Crysta', seats: '6 + driver', good: 'VIP transfers, weddings', priceFrom: '₹26/km' },
]

export default function CarRentals() {
  return (
    <div className="page">
      <section className="cars__hero">
        <div className="cars__hero-inner">
          <span className="section-tag">On-the-road</span>
          <h1>Carvaan Car Rentals</h1>
          <p>Outstation cabs, local rides, airport transfers and full-day rentals across India — booked through one team that's been arranging holidays for thousands of travellers.</p>
        </div>
      </section>

      <SearchBar defaultTab="Cars" />

      <section className="cars__features">
        <div className="cars__container">
          <h2 className="section-title">Why book with Carvaan</h2>
          <div className="cars__features-grid">
            {features.map((f) => (
              <div key={f.title} className="cars__feature">
                <span className="cars__feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cars__fleet">
        <div className="cars__container">
          <div className="cars__fleet-head">
            <h2 className="section-title">Our fleet</h2>
            <p className="section-subtitle">Indicative starting rates — final quote depends on route and dates.</p>
          </div>

          <div className="cars__fleet-grid">
            {fleet.map((c) => (
              <div key={c.name} className="cars__fleet-card">
                <h3>{c.name}</h3>
                <div className="cars__fleet-meta">
                  <span>{c.seats}</span>
                  <span>·</span>
                  <span>{c.good}</span>
                </div>
                <div className="cars__fleet-price">
                  <span className="cars__fleet-from">From</span>
                  <strong>{c.priceFrom}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
