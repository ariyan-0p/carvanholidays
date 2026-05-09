import { Router } from 'express'
import HomeSection from '../models/HomeSection.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/home-sections (public) — returns all visible section overrides as
// a map keyed by section key. The frontend merges this on top of its defaults.
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json({})
    const list = await HomeSection.find({ visible: true }).lean()
    const map = {}
    for (const it of list) map[it.key] = it
    res.json(map)
  } catch (e) { next(e) }
})

export default router
