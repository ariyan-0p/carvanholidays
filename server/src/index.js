import 'dotenv/config'
import path from 'path'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import packagesRouter from './routes/packages.js'
import bookingsRouter from './routes/bookings.js'
import contactRouter from './routes/contact.js'
import citiesRouter from './routes/cities.js'
import adminRouter from './routes/admin.js'
import enquiriesRouter from './routes/enquiries.js'
import testimonialsRouter from './routes/testimonials.js'
import { seedIfEmpty } from './seed.js'

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carvanholidays'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
})

app.use('/api/packages', packagesRouter)
app.use('/api/bookings', bookingsRouter)
app.use('/api/contact', contactRouter)
app.use('/api/cities', citiesRouter)
app.use('/api/enquiries', enquiriesRouter)
app.use('/api/testimonials', testimonialsRouter)
app.use('/api/admin', adminRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
})

async function start() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✓ MongoDB connected')
    await seedIfEmpty()
  } catch (e) {
    console.warn('⚠ MongoDB connection failed — API will run but DB-backed routes will error.')
    console.warn('  Reason:', e.message)
  }
  app.listen(PORT, () => console.log(`✓ API running on http://localhost:${PORT}`))
}

start()
