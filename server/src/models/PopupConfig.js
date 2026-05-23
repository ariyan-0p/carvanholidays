import mongoose from 'mongoose'

const popupConfigSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },

    // Banner panel (left side)
    bannerUrl: { type: String, default: '' },
    bannerHeading: { type: String, default: 'Up to 30% off' },
    bannerSubheading: { type: String, default: 'On hand-picked holiday packages this season' },
    bannerOverlayColor: { type: String, default: '#08434A' },

    // Form panel (right side)
    tag: { type: String, default: 'Limited-time offer' },
    title: { type: String, default: 'Plan Your Next Trip' },
    subtitle: { type: String, default: "Tell us a few quick details and our travel expert will share a custom quote — free, no obligation." },
    successTitle: { type: String, default: 'Thanks for your enquiry!' },
    successMessage: { type: String, default: "We'll call you within 4 business hours with the best deals." },
    cta: { type: String, default: "Let's Go" },
    legal: { type: String, default: "By submitting, you consent to be contacted by Carvaan Holidays. We'll never share your details." },

    // Phone country code (visible prefix on the phone field)
    countryCode: { type: String, default: '+91' },

    // Editable dropdown options (admin-managed)
    tripPreferenceOptions: {
      type: [String],
      default: [
        'Family Holiday',
        'Honeymoon',
        'Couple Getaway',
        'Adventure',
        'Beach & Leisure',
        'Pilgrimage',
        'Group / Friends',
      ],
    },
    destinationOptions: {
      type: [String],
      default: [
        'Bali', 'Maldives', 'Thailand', 'Dubai', 'Europe',
        'Goa', 'Kerala', 'Rajasthan', 'Ladakh', 'Andaman', 'Kashmir',
      ],
    },

    // Marketing consent
    marketingConsentLabel: {
      type: String,
      default: 'Keep me updated with offers, trips, and travel inspiration via email, SMS, and WhatsApp',
    },
    marketingConsentDefault: { type: Boolean, default: true },

    // Behaviour
    intervalSeconds: { type: Number, default: 45 },
    active: { type: Boolean, default: true },
    showAfterSubmit: { type: Boolean, default: false },

    // Field toggles — admin can hide fields the right panel doesn't need
    fields: {
      firstName:         { type: Boolean, default: true },
      lastName:          { type: Boolean, default: true },
      name:              { type: Boolean, default: false },  // legacy — single full-name field
      email:             { type: Boolean, default: true },
      phone:             { type: Boolean, default: true },
      tripPreference:    { type: Boolean, default: true },
      destination:       { type: Boolean, default: true },
      marketingConsent:  { type: Boolean, default: true },

      // Optional / off-by-default fields (admin can flip on)
      travelDate: { type: Boolean, default: false },
      travellers: { type: Boolean, default: false },
      tripType:   { type: Boolean, default: false },  // legacy — superseded by tripPreference
      budget:     { type: Boolean, default: false },
      message:    { type: Boolean, default: false },
    },
  },
  { timestamps: true }
)

export default mongoose.model('PopupConfig', popupConfigSchema)
