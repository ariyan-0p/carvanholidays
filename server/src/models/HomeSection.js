import mongoose from 'mongoose'

const homeSectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true, trim: true },
    label: { type: String, default: '' },     // short admin name
    tag: { type: String, default: '' },       // green badge above title
    title: { type: String, default: '' },     // big heading
    subtitle: { type: String, default: '' },  // gray sub-line
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.model('HomeSection', homeSectionSchema)
