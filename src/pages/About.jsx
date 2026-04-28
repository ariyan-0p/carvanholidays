import './pages.css'

export default function About() {
  return (
    <div className="page">
      <div className="page__hero">
        <div className="page__hero-inner">
          <span className="section-tag">Our story</span>
          <h1 className="page__title">About Carvaan Holidays</h1>
          <p className="page__subtitle">Crafting unforgettable journeys, one trip at a time.</p>
        </div>
      </div>

      <div className="page__body about">
        <section className="about__intro">
          <h2>Who we are</h2>
          <p>
            Carvaan Holidays is a travel partner built on a simple promise — every trip should feel personal.
            From Bali beaches to Rajasthan forts to Swiss glaciers, we curate experiences that go beyond
            sightseeing. Our team has 15+ years of combined experience designing holidays for honeymooners,
            families, friends and solo explorers.
          </p>
        </section>

        <div className="about__stats">
          <div><strong>40+</strong><span>Holiday Packages</span></div>
          <div><strong>10K+</strong><span>Happy Travellers</span></div>
          <div><strong>25+</strong><span>Countries Covered</span></div>
          <div><strong>4.9★</strong><span>Average Rating</span></div>
        </div>

        <section className="about__values">
          <h2>What we stand for</h2>
          <div className="about__values-grid">
            <div>
              <h3>Hand-picked itineraries</h3>
              <p>Every package is built and tested by our team — no copy-paste tours.</p>
            </div>
            <div>
              <h3>Transparent pricing</h3>
              <p>What you see is what you pay. No hidden fees, no last-minute surprises.</p>
            </div>
            <div>
              <h3>Real human support</h3>
              <p>24×7 on-trip assistance from our travel experts — not a chatbot.</p>
            </div>
            <div>
              <h3>Local partnerships</h3>
              <p>We work with vetted local guides and hoteliers for authentic experiences.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
