import './Packages.css'

const packages = [
  {
    id: 1,
    title: 'Bali Special',
    image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=700&q=80',
    duration: '7N / 8D',
    highlights: ['Airport Transfers', '4-Star Hotels', 'Daily Breakfast', 'Temple Tours', 'Rice Terrace Walk'],
    price: '₹45,000',
    perPerson: true,
    rating: 4.9,
    reviews: 248,
    badge: 'Best Seller',
  },
  {
    id: 2,
    title: 'Maldives Luxury',
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=700&q=80',
    duration: '5N / 6D',
    highlights: ['Overwater Villa', 'All Meals', 'Snorkelling', 'Sunset Cruise', 'Seaplane Transfer'],
    price: '₹85,000',
    perPerson: true,
    rating: 5.0,
    reviews: 132,
    badge: 'Luxury',
  },
  {
    id: 3,
    title: 'Europe Explorer',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=700&q=80',
    duration: '12N / 13D',
    highlights: ['6 Countries', 'Guided Tours', 'Euro Rail Pass', '3-Star Hotels', 'Visa Assistance'],
    price: '₹1,20,000',
    perPerson: true,
    rating: 4.8,
    reviews: 94,
    badge: 'Multi-Country',
  },
  {
    id: 4,
    title: 'Golden Triangle',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=700&q=80',
    duration: '6N / 7D',
    highlights: ['Delhi · Agra · Jaipur', 'Heritage Hotels', 'Taj Mahal Visit', 'Camel Ride', 'Cultural Shows'],
    price: '₹28,000',
    perPerson: true,
    rating: 4.7,
    reviews: 310,
    badge: 'Heritage',
  },
]

export default function Packages() {
  return (
    <section className="packages" id="packages">
      <div className="packages__container">
        <div className="packages__header">
          <div>
            <span className="section-tag">Curated for you</span>
            <h2 className="section-title">Our Holiday Packages</h2>
            <p className="section-subtitle">
              Everything planned — all you need to do is pack your bags
            </p>
          </div>
          <a href="#" className="view-all-btn">
            All Packages
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </a>
        </div>

        <div className="packages__grid">
          {packages.map(pkg => (
            <div key={pkg.id} className="pkg-card">
              <div className="pkg-card__img-wrap">
                <img src={pkg.image} alt={pkg.title} className="pkg-card__img" />
                <span className="pkg-card__badge">{pkg.badge}</span>
                <span className="pkg-card__duration">{pkg.duration}</span>
              </div>

              <div className="pkg-card__body">
                <h3 className="pkg-card__title">{pkg.title}</h3>

                <div className="pkg-card__rating">
                  <span className="pkg-card__stars">
                    {'★'.repeat(Math.floor(pkg.rating))}
                  </span>
                  <span className="pkg-card__rating-val">{pkg.rating}</span>
                  <span className="pkg-card__reviews">({pkg.reviews} reviews)</span>
                </div>

                <ul className="pkg-card__highlights">
                  {pkg.highlights.slice(0, 4).map((h, i) => (
                    <li key={i}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="pkg-card__footer">
                  <div className="pkg-card__price-block">
                    <span className="pkg-card__per">per person</span>
                    <span className="pkg-card__price">{pkg.price}</span>
                  </div>
                  <button className="pkg-card__btn">Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
