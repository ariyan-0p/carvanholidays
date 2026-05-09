import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    coverUrl: { type: String, default: '' },
    excerpt: { type: String, default: '', trim: true },
    content: { type: String, default: '' },
    author: { type: String, default: 'Carvaan Team', trim: true },
    tags: { type: [String], default: [] },
    readTime: { type: String, default: '' },
    publishedAt: { type: Date, default: () => new Date() },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
)

export default mongoose.model('Blog', blogSchema)
