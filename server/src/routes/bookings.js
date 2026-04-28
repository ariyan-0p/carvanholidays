import { Router } from 'express'
import Booking from '../models/Booking.js'
import Package from '../models/Package.js'
import { dbReady, memCreateBooking, memListBookings, memFindPackage } from '../store.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { packageSlug, name, email, phone, travelDate, travellers, message } = req.body
    if (!packageSlug || !name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    if (!dbReady()) {
      const pkg = memFindPackage(packageSlug)
      const item = memCreateBooking({
        packageSlug, packageTitle: pkg?.title, name, email, phone, travelDate, travellers, message,
      })
      return res.status(201).json(item)
    }
    const pkg = await Package.findOne({ slug: packageSlug }).lean()
    const booking = await Booking.create({
      packageSlug, packageTitle: pkg?.title, name, email, phone, travelDate, travellers, message,
    })
    res.status(201).json(booking)
  } catch (e) {
    next(e)
  }
})

router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) return res.json(memListBookings())
    res.json(await Booking.find().sort({ createdAt: -1 }).lean())
  } catch (e) {
    next(e)
  }
})

export default router
