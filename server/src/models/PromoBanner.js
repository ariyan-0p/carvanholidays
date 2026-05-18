import mongoose from 'mongoose'

// Slots correspond to fixed positions on the homepage.
// Add more keys here as needed.
export const BANNER_SLOTS = [
  'after-destinations', // Between Popular Destinations and Featured Holiday Packages
  'before-region',      // Just before "Explore by Region"
]

const promoBannerSchema = new mongoose.Schema(
  {
    slot:            { type: String, enum: BANNER_SLOTS, required: true, index: true },
    title:           { type: String, default: '', trim: true }, // used as alt and admin label
    imageUrl:        { type: String, required: true, trim: true },
    mobileImageUrl:  { type: String, default: '', trim: true }, // optional taller crop for phones
    link:            { type: String, default: '', trim: true },
    openInNewTab:    { type: Boolean, default: false },
    order:           { type: Number, default: 0, index: true },
    active:          { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.model('PromoBanner', promoBannerSchema)
