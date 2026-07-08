import LegalPage from './LegalPage'
import { COMPANY } from '../config/legal'

const sections = [
  {
    heading: 'Acceptance of terms',
    body: (
      <p>
        By accessing or using <strong>carvaanholidays.com</strong> ("the Website")
        and any related services offered by {COMPANY.legalName} ("we", "us",
        "our"), you agree to be bound by these Terms and Conditions. If you do
        not agree, please do not use the Website or book any services.
      </p>
    ),
  },
  {
    heading: 'About our services',
    body: (
      <p>
        We are a travel agency offering pre-packaged holidays, custom tours,
        group tours, car rentals, and related travel services across India and
        international destinations. All bookings are subject to availability
        and confirmation by our team.
      </p>
    ),
  },
  {
    heading: 'Bookings and payments',
    body: (
      <>
        <ul>
          <li>All bookings are considered confirmed only after receipt of the applicable advance / full payment and issuance of a written confirmation (email or WhatsApp) by our team.</li>
          <li>Prices displayed on the Website are indicative and can change without notice due to seasonality, currency movement, or supplier revisions. The final price will be shared in your booking confirmation.</li>
          <li>Payments accepted: UPI, credit / debit cards, net banking, and bank transfer through our authorised payment gateway partners.</li>
          <li>Any bank / gateway charges applicable at the time of the transaction are borne by the customer.</li>
        </ul>
      </>
    ),
  },
  {
    heading: 'Traveller responsibilities',
    body: (
      <ul>
        <li>Providing accurate personal details (name as per government ID, passport, contact) at the time of booking.</li>
        <li>Ensuring passport / visa validity, vaccinations, and any other travel documents required for the destination.</li>
        <li>Adhering to the itinerary, hotel and transport rules, and local laws during travel.</li>
        <li>Any additional costs due to loss of documents, deviation from the itinerary, or personal expenses are borne by the traveller.</li>
      </ul>
    ),
  },
  {
    heading: 'Modifications and cancellations',
    body: (
      <p>
        Booking modifications and cancellations are governed by our{' '}
        <a href="/refund-cancellation">Refund &amp; Cancellation Policy</a>.
        Please read it carefully before making a payment. Cancellation charges
        depend on how close the request is to the departure date and on the
        supplier's (hotel / airline / transporter) own policies.
      </p>
    ),
  },
  {
    heading: 'Limitation of liability',
    body: (
      <p>
        {COMPANY.legalName} acts as an intermediary between the customer and
        third-party service providers (hotels, airlines, transport operators,
        guides). We are not liable for any loss, injury, damage, delay, or
        additional expense caused by force majeure events, government actions,
        weather, road closures, medical emergencies, or the acts / omissions of
        third-party suppliers. Travel insurance is strongly recommended.
      </p>
    ),
  },
  {
    heading: 'Intellectual property',
    body: (
      <p>
        All content on the Website — including brand marks, text, photographs,
        video, and layout — is the property of {COMPANY.legalName} or its
        licensors and is protected by copyright and trademark laws. It may not
        be copied, reproduced, or used for any commercial purpose without
        written permission.
      </p>
    ),
  },
  {
    heading: 'Governing law and jurisdiction',
    body: (
      <p>
        These Terms are governed by the laws of India. Any disputes arising out
        of or in connection with the use of the Website or services shall be
        subject to the exclusive jurisdiction of the courts at {COMPANY.jurisdiction}.
      </p>
    ),
  },
  {
    heading: 'Contact us',
    body: (
      <div className="legal__callout">
        <strong>{COMPANY.legalName}</strong>
        <p>
          {COMPANY.address}<br />
          Phone: <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a> · Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
      </div>
    ),
  },
]

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={<>Terms &amp; <em>Conditions</em></>}
      updated={COMPANY.policiesUpdated}
      sections={sections}
    />
  )
}
