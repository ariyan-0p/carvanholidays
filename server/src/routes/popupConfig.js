import { Router } from 'express'
import PopupConfig from '../models/PopupConfig.js'
import { dbReady } from '../store.js'

const router = Router()

// GET /api/popup-config (public) — returns the single config doc, or null if none yet
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json(null)
    const cfg = await PopupConfig.findOne({ singleton: 'main' }).lean()
    res.json(cfg || null)
  } catch (e) { next(e) }
})

export default router
