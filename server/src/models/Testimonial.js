import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['video', 'photo', 'message'], required: true, index: true },
    name: { type: String, required: true, trim: true },
    quote: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true },
    trip: { type: String, default: '', trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    mediaUrl: { type: String, default: '' },
    posterUrl: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.model('Testimonial', testimonialSchema)
