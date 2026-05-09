import mongoose from 'mongoose'

const instaPostSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, default: '' },
    posterUrl: { type: String, default: '' },
    caption: { type: String, default: '', trim: true },
    instaUrl: { type: String, required: true, trim: true },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.model('InstaPost', instaPostSchema)
