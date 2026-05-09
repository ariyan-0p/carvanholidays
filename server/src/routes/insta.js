import { Router } from 'express'
import InstaPost from '../models/InstaPost.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/insta  (public)
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json([])
    const list = await InstaPost.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean()
    res.json(list)
  } catch (e) { next(e) }
})

export default router
