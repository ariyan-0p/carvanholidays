import { Router } from 'express'
import bcrypt from 'bcryptjs'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { signAdminToken, requireAdmin } from '../middleware/auth.js'
import Package from '../models/Package.js'
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
