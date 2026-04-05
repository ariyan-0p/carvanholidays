import './Testimonials.css'

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    trip: 'Bali, 7N/8D',
    rating: 5,
    text: 'Carvaan Holidays made our anniversary trip absolutely magical. Every detail was taken care of — from airport pickup to the romantic candlelit dinner they arranged as a surprise. Cannot recommend them enough!',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 2,
    name: 'Rahul Mehra',
    location: 'Delhi',
    trip: 'Europe Tour, 12N/13D',
    rating: 5,
    text: 'Covered 6 countries in 13 days without a single hiccup. Their team handled visas, hotels, and transfers seamlessly. The local guides were incredible — we saw places most tourists never find!',
    avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 3,
    name: 'Anjali Nair',
    location: 'Bangalore',
    trip: 'Kerala Backwaters, 5N/6D',
    rating: 5,
    text: 'The houseboat experience they arranged was beyond words. Waking up to the backwaters with a Kerala breakfast ready — pure bliss. Carvaan truly understands what travel should feel like.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
  },
  {
    id: 4,
    name: 'Vikram Patel',
    location: 'Ahmedabad',
    trip: 'Maldives, 5N/6D',
    rating: 5,
    text: 'First time travelling internationally and Carvaan made it stress-free from day one. The overwater villa was a dream. 24/7 support gave us so much confidence. Already planning our next trip with them!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="testimonials__container">
        <div className="testimonials__header">
          <span className="section-tag">Real Stories</span>
          <h2 className="section-title">What Our Travellers Say</h2>
          <p className="section-subtitle">
            50,000+ happy travellers and counting — here's what they have to say
          </p>
        </div>

        <div className="testimonials__grid">
          {testimonials.map(t => (
            <div key={t.id} className="review-card">
              {/* Stars */}
              <div className="review-card__stars">
                {'★'.repeat(t.rating)}
              </div>

              {/* Text */}
              <p className="review-card__text">"{t.text}"</p>

              {/* Reviewer */}
              <div className="review-card__reviewer">
                <img src={t.avatar} alt={t.name} className="review-card__avatar" />
                <div>
                  <span className="review-card__name">{t.name}</span>
                  <span className="review-card__meta">
                    {t.location} &bull; {t.trip}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google rating badge */}
        <div className="testimonials__badge">
          <span className="testimonials__badge-stars">★★★★★</span>
          <div>
            <span className="testimonials__badge-score">4.9 / 5</span>
            <span className="testimonials__badge-source">Based on 1,200+ Google Reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}
