import LegalPage from './LegalPage'
import { COMPANY } from '../config/legal'

const sections = [
  {
    heading: 'Overview',
    body: `We understand travel plans can change. This policy explains when and how much you'll be refunded if you cancel or amend a booking with ${COMPANY.legalName}. Because we resell services from hotels, airlines, and other suppliers, cancellation charges depend on how close to departure the change is requested and on the supplier's own rules.`,
  },
  {
    heading: 'How to cancel',
    body: (
      <ul>
        <li>Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or WhatsApp <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a> with your booking reference and reason for cancellation.</li>
        <li>Cancellation is effective from the date and time we acknowledge your written request — not from the date of a phone conversation.</li>
        <li>Refunds are processed to the original payment source (card / UPI / bank account).</li>
      </ul>
    ),
  },
  {
    heading: 'Standard cancellation charges',
    body: (
      <>
        <p>Unless the specific package states otherwise, the following cancellation charges apply on the total booking value:</p>
        <table className="legal__table">
          <thead>
            <tr><th>Days before departure</th><th>Cancellation charge</th></tr>
          </thead>
          <tbody>
            <tr><td>45 days or more</td><td>10 % of booking value</td></tr>
            <tr><td>30 – 44 days</td><td>25 % of booking value</td></tr>
            <tr><td>15 – 29 days</td><td>50 % of booking value</td></tr>
            <tr><td>7 – 14 days</td><td>75 % of booking value</td></tr>
            <tr><td>Less than 7 days / no-show</td><td>100 % of booking value</td></tr>
          </tbody>
        </table>
        <p>
          <strong>Peak-season, festival, and special-departure packages</strong> (e.g. New Year, Christmas,
          Ladakh season, Andaman peak, honeymoon specials) may have stricter cancellation terms — these
          will always be shared with you in writing before you make the payment.
        </p>
      </>
    ),
  },
  {
    heading: 'Non-refundable components',
    body: (
      <p>
        Certain components are typically <strong>non-refundable</strong> once
        booked because the supplier does not refund us either — for example
        confirmed flight tickets, visa fees, travel insurance premiums, and
        prepaid experiences (permits, safaris, adventure activities). These
        will be clearly marked in your itinerary / invoice.
      </p>
    ),
  },
  {
    heading: 'Refund timelines',
    body: (
      <ul>
        <li>Once approved, refunds are initiated from our end within <strong>3 – 5 business days</strong>.</li>
        <li>Depending on your bank and payment method, it typically takes <strong>5 – 10 business days</strong> more for the amount to reflect in your account.</li>
        <li>International card refunds may take up to <strong>14 business days</strong>.</li>
        <li>We share the ARN (Acquirer Reference Number) once we initiate the refund so you can track it with your bank.</li>
      </ul>
    ),
  },
  {
    heading: 'Amendments (date / traveller changes)',
    body: (
      <p>
        Requests to change dates or traveller names are treated as a
        modification, not a cancellation, and are subject to the supplier's
        rebooking rules and any fare / rate differences. Where the supplier
        allows a free change, we pass the change on to you at no cost. Where a
        charge applies, we share the exact amount before we make the change.
      </p>
    ),
  },
  {
    heading: 'Cancellations by Carvaan Holidays',
    body: 'In the rare event that we have to cancel or materially change a departure — because of force majeure, government advisories, insufficient group numbers, or supplier failure — you will be offered either (a) a full refund of what we can recover, or (b) an alternative departure of equivalent value. We are not liable for consequential losses (e.g. flight tickets you booked separately).',
  },
  {
    heading: 'Force majeure',
    body: 'Cancellations caused by force majeure events — natural disasters, epidemics, government-issued travel bans, war, or civil unrest — are governed by the underlying supplier\'s cancellation policy. We will pass on any refunds we receive from suppliers, less an administrative fee equal to our reasonable non-recoverable costs.',
  },
  {
    heading: 'Complaints and grievance redressal',
    body: (
      <p>
        If you're not happy with how a cancellation was handled, write to{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with your booking
        reference. We aim to acknowledge within 48 hours and resolve within 15
        working days. For further escalation, please contact us at the address
        below.
      </p>
    ),
  },
  {
    heading: 'Contact us',
    body: (
      <div className="legal__callout">
        <strong>Refunds &amp; cancellations</strong>
        <p>
          {COMPANY.legalName}<br />
          {COMPANY.address}<br />
          Phone: <a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a> · Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </p>
      </div>
    ),
  },
]

export default function RefundCancellation() {
  return (
    <LegalPage
      eyebrow="Legal"
      title={<>Refund &amp; <em>Cancellation</em> Policy</>}
      updated={COMPANY.policiesUpdated}
      sections={sections}
    />
  )
}
