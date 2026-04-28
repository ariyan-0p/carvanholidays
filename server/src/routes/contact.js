import { Router } from 'express'
import Contact from '../models/Contact.js'
import { dbReady, memCreateContact } from '../store.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' })
    }
    if (!dbReady()) {
      return res.status(201).json(memCreateContact(req.body))
    }
    const created = await Contact.create(req.body)
    res.status(201).json(created)
  } catch (e) {
    next(e)
  }
})

export default router
