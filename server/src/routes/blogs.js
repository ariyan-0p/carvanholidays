import { Router } from 'express'
import Blog from '../models/Blog.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/blogs  (public, only active)
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json([])
    const list = await Blog.find({ active: true })
      .sort({ publishedAt: -1, createdAt: -1 })
      .select('-content')
      .lean()
    res.json(list)
  } catch (e) { next(e) }
})

// GET /api/blogs/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'Service unavailable' })
    const item = await Blog.findOne({ slug: req.params.slug.toLowerCase(), active: true }).lean()
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (e) { next(e) }
})

export default router
