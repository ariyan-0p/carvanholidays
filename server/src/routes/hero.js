import { Router } from 'express'
import HeroSlide from '../models/HeroSlide.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/hero  (public — only active slides, ordered)
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json([])
    const list = await HeroSlide.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json(list)
  } catch (e) { next(e) }
})

export default router
