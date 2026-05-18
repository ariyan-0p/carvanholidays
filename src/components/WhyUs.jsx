import './WhyUs.css'
import { useReveal } from '../hooks/useReveal'
import { useCountUp } from '../hooks/useCountUp'

const stats = [
  { value: 50000, label: 'Happy Travellers', suffix: '+', format: 'k' },
  { value: 200,   label: 'Destinations',     suffix: '+' },
  { value: 15,    label: 'Years of Experience', suffix: '+' },
  { value: 4.9,   label: 'Average Rating',   suffix: '★', decimals: 1 },
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

function StatItem({ value, label, suffix, decimals, format }) {
  const [ref, n] = useCountUp(value, { duration: 2000, decimals: decimals || 0 })
  const display = format === 'k' && n >= 1000
    ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`
    : decimals
      ? n.toFixed(decimals)
      : n.toLocaleString('en-IN')
  return (
    <div ref={ref} className="whyus__stat">
      <span className="whyus__stat-value">{display}{suffix}</span>
      <span className="whyus__stat-label">{label}</span>
    </div>
  )
}

function FeatureCard({ icon, title, desc, index }) {
  const [ref, visible] = useReveal({ delay: index * 80 })
  return (
    <div
      ref={ref}
      className={`whyus__feature-card reveal reveal--scale ${visible ? 'is-visible' : ''}`}
    >
      <div className="whyus__feature-icon">{icon}</div>
      <h3 className="whyus__feature-title">{title}</h3>
      <p className="whyus__feature-desc">{desc}</p>
    </div>
  )
}

export default function WhyUs() {
  const [headerRef, headerVisible] = useReveal()
  return (
    <section className="whyus" id="about">
      {/* Stats banner */}
      <div className="whyus__stats">
        <div className="whyus__stats-inner">
          {stats.map((s, i) => (
            <StatItem key={i} {...s} />
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="whyus__features">
        <div className="whyus__features-inner">
          <div
            ref={headerRef}
            className={`whyus__features-header reveal ${headerVisible ? 'is-visible' : ''}`}
          >
            <span className="section-tag section-tag--light">Why Carvaan?</span>
            <h2 className="section-title section-title--light">
              We handle the stress.<br /><em>You enjoy the rest.</em>
            </h2>
            <p className="section-subtitle section-subtitle--light">
              From the moment you decide to travel until you're back home with amazing memories,<br />
              we've got every detail covered.
            </p>
          </div>

          <div className="whyus__grid">
            {features.map((f, i) => (
              <FeatureCard key={i} index={i} {...f} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
