import LegalPage from './LegalPage'
import { COMPANY } from '../config/legal'

const sections = [
  {
    heading: 'How a booking works',
    body: `We're a travel agency, so the "product" you buy is a service — a holiday, group tour, or car rental — delivered on the dates in your itinerary. Here's exactly what happens from the moment you enquire to the moment you return.`,
  },
  {
    heading: 'The booking journey',
    body: (
      <ol className="legal__steps">
        <li>
          <h4>Enquiry</h4>
          <p>Submit an enquiry through the website form, WhatsApp, or a call. Share your destination, dates, group size, and preferences. No payment is required at this stage.</p>
        </li>
        <li>
          <h4>Custom quote</h4>
          <p>Within 4 business hours our travel expert shares a written itinerary and quote (email or WhatsApp) — inclusions, exclusions, hotel category, transport, and total price in INR.</p>
        </li>
        <li>
          <h4>Advance payment &amp; confirmation</h4>
          <p>Once you approve the quote, we send a secure payment link (UPI / card / net banking) for the applicable advance — typically 25 – 50 % of the total, depending on how close the travel dates are. On successful payment we email you a booking confirmation with your unique booking reference.</p>
        </li>
        <li>
          <h4>Balance payment</h4>
          <p>The remaining balance is due 15 days before departure. We send an automated reminder. Peak-season or last-minute bookings may require 100 % upfront — this will always be flagged before you make the first payment.</p>
        </li>
        <li>
          <h4>Vouchers &amp; travel pack</h4>
          <p>3 – 5 days before departure we email you hotel vouchers, transport pickup details, a detailed day-wise itinerary, and your dedicated on-trip coordinator's phone number.</p>
        </li>
        <li>
          <h4>On-trip support</h4>
          <p>Our coordinator is reachable 24 × 7 during your trip for any changes, emergencies, or questions.</p>
        </li>
        <li>
          <h4>Post-trip</h4>
          <p>We share a feedback form and your GST-compliant tax invoice within 3 business days of return. We're always around for follow-up trips.</p>
        </li>
      </ol>
    ),
  },
  {
    heading: 'Payment methods',
    body: (
      <ul>
        <li>UPI (Google Pay, PhonePe, Paytm, BHIM, etc.)</li>
        <li>Credit / debit cards (Visa, Mastercard, RuPay, Amex)</li>
        <li>Net banking — all major Indian banks</li>
        <li>Bank transfer (NEFT / RTGS / IMPS) for large bookings</li>
      </ul>
    ),
  },
  {
    heading: 'Payment security',
    body: `All online payments are processed through PCI-DSS certified payment gateway partners over HTTPS. ${COMPANY.legalName} does not store your full card details, CVV, or bank credentials on its servers. You will see the payment gateway's page for the actual transaction.`,
  },
  {
    heading: 'Service delivery timelines',
    body: (
      <ul>
        <li><strong>Enquiry response:</strong> within 4 business hours.</li>
        <li><strong>Booking confirmation:</strong> within 24 hours of receiving your advance payment.</li>
        <li><strong>Travel documents / vouchers:</strong> 3 – 5 days before your departure date.</li>
        <li><strong>Service delivery:</strong> on the exact travel dates confirmed in your itinerary.</li>
        <li><strong>Tax invoice:</strong> within 3 business days of return.</li>
      </ul>
    ),
  },
  {
    heading: 'What if a service fails?',
    body: (
      <p>
        If any service booked through us is not delivered as promised, reach out
        immediately during the trip (call your coordinator) or within 7 days of
        return (email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>). We
        will investigate with the supplier and, where a shortfall is
        established, either provide a suitable alternative or refund the value
        of the missed service per our{' '}
        <a href="/refund-cancellation">Refund &amp; Cancellation Policy</a>.
      </p>
    ),
  },
  {
    heading: 'Contact us',
    body: (
      <div className="legal__callout">
        <strong>Booking support</strong>
        <p>
          {COMPANY.legalName}<br />
          {COMPANY.address}<br />
          Phone: <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a> · Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
      </div>
    ),
  },
]

export default function TransactionFlow() {
  return (
    <LegalPage
      eyebrow="Booking process"
      title={<>Transaction &amp; <em>Service Delivery</em> Flow</>}
      updated={COMPANY.policiesUpdated}
      sections={sections}
    />
  )
}
