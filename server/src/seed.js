import 'dotenv/config'
import mongoose from 'mongoose'
import Package from './models/Package.js'
import { packages } from './data/packages.seed.js'

export async function seedIfEmpty() {
  const count = await Package.countDocuments()
  if (count === 0) {
    console.log('→ No packages found, seeding…')
    await Package.insertMany(packages)
    console.log(`✓ Seeded ${packages.length} packages`)
  } else {
    console.log(`✓ ${count} packages already in DB`)
  }
}

// CLI: `npm run seed` — wipe + reseed.
async function runSeed() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carvanholidays'
  await mongoose.connect(MONGO_URI)
  console.log('Connected. Wiping packages…')
  await Package.deleteMany({})
  await Package.insertMany(packages)
  console.log(`✓ Reseeded ${packages.length} packages`)
  await mongoose.disconnect()
  process.exit(0)
}

import { fileURLToPath } from 'url'
import { resolve } from 'path'
const isMain = resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] || '')
if (isMain) runSeed().catch((e) => { console.error(e); process.exit(1) })
