import mongoose from 'mongoose'

const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logoUrl: { type: String, required: true },
    link: { type: String, default: '', trim: true },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.model('Partner', partnerSchema)
