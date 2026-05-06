import mongoose from 'mongoose'

const itinerarySchema = new mongoose.Schema(
  {
    day: Number,
    title: String,
    description: String,
  },
  { _id: false }
)

const packageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    destination: String,
    city: { type: String, index: true, lowercase: true, trim: true },
    country: String,
    category: { type: String, index: true }, // beach, heritage, honeymoon, adventure, family, luxury
    duration: String, // "7N / 8D"
    nights: Number,
    days: Number,
    price: Number,
    totalPrice: Number,
    pax: Number,
    currency: { type: String, default: 'INR' },
    perPerson: { type: Boolean, default: true },
    hotels: [String],
    image: String,
    gallery: [String],
    badge: String, // "Best Seller", "Luxury", etc
    rating: { type: Number, default: 4.8 },
    reviews: { type: Number, default: 0 },
    summary: String,
    description: String,
    highlights: [String],
    inclusions: [String],
    exclusions: [String],
    itinerary: [itinerarySchema],
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('Package', packageSchema)
