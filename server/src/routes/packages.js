import { Router } from 'express'
import Package from '../models/Package.js'
import { requireAdmin } from '../middleware/auth.js'
import { dbReady, memFindPackages, memFindPackage } from '../store.js'

const router = Router()

// GET /api/packages?category=beach&featured=true&q=bali&city=jaipur&section=top-picks&limit=20
router.get('/', async (req, res, next) => {
  try {
    const { category, featured, q, city, section, limit } = req.query
    if (!dbReady()) {
      return res.json(memFindPackages({ category, featured, q, city, limit }))
    }
    const filter = { active: true }
    if (category) filter.category = category
    if (featured === 'true') filter.featured = true
    if (city) filter.city = String(city).toLowerCase()
    if (q) {
      const re = new RegExp(q, 'i')
      filter.$or = [{ title: re }, { destination: re }, { country: re }, { city: re }, { summary: re }]
    }
    if (section) {
      // Honour the legacy `featured: true` flag for the 'featured' shelf so we
      // don't break what's already on the homepage.
      if (section === 'featured') {
        filter.$or = [{ homepageSections: section }, { featured: true }]
      } else {
        filter.homepageSections = section
      }
    }
    const sortKey = section
      ? { homepageOrder: 1, featured: -1, createdAt: -1 }
      : { featured: -1, createdAt: -1 }
    const query = Package.find(filter).sort(sortKey)
    if (limit) query.limit(Number(limit))
    res.json(await query.lean())
  } catch (e) {
    next(e)
  }
})

// GET /api/packages/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    if (!dbReady()) {
      const pkg = memFindPackage(req.params.slug)
      if (!pkg) return res.status(404).json({ error: 'Package not found' })
      return res.json(pkg)
    }
    const pkg = await Package.findOne({ slug: req.params.slug, active: true }).lean()
    if (!pkg) return res.status(404).json({ error: 'Package not found' })
    res.json(pkg)
  } catch (e) {
    next(e)
  }
})

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected — admin writes disabled' })
    const created = await Package.create(req.body)
    res.status(201).json(created)
  } catch (e) {
    next(e)
  }
})

router.put('/:slug', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await Package.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Package not found' })
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

router.delete('/:slug', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await Package.findOneAndUpdate({ slug: req.params.slug }, { active: false }, { new: true })
    if (!updated) return res.status(404).json({ error: 'Package not found' })
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export default router
