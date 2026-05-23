import { Router } from 'express'
import SearchSection from '../models/SearchSection.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/search-section (public)
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json(null)
    const doc = await SearchSection.findOneAndUpdate(
      { singleton: 'main' },
      { $setOnInsert: { singleton: 'main' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean()
    res.json(doc)
  } catch (e) { next(e) }
})

export default router
