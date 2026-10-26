import mongoose from 'mongoose'

// Single document holding the company-wide defaults every itinerary PDF falls
// back to (contact details, bank/UPI, policies, reviews...). Edited once in the
// admin dashboard so nobody retypes them per quote.
const schema = new mongoose.Schema(
  {
    key: { type: String, default: 'itinerary', unique: true },

    company: {
      name: String,
      tagline: String,
      address: String,
      phone: String,
      altPhone: String,
      email: String,
      website: String,
      instagram: String,
      whatsapp: String,
      founderName: String,
      founderTitle: String,
    },
    bank: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
      accountType: String,
      bankName: String,
      upiId: String,
    },

    whyUs: String, // "Why travel with us" paragraph
    advancePercent: Number, // % of the total payable to confirm
    paymentTerms: String,
    cancellationSlabs: [{ window: String, charge: String, _id: false }],
    terms: String,
    reviews: [{ name: String, rating: Number, text: String, _id: false }],
    keepInMind: [String],
    thingsToCarry: [{ group: String, items: [String], _id: false }],
    closingTitle: String,
    closingMessage: String,
  },
  { timestamps: true }
)

export default mongoose.model('ItinerarySettings', schema)
