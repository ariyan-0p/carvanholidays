import { Router } from 'express'
import Testimonial from '../models/Testimonial.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/testimonials  (public, only active)
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json([])
    const list = await Testimonial.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json(list)
  } catch (e) { next(e) }
})

export default router
