// In-memory fallback store. Used automatically when MongoDB is not connected.
// Mirrors the subset of Package/Booking/Contact API surface the routes need.

import mongoose from 'mongoose'
import { packages as seedPackages } from './data/packages.seed.js'

const memory = {
  packages: seedPackages.map((p, i) => ({ ...p, _id: `mem-${i}` })),
  bookings: [],
  contacts: [],
}

export const dbReady = () => mongoose.connection.readyState === 1

// ---------- Packages ----------
export const memFindPackages = ({ category, featured, q, city, limit } = {}) => {
  let items = memory.packages.filter(p => p.active !== false)
  if (category) items = items.filter(p => p.category === category)
  if (featured === 'true' || featured === true) items = items.filter(p => p.featured)
  if (city) {
    const c = String(city).toLowerCase()
    items = items.filter(p => p.city === c)
  }
  if (q) {
    const re = new RegExp(q, 'i')
    items = items.filter(p =>
      re.test(p.title || '') || re.test(p.destination || '') || re.test(p.country || '') || re.test(p.summary || '')
    )
  }
  items = [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  if (limit) items = items.slice(0, Number(limit))
  return items
}

export const memFindPackage = (slug) =>
  memory.packages.find(p => p.slug === slug && p.active !== false) || null

// ---------- Bookings ----------
export const memCreateBooking = (data) => {
  const item = { _id: `bk-${Date.now()}`, status: 'pending', createdAt: new Date(), ...data }
  memory.bookings.unshift(item)
  return item
}
export const memListBookings = () => memory.bookings

// ---------- Contacts ----------
export const memCreateContact = (data) => {
  const item = { _id: `ct-${Date.now()}`, createdAt: new Date(), ...data }
  memory.contacts.unshift(item)
  return item
}
