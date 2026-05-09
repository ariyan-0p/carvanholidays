import mongoose from 'mongoose'

const popupConfigSchema = new mongoose.Schema(
  {
    // We keep a single config document; the `singleton` field is the natural key.
    singleton: { type: String, default: 'main', unique: true },

    // Banner panel (left side)
    bannerUrl: { type: String, default: '' },
    bannerHeading: { type: String, default: 'Up to 30% off' },
    bannerSubheading: { type: String, default: 'On hand-picked holiday packages this season' },
    bannerOverlayColor: { type: String, default: '#08434A' },

    // Form panel (right side)
    tag: { type: String, default: 'Limited-time offer' },
    title: { type: String, default: 'Get up to 30% off on your next holiday' },
    subtitle: { type: String, default: "Tell us a few quick details and our travel expert will share a custom quote — free, no obligation." },
    successTitle: { type: String, default: 'Thanks for your enquiry!' },
    successMessage: { type: String, default: "We'll call you within 4 business hours with the best deals." },
    cta: { type: String, default: 'Get my custom quote' },
    legal: { type: String, default: "By submitting, you consent to be contacted by Carvaan Holidays. We'll never share your details." },

    // Behaviour
    intervalSeconds: { type: Number, default: 45 },
    active: { type: Boolean, default: true },
    showAfterSubmit: { type: Boolean, default: false },

    // Field toggles — admin can hide fields the right panel doesn't need
    fields: {
      destination: { type: Boolean, default: true },
      travelDate: { type: Boolean, default: true },
      travellers: { type: Boolean, default: true },
      tripType: { type: Boolean, default: true },
      budget: { type: Boolean, default: true },
      name: { type: Boolean, default: true },
      phone: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      message: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
)

export default mongoose.model('PopupConfig', popupConfigSchema)
