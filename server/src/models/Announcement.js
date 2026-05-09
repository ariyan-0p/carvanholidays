import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    link: { type: String, default: '', trim: true },
    bgColor: { type: String, default: '#12B84A' },
    textColor: { type: String, default: '#ffffff' },
    animation: { type: String, default: 'marquee', enum: ['marquee', 'static', 'pulse'] },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.model('Announcement', announcementSchema)
