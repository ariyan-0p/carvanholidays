import './AsFeaturedIn.css'

/**
 * Placeholder logos — replace each entry with a real <img src="..." /> later.
 * Each item: { name: string, variant: 'serif' | 'sans' | 'italic' | 'condensed' | 'mono' | 'script' | 'allcaps' }
 */
const logos = [
  { name: 'TRAVELER',          variant: 'allcaps' },
  { name: 'Vogue Voyage',      variant: 'serif' },
  { name: 'Wanderlust',        variant: 'script' },
  { name: 'Forbes',            variant: 'serif' },
  { name: 'CondéNast',         variant: 'serif' },
  { name: 'TIMES',             variant: 'serif' },
  { name: 'NatGeo',            variant: 'condensed' },
  { name: 'BBC Travel',        variant: 'sans' },
  { name: 'Lonely Planet',     variant: 'condensed' },
  { name: 'TripAdvisor',       variant: 'sans' },
  { name: 'Skyscanner',        variant: 'sans' },
  { name: 'Booking.com',       variant: 'sans' },
  { name: 'Travel + Leisure',  variant: 'serif' },
  { name: 'Outlook Traveller', variant: 'serif' },
  { name: 'Conde Nast Traveller', variant: 'condensed' },
  { name: 'Holiday IQ',        variant: 'sans' },
  { name: 'JetSet',            variant: 'italic' },
  { name: 'GQ India',          variant: 'allcaps' },
  { name: 'Mint Lounge',       variant: 'sans' },
  { name: 'The Hindu',         variant: 'serif' },
]

// Duplicate to make the marquee seamless
const looped = [...logos, ...logos]

export default function AsFeaturedIn() {
  return (
    <section className="featured-in" aria-label="As featured in">
      <div className="featured-in__container">
        <div className="featured-in__heading">
          <span className="featured-in__line" />
          <h3 className="featured-in__label">As featured in</h3>
          <span className="featured-in__line" />
        </div>

        <div className="featured-in__marquee" aria-hidden="true">
          <div className="featured-in__track">
            {looped.map((logo, i) => (
              <span key={i} className={`featured-in__logo featured-in__logo--${logo.variant}`}>
                {logo.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
