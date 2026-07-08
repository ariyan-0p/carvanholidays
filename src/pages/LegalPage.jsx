import { useReveal } from '../hooks/useReveal'
import './pages.css'
import './legal.css'

/**
 * Shared layout for legal / policy pages.
 * Pass `eyebrow`, `title`, `updated`, and structured `sections` (each with
 * `heading` and `body` — body can be a string, JSX, or an array).
 */
export default function LegalPage({ eyebrow, title, updated, sections }) {
  const [heroRef, heroVisible] = useReveal()

  return (
    <div className="legal">
      <header className="legal__hero">
        <div
          ref={heroRef}
          className={`legal__hero-inner reveal ${heroVisible ? 'is-visible' : ''}`}
        >
          <span className="section-tag legal__eyebrow">{eyebrow}</span>
          <h1 className="legal__title">{title}</h1>
          {updated && <p className="legal__updated">Last updated: {updated}</p>}
        </div>
      </header>

      <article className="legal__body">
        {sections.map((s, i) => (
          <section key={i} className="legal__section">
            <h2 className="legal__section-heading">{s.heading}</h2>
            <div className="legal__section-body">
              {typeof s.body === 'string' ? <p>{s.body}</p> : s.body}
            </div>
          </section>
        ))}
      </article>
    </div>
  )
}
