import crypto from 'crypto'
import mongoose from 'mongoose'

const daySchema = new mongoose.Schema(
  {
    day: Number,
    title: String,
    description: String,
    // Optional editorial split. When any is filled the PDF renders the day as
    // Morning / Afternoon / Evening instead of a single paragraph.
    morning: String,
    afternoon: String,
    evening: String,
    attractions: String, // "Major attractions" line
    note: String, // e.g. weather / permit note
    location: String, // where the day happens, e.g. "Leh -> Nubra Valley"
    meals: [String], // any of: breakfast, lunch, dinner
    stay: String, // overnight hotel / camp
    activities: [String], // transfers + things to do, one per line
    image: String,
  },
  { _id: false }
)

const hotelOptionSchema = new mongoose.Schema(
  {
    name: String,
    stars: Number,
    location: String,
    roomType: String,
    mealPlan: String,
    nights: Number,
    rating: String, // e.g. "8.3 Very good"
    description: String,
    images: [String], // up to 5, shown as a photo mosaic
    facilities: [String],
    price: Number, // total for this option
    notes: String,
  },
  { _id: false }
)

const flightSchema = new mongoose.Schema(
  { sector: String, airline: String, flightNo: String, depart: String, arrive: String, baggage: String, note: String },
  { _id: false }
)

const reviewSchema = new mongoose.Schema({ name: String, rating: Number, text: String }, { _id: false })
const slabSchema = new mongoose.Schema({ window: String, charge: String }, { _id: false })
const carrySchema = new mongoose.Schema({ group: String, items: [String] }, { _id: false })

// A customer-facing itinerary / quote. Created in the admin dashboard,
// downloaded as a branded PDF, optionally shared via a private link.
const itinerarySchema = new mongoose.Schema(
  {
    ref: { type: String, unique: true, index: true },
    shareToken: { type: String, unique: true, index: true },
    status: { type: String, enum: ['draft', 'sent', 'confirmed'], default: 'draft', index: true },
    isTemplate: { type: Boolean, default: false, index: true }, // reusable starting point
    templateName: String,

    template: { type: String, default: 'signature' },
    theme: { type: String, default: 'teal' }, // teal | sand | midnight
    sections: { type: mongoose.Schema.Types.Mixed, default: {} }, // { welcome: true, hotels: false, ... }

    title: { type: String, required: true, trim: true },
    tagline: String,
    destination: String,
    country: String,
    coverImage: String,
    sourcePackageSlug: String,

    customer: { name: String, phone: String, email: String },
    consultant: { name: String, phone: String, email: String, photo: String },
    welcome: { heading: String, body: String, signoff: String },
    travelDate: String, // free text or ISO date, printed as typed
    nights: Number,
    days: Number,
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 0 },
    rooms: { type: Number, default: 1 },

    overview: String,
    highlights: [String],
    itinerary: [daySchema],
    hotelOptions: [hotelOptionSchema],
    flights: [flightSchema],
    vehicle: { kind: String, pickup: String, drop: String, notes: String }, // kind = vehicle type, e.g. Tempo Traveller
    inclusions: [String],
    exclusions: [String],

    currency: { type: String, default: 'INR' },
    priceLines: [{ label: String, amount: Number, _id: false }],
    totalPrice: Number,
    perPerson: Number,
    priceNote: String,
    addons: [{ name: String, description: String, price: Number, _id: false }],
    batches: [{ label: String, note: String, _id: false }], // group-trip departure dates
    reviews: [reviewSchema],
    thingsToCarry: [carrySchema],
    keepInMind: [String],

    paymentTerms: String,
    cancellationSlabs: [slabSchema],
    cancellationPolicy: String, // free text fallback
    terms: String,
    notes: String,
    validUntil: String,
    bookBy: String, // "Join us by" deadline
  },
  { timestamps: true }
)

itinerarySchema.pre('validate', function (next) {
  if (!this.shareToken) this.shareToken = crypto.randomBytes(12).toString('hex')
  if (!this.ref) {
    const d = new Date()
    const yy = String(d.getFullYear()).slice(2)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    this.ref = `CH-${yy}${mm}${dd}-${crypto.randomInt(1000, 9999)}`
  }
  next()
})

export default mongoose.model('Itinerary', itinerarySchema)
