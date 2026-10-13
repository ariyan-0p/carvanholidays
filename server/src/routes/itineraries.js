import { Router } from 'express'
import Itinerary from '../models/Itinerary.js'
import { requireAdmin } from '../middleware/auth.js'
import { renderItineraryPdf } from '../services/itineraryPdf.js'
import { loadSettings, saveSettings } from '../services/itinerarySettings.js'
import { DEFAULT_SECTIONS, SECTION_LABELS } from '../config/itineraryDefaults.js'
import { dbReady } from '../store.js'

const needDb = (_req, res, next) =>
  dbReady() ? next() : res.status(503).json({ error: 'Database not connected' })

const safeName = (it) =>
  `${(it.title || 'itinerary').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${it.ref}`.slice(0, 90)

const sendPdf = async (res, it) => {
  const settings = await loadSettings()
  const buf = await renderItineraryPdf(it, settings)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `inline; filename="${safeName(it)}.pdf"`)
  res.setHeader('Content-Length', buf.length)
  res.send(buf)
}

const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/* ---------------- admin (mounted at /api/admin/itineraries) ---------------- */
export const adminItineraries = Router()
adminItineraries.use(requireAdmin, needDb)

// Company-wide defaults used by every PDF (bank, policies, reviews...)
adminItineraries.get('/settings/current', async (_req, res, next) => {
  try {
    res.json({ settings: await loadSettings(), sections: DEFAULT_SECTIONS, sectionLabels: SECTION_LABELS })
  } catch (e) { next(e) }
})
adminItineraries.put('/settings/current', async (req, res, next) => {
  try {
    await saveSettings(req.body)
    res.json({ settings: await loadSettings() })
  } catch (e) { next(e) }
})

adminItineraries.get('/', async (req, res, next) => {
  try {
    const { q, status, templates } = req.query
    const filter = {}
    if (templates === 'true') filter.isTemplate = true
    else if (templates === 'false') filter.isTemplate = { $ne: true }
    if (status) filter.status = status
    if (q) {
      const re = new RegExp(escapeRe(q), 'i')
      filter.$or = [{ title: re }, { ref: re }, { 'customer.name': re }, { destination: re }, { templateName: re }]
    }
    res.json(
      await Itinerary.find(filter)
        .select('ref shareToken status isTemplate templateName title destination country coverImage customer travelDate nights days totalPrice currency updatedAt createdAt')
        .sort({ updatedAt: -1 })
        .lean()
    )
  } catch (e) { next(e) }
})

adminItineraries.get('/:id', async (req, res, next) => {
  try {
    const it = await Itinerary.findById(req.params.id).lean()
    if (!it) return res.status(404).json({ error: 'Itinerary not found' })
    res.json(it)
  } catch (e) { next(e) }
})

// Never let the client set identity fields.
const clean = (body = {}) => {
  const { _id, ref, shareToken, createdAt, updatedAt, __v, ...rest } = body
  return rest
}

adminItineraries.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await Itinerary.create(clean(req.body)))
  } catch (e) { next(e) }
})

adminItineraries.put('/:id', async (req, res, next) => {
  try {
    const it = await Itinerary.findByIdAndUpdate(req.params.id, clean(req.body), {
      new: true,
      runValidators: true,
    })
    if (!it) return res.status(404).json({ error: 'Itinerary not found' })
    res.json(it)
  } catch (e) { next(e) }
})

// Duplicate an itinerary. With ?asTemplate=true the copy becomes a reusable
// template (customer details stripped).
adminItineraries.post('/:id/duplicate', async (req, res, next) => {
  try {
    const src = await Itinerary.findById(req.params.id).lean()
    if (!src) return res.status(404).json({ error: 'Itinerary not found' })
    const { _id, ref, shareToken, createdAt, updatedAt, __v, ...rest } = src
    const asTemplate = req.query.asTemplate === 'true'
    const copy = asTemplate
      ? { ...rest, isTemplate: true, templateName: rest.templateName || rest.title, status: 'draft', customer: {}, travelDate: '' }
      : { ...rest, isTemplate: false, status: 'draft', title: `${rest.title} (copy)` }
    res.status(201).json(await Itinerary.create(copy))
  } catch (e) { next(e) }
})

adminItineraries.delete('/:id', async (req, res, next) => {
  try {
    await Itinerary.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (e) { next(e) }
})

adminItineraries.get('/:id/pdf', async (req, res, next) => {
  try {
    const it = await Itinerary.findById(req.params.id).lean()
    if (!it) return res.status(404).json({ error: 'Itinerary not found' })
    await sendPdf(res, it)
  } catch (e) { next(e) }
})

/* ---------------- public share link (mounted at /api/itineraries) ---------------- */
export const publicItineraries = Router()

// GET /api/itineraries/share/:token/pdf  — unguessable link the team can send to customers
publicItineraries.get('/share/:token/pdf', needDb, async (req, res, next) => {
  try {
    const it = await Itinerary.findOne({ shareToken: req.params.token }).lean()
    if (!it) return res.status(404).json({ error: 'Link not found' })
    await sendPdf(res, it)
  } catch (e) { next(e) }
})
