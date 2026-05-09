import { Router } from 'express'
import Partner from '../models/Partner.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/partners  (public)
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json([])
    const list = await Partner.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json(list)
  } catch (e) { next(e) }
})

export default router
