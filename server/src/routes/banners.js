import { Router } from 'express'
import PromoBanner from '../models/PromoBanner.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/banners       — all active banners across slots (grouped client-side)
// GET /api/banners?slot=X — only one slot
router.get('/', async (req, res, next) => {
  try {
    if (!dbReady()) return res.json([])
    const filter = { active: true }
    if (req.query.slot) filter.slot = String(req.query.slot)
    const list = await PromoBanner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json(list)
  } catch (e) { next(e) }
})

export default router
