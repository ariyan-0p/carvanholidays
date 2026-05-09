import { Router } from 'express'
import Contact from '../models/Contact.js'
import { dbReady, memCreateContact } from '../store.js'
import { sendContactEmail } from '../services/mailer.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { name, email, message } = req.body
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' })
    }
    let saved
    if (!dbReady()) {
      saved = memCreateContact(req.body)
    } else {
      saved = await Contact.create(req.body)
    }
    sendContactEmail(req.body)
      .catch((err) => console.error('[contact] email notify failed:', err?.message || err))
    res.status(201).json(saved)
  } catch (e) {
    next(e)
  }
})

export default router
