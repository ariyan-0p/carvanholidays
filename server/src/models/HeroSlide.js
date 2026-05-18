import mongoose from 'mongoose'

const heroSlideSchema = new mongoose.Schema(
  {
    kind:        { type: String, enum: ['image', 'video'], default: 'image' },
    mediaUrl:    { type: String, required: true, trim: true },
    posterUrl:   { type: String, default: '', trim: true }, // poster for video, used as fallback bg before video loads
    label:       { type: String, default: '', trim: true },
    destination: { type: String, default: '', trim: true },
    subtitle:    { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    price:       { type: String, default: '', trim: true },
    duration:    { type: String, default: '', trim: true },
    slug:        { type: String, default: '', trim: true }, // for "Explore" CTA -> /packages/:slug
    ctaText:     { type: String, default: 'Explore', trim: true },
    cards:       { type: [String], default: [] }, // up to 3 side images
    order:       { type: Number, default: 0, index: true },
    active:      { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.model('HeroSlide', heroSlideSchema)
