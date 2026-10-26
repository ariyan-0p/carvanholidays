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

// The office moved. If settings saved before the move still carry the old address, ignore it
// so the current default applies everywhere (PDF and admin form).
const LEGACY_ADDRESS = /Shakti Nagar|DRM Road|462022/i
export function dropLegacyAddress(saved = {}) {
  if (saved.company?.address && LEGACY_ADDRESS.test(saved.company.address)) {
    return { ...saved, company: { ...saved.company, address: '' } }
  }
  return saved
}

export async function loadSettings() {
  if (!dbReady()) return DEFAULT_SETTINGS
  const doc = await ItinerarySettings.findOne({ key: 'itinerary' }).lean()
  if (!doc) return DEFAULT_SETTINGS
  const { _id, __v, key, createdAt, updatedAt, ...rest } = doc
  return overlay(DEFAULT_SETTINGS, dropLegacyAddress(rest))
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
