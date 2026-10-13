import ItinerarySettings from '../models/ItinerarySettings.js'
import { DEFAULT_SETTINGS } from '../config/itineraryDefaults.js'
import { dbReady } from '../store.js'

const isFilled = (v) =>
  Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== ''

// db value wins when it has content, otherwise fall back to the built-in default.
const overlay = (base, over) => {
  const out = { ...base }
  Object.entries(over || {}).forEach(([k, v]) => {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
      out[k] = overlay(base[k], v)
    } else if (isFilled(v)) {
      out[k] = v
    }
  })
  return out
}

export async function loadSettings() {
  if (!dbReady()) return DEFAULT_SETTINGS
  const doc = await ItinerarySettings.findOne({ key: 'itinerary' }).lean()
  if (!doc) return DEFAULT_SETTINGS
  const { _id, __v, key, createdAt, updatedAt, ...rest } = doc
  return overlay(DEFAULT_SETTINGS, rest)
}

export async function saveSettings(body = {}) {
  const { _id, __v, key, createdAt, updatedAt, ...rest } = body
  const doc = await ItinerarySettings.findOneAndUpdate(
    { key: 'itinerary' },
    { $set: rest, $setOnInsert: { key: 'itinerary' } },
    { new: true, upsert: true, runValidators: true }
  ).lean()
  return doc
}
