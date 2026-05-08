import { Router } from 'express'
import Enquiry from '../models/Enquiry.js'
import { dbReady } from '../store.js'

const router = Router()

// POST /api/enquiries  (public)
router.post('/', async (req, res, next) => {
  try {
    const { type, from, destination, packageSlug, packageTitle, travelDate, travellers, name, email, phone, message, source } = req.body || {}
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email and phone are required.' })
    }
    if (!dbReady()) return res.status(503).json({ error: 'Service temporarily unavailable.' })
    const created = await Enquiry.create({
      type, from, destination, packageSlug, packageTitle,
      travelDate: travelDate || undefined,
      travellers, name, email, phone, message, source,
    })
    res.status(201).json({ ok: true, id: created._id })
  } catch (e) {
    next(e)
  }
})

export default router
