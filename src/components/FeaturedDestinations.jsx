import './FeaturedDestinations.css'
import { useReveal } from '../hooks/useReveal'

function DestCard({ dest, index }) {
  const [ref, visible] = useReveal({ delay: (index % 4) * 80 })
  return (
    <a
      href="#"
      ref={ref}
      className={`dest-card reveal reveal--scale ${visible ? 'is-visible' : ''}`}
    >
      <div className="dest-card__img-wrap">
        <img src={dest.image} alt={dest.name} className="dest-card__img" />
        <span className="dest-card__tag">{dest.tag}</span>
      </div>
      <div className="dest-card__body">
        <div>
          <h3 className="dest-card__name">{dest.name}</h3>
          <p className="dest-card__country">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor"/>
            </svg>
            {dest.country}
          </p>
        </div>
        <div className="dest-card__price">
          <span className="dest-card__from">from</span>
          <span className="dest-card__amount">{dest.from}</span>
        </div>
      </div>
    </a>
  )
}

const destinations = [
  {
    id: 1,
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    from: '₹45,000',
    tag: 'Most Popular',
  },
  {
    id: 2,
    name: 'Maldives',
    country: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80',
    from: '₹85,000',
    tag: 'Luxury',
  },
  {
    id: 3,
    name: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80',
    from: '₹55,000',
    tag: 'Trending',
  },
  {
    id: 4,
    name: 'Thailand',
    country: 'Thailand',
    image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=600&q=80',
    from: '₹38,000',
    tag: 'Best Value',
  },
  {
    id: 5,
    name: 'Goa',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    from: '₹18,000',
    tag: 'Weekend Getaway',
  },
  {
    id: 6,
    name: 'Kerala',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80',
    from: '₹22,000',
    tag: "God's Own Country",
  },
  {
    id: 7,
    name: 'Rajasthan',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    from: '₹25,000',
    tag: 'Heritage',
  },
  {
    id: 8,
    name: 'Ladakh',
    country: 'India',
    image: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?auto=format&fit=crop&w=600&q=80',
    from: '₹32,000',
    tag: 'Adventure',
  },
]

export default function FeaturedDestinations() {
  const [headerRef, headerVisible] = useReveal()
  return (
    <section className="destinations" id="destinations">
      <div className="destinations__container">
        <div
          ref={headerRef}
          className={`destinations__header reveal ${headerVisible ? 'is-visible' : ''}`}
        >
          <div>
            <span className="section-tag">Where to go?</span>
            <h2 className="section-title">Popular <em>Destinations</em></h2>
            <p className="section-subtitle">
              Handpicked destinations loved by thousands of happy travellers
            </p>
          </div>
          <a href="#" className="view-all-btn">
            View All
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </a>
        </div>

        <div className="destinations__grid">
          {destinations.map((dest, i) => (
            <DestCard key={dest.id} dest={dest} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
