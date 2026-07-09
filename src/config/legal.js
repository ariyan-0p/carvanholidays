// Single source of truth for the company details used across all legal
// pages (Terms, Privacy, Refund & Cancellation, Transaction Flow) and the
// Contact page. Update this file with the exact legal / registered
// details as they appear on your payment gateway account.
export const COMPANY = {
  /**
   * The exact legal / registered name as filed with GST / MCA.
   * IMPORTANT: this must match the merchant name on your payment gateway
   * account. If your gateway account is under a proprietor's name or a
   * private-limited entity, put that exact string here.
   */
  legalName: 'Carvaan Holidays',

  /**
   * Full registered address — must match the address on your payment
   * gateway account and your GST certificate. Include state and PIN.
   * Use HTML line breaks via multiple JSX <br /> in components; for
   * plain-text usage the commas keep it readable.
   */
  address: 'Shop No. G-3, Plot No. 12, HDB Arcade, Dursanchar Nagar, Shahpura, Bhopal, Madhya Pradesh — 462026, India',

  /** GST registration number, once available. Leave blank if not yet. */
  gstin: '',

  /** CIN if you're a private limited company; blank for proprietor/LLP. */
  cin: '',

  /** Public contact channels (also shown in the footer and popup form). */
  phone: '+91 91319 78160',
  email: 'info@carvaanholidays.com',

  /** Jurisdiction city for legal disputes — usually where the business is registered. */
  jurisdiction: 'Bhopal, Madhya Pradesh',

  /** Bump this whenever any policy changes so users see the fresh date. */
  policiesUpdated: 'June 2026',
}
