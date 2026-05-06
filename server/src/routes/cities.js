import { Router } from 'express'
import Package from '../models/Package.js'
import { dbReady } from '../store.js'
import { packages as seedPackages } from '../data/packages.seed.js'

const router = Router()

const titleCase = (s) =>
  String(s).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

const summarize = (items) => {
  const map = new Map()
  for (const p of items) {
    if (!p.city) continue
    const key = p.city
    if (!map.has(key)) {
      map.set(key, {
        city: key,
        name: titleCase(key),
        country: p.country,
        image: p.image,
        count: 0,
        minPrice: Infinity,
      })
    }
    const c = map.get(key)
    c.count += 1
    if (typeof p.price === 'number' && p.price < c.minPrice) c.minPrice = p.price
  }
  return [...map.values()]
    .map(c => ({ ...c, minPrice: c.minPrice === Infinity ? null : c.minPrice }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

// GET /api/cities  → [{ city, name, country, image, count, minPrice }]
router.get('/', async (_req, res, next) => {
  try {
    if (!dbReady()) {
      return res.json(summarize(seedPackages.filter(p => p.active !== false)))
    }
    const items = await Package.find({ active: true }).lean()
    res.json(summarize(items))
  } catch (e) { next(e) }
})

// GET /api/cities/:city  → { city, name, country, image, packages: [...] }
router.get('/:city', async (req, res, next) => {
  try {
    const city = String(req.params.city).toLowerCase()
    let items
    if (!dbReady()) {
      items = seedPackages.filter(p => p.active !== false && p.city === city)
    } else {
      items = await Package.find({ active: true, city }).lean()
    }
    if (!items.length) return res.status(404).json({ error: 'City not found' })
    const first = items[0]
    res.json({
      city,
      name: titleCase(city),
      country: first.country,
      image: first.image,
      packages: items,
    })
  } catch (e) { next(e) }
})

export default router
