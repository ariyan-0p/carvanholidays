import { Router } from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { signAdminToken, requireAdmin } from '../middleware/auth.js'
import Package from '../models/Package.js'
import Enquiry from '../models/Enquiry.js'
import Testimonial from '../models/Testimonial.js'
import Announcement from '../models/Announcement.js'
import InstaPost from '../models/InstaPost.js'
import Partner from '../models/Partner.js'
import Blog from '../models/Blog.js'
import HomeSection from '../models/HomeSection.js'
import PopupConfig from '../models/PopupConfig.js'
import HeroSlide from '../models/HeroSlide.js'
import PromoBanner, { BANNER_SLOTS } from '../models/PromoBanner.js'
import { dbReady } from '../store.js'

const router = Router()

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@carvanholidays.local').toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(ADMIN_PASSWORD, 10)

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body || {}
  if (email.toLowerCase() !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  res.json({ token: signAdminToken(), email: ADMIN_EMAIL })
})

// GET /api/admin/me
router.get('/me', requireAdmin, (req, res) => res.json({ email: ADMIN_EMAIL }))

// ---------- Uploads ----------
const uploadsDir = path.resolve(process.cwd(), 'uploads', 'packages')
fs.mkdirSync(uploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safe = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 40)
    cb(null, `${Date.now()}-${safe}${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error('Only image uploads allowed'))
    cb(null, true)
  },
})

// POST /api/admin/upload  (form field: "files", up to 10)
router.post('/upload', requireAdmin, upload.array('files', 10), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/packages/${f.filename}`)
  res.json({ urls })
})

// ---------- Media uploads (images + videos, e.g. testimonials) ----------
const mediaDir = path.resolve(process.cwd(), 'uploads', 'testimonials')
fs.mkdirSync(mediaDir, { recursive: true })

const mediaStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, mediaDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safe = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 40)
    cb(null, `${Date.now()}-${safe}${ext}`)
  },
})
const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: 80 * 1024 * 1024 }, // 80MB to comfortably allow short clips
  fileFilter: (_req, file, cb) => {
    if (!/^(image|video)\//.test(file.mimetype)) return cb(new Error('Only image or video files allowed'))
    cb(null, true)
  },
})

// POST /api/admin/media  (form field: "files", up to 5 images or videos)
router.post('/media', requireAdmin, mediaUpload.array('files', 5), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/testimonials/${f.filename}`)
  res.json({ urls })
})

// ---------- Hero media uploads (bigger size cap for video) ----------
const heroDir = path.resolve(process.cwd(), 'uploads', 'hero')
fs.mkdirSync(heroDir, { recursive: true })

const heroStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, heroDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safe = path.basename(file.originalname, ext).replace(/[^a-z0-9-_]/gi, '-').slice(0, 40)
    cb(null, `${Date.now()}-${safe}${ext}`)
  },
})
const heroUpload = multer({
  storage: heroStorage,
  limits: { fileSize: 80 * 1024 * 1024 }, // 80MB — comfortable for short MP4
  fileFilter: (_req, file, cb) => {
    if (!/^(image|video)\//.test(file.mimetype)) return cb(new Error('Only image or video files allowed'))
    cb(null, true)
  },
})

// POST /api/admin/hero-upload  (form field: "files")
router.post('/hero-upload', requireAdmin, heroUpload.array('files', 5), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/hero/${f.filename}`)
  res.json({ urls })
})

// ---------- Admin Hero Slides CRUD ----------
router.get('/hero', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await HeroSlide.find().sort({ order: 1, createdAt: -1 }).lean()
    res.json(list)
  } catch (e) { next(e) }
})

router.post('/hero', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    if (!req.body?.mediaUrl) return res.status(400).json({ error: 'Media file is required' })
    const created = await HeroSlide.create(req.body)
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.put('/hero/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await HeroSlide.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/hero/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const r = await HeroSlide.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// ---------- Admin Promo Banners CRUD ----------
router.get('/banners', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await PromoBanner.find().sort({ slot: 1, order: 1, createdAt: -1 }).lean()
    res.json(list)
  } catch (e) { next(e) }
})

router.post('/banners', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    if (!req.body?.imageUrl) return res.status(400).json({ error: 'Banner image is required' })
    if (!req.body?.slot || !BANNER_SLOTS.includes(req.body.slot)) {
      return res.status(400).json({ error: 'Invalid slot' })
    }
    const created = await PromoBanner.create(req.body)
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.put('/banners/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await PromoBanner.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/banners/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const r = await PromoBanner.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// ---------- Admin Testimonials CRUD ----------
router.get('/testimonials', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await Testimonial.find().sort({ order: 1, createdAt: -1 }).lean()
    res.json(list)
  } catch (e) { next(e) }
})

router.post('/testimonials', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const { kind, name } = req.body || {}
    if (!['video', 'photo', 'message'].includes(kind)) return res.status(400).json({ error: 'Invalid kind' })
    if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name is required' })
    const created = await Testimonial.create(req.body)
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.put('/testimonials/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/testimonials/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const r = await Testimonial.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// ---------- Admin Announcements CRUD ----------
router.get('/announcements', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await Announcement.find().sort({ order: 1, createdAt: -1 }).lean()
    res.json(list)
  } catch (e) { next(e) }
})

router.post('/announcements', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    if (!req.body?.text || !String(req.body.text).trim()) return res.status(400).json({ error: 'Text is required' })
    const created = await Announcement.create(req.body)
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.put('/announcements/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/announcements/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const r = await Announcement.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// ---------- Admin Instagram posts CRUD ----------
router.get('/insta', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await InstaPost.find().sort({ order: 1, createdAt: -1 }).lean()
    res.json(list)
  } catch (e) { next(e) }
})

