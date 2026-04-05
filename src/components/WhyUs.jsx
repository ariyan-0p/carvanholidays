import './WhyUs.css'

const stats = [
  { value: '50,000+', label: 'Happy Travellers' },
  { value: '200+',    label: 'Destinations' },
  { value: '15+',     label: 'Years of Experience' },
  { value: '4.9★',   label: 'Average Rating' },
]

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Smart Planning',
    desc: 'Every itinerary is thoughtfully designed so you spend your time exploring, not figuring out logistics.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Best Price Guarantee',
    desc: 'We match or beat any comparable quote. Transparent pricing with zero hidden charges — ever.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: '24/7 Support',
    desc: 'Our travel experts are always reachable — before, during, and after your trip. You\'re never alone on the road.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Expert Local Guides',
    desc: 'Authentic experiences led by locals who know the hidden gems, the best food spots, and the real stories.',
  },
]

export default function WhyUs() {
  return (
    <section className="whyus" id="about">
      {/* Stats banner */}
      <div className="whyus__stats">
        <div className="whyus__stats-inner">
          {stats.map((s, i) => (
            <div key={i} className="whyus__stat">
              <span className="whyus__stat-value">{s.value}</span>
              <span className="whyus__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="whyus__features">
        <div className="whyus__features-inner">
          <div className="whyus__features-header">
            <span className="section-tag section-tag--light">Why Carvaan?</span>
            <h2 className="section-title section-title--light">
              We Handle the Stress.<br />You Enjoy the Rest.
            </h2>
            <p className="section-subtitle section-subtitle--light">
              From the moment you decide to travel until you're back home with amazing memories,<br />
              we've got every detail covered.
            </p>
          </div>

          <div className="whyus__grid">
            {features.map((f, i) => (
              <div key={i} className="whyus__feature-card">
                <div className="whyus__feature-icon">{f.icon}</div>
                <h3 className="whyus__feature-title">{f.title}</h3>
                <p className="whyus__feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