router.post('/insta', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    if (!req.body?.instaUrl || !String(req.body.instaUrl).trim()) {
      return res.status(400).json({ error: 'Instagram URL is required' })
    }
    const created = await InstaPost.create(req.body)
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.put('/insta/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await InstaPost.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/insta/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const r = await InstaPost.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// ---------- Admin Official Partners CRUD ----------
router.get('/partners', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await Partner.find().sort({ order: 1, createdAt: -1 }).lean()
    res.json(list)
  } catch (e) { next(e) }
})

router.post('/partners', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    if (!req.body?.name || !String(req.body.name).trim()) return res.status(400).json({ error: 'Name is required' })
    if (!req.body?.logoUrl) return res.status(400).json({ error: 'Logo is required' })
    const created = await Partner.create(req.body)
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.put('/partners/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) { next(e) }
})

router.delete('/partners/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const r = await Partner.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// ---------- Admin Blogs CRUD ----------
router.get('/blogs', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await Blog.find().sort({ publishedAt: -1, createdAt: -1 }).select('-content').lean()
    res.json(list)
  } catch (e) { next(e) }
})

router.get('/blogs/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const item = await Blog.findById(req.params.id).lean()
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (e) { next(e) }
})

router.post('/blogs', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const data = { ...req.body }
    if (!data.title || !String(data.title).trim()) return res.status(400).json({ error: 'Title is required' })
    if (!data.slug && data.title) data.slug = slugify(data.title)
    if (data.slug) data.slug = slugify(data.slug)
    if (Array.isArray(data.tags)) data.tags = data.tags.map(t => String(t).trim()).filter(Boolean)
    const created = await Blog.create(data)
    res.status(201).json(created)
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'A blog with that slug already exists' })
    next(e)
  }
})

router.put('/blogs/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const data = { ...req.body }
    if (data.slug) data.slug = slugify(data.slug)
    if (Array.isArray(data.tags)) data.tags = data.tags.map(t => String(t).trim()).filter(Boolean)
    const updated = await Blog.findByIdAndUpdate(req.params.id, data, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) {
    if (e?.code === 11000) return res.status(409).json({ error: 'A blog with that slug already exists' })
    next(e)
  }
})

router.delete('/blogs/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const r = await Blog.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

// ---------- Admin Home Section overrides ----------
router.get('/home-sections', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await HomeSection.find().lean()
    const map = {}
    for (const it of list) map[it.key] = it
    res.json(map)
  } catch (e) { next(e) }
})

// ---------- Popup form config ----------
router.get('/popup-config', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const cfg = await PopupConfig.findOneAndUpdate(
      { singleton: 'main' },
      { $setOnInsert: { singleton: 'main' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.json(cfg)
  } catch (e) { next(e) }
})

router.put('/popup-config', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const { _id, singleton, createdAt, updatedAt, ...patch } = req.body || {}
    const updated = await PopupConfig.findOneAndUpdate(
      { singleton: 'main' },
      { $set: { ...patch, singleton: 'main' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.json(updated)
  } catch (e) { next(e) }
})

// PUT /api/admin/home-sections/:key — upsert override for a known section key
router.put('/home-sections/:key', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const key = String(req.params.key || '').trim()
    if (!key) return res.status(400).json({ error: 'Section key required' })
    const updated = await HomeSection.findOneAndUpdate(
      { key },
      { $set: { ...req.body, key } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.json(updated)
  } catch (e) { next(e) }
})

// ---------- Admin Package CRUD ----------
const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// GET /api/admin/packages — includes inactive
router.get('/packages', requireAdmin, async (_req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const list = await Package.find().sort({ createdAt: -1 }).lean()
    res.json(list)
  } catch (e) { next(e) }
})

router.post('/packages', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const data = { ...req.body }
    if (!data.slug && data.title) data.slug = slugify(data.title)
    if (data.city) data.city = String(data.city).toLowerCase().trim()
    const created = await Package.create(data)
    res.status(201).json(created)
  } catch (e) { next(e) }
})

router.put('/packages/:slug', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const data = { ...req.body }
    if (data.city) data.city = String(data.city).toLowerCase().trim()
    const updated = await Package.findOneAndUpdate({ slug: req.params.slug }, data, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) { next(e) }
})

// ---------- Admin Enquiries ----------
// GET /api/admin/enquiries?status=new&q=text&limit=200
router.get('/enquiries', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const { status, q, limit = 200 } = req.query
    const filter = {}
    if (status && status !== 'all') filter.status = status
    if (q) {
      const re = new RegExp(q, 'i')
      filter.$or = [{ name: re }, { email: re }, { phone: re }, { destination: re }, { from: re }, { message: re }]
    }
    const list = await Enquiry.find(filter).sort({ createdAt: -1 }).limit(Number(limit)).lean()
    res.json(list)
  } catch (e) { next(e) }
})

// PATCH /api/admin/enquiries/:id  { status }
router.patch('/enquiries/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const updated = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (e) { next(e) }
})

// DELETE /api/admin/enquiries/:id
router.delete('/enquiries/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const r = await Enquiry.findByIdAndDelete(req.params.id)
    if (!r) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

router.delete('/packages/:slug', requireAdmin, async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const hard = req.query.hard === 'true'
    if (hard) {
      const r = await Package.findOneAndDelete({ slug: req.params.slug })
      if (!r) return res.status(404).json({ error: 'Not found' })
      return res.json({ ok: true, hard: true })
    }
    const updated = await Package.findOneAndUpdate(
      { slug: req.params.slug }, { active: false }, { new: true }
    )
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

export default router
