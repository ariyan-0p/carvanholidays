import { Router } from 'express'
import express from 'express'
import crypto from 'crypto'
import Package from '../models/Package.js'
import Payment from '../models/Payment.js'
import { dbReady, memFindPackage } from '../store.js'
import { ccavenueConfig, encrypt, decrypt, buildRequest, parseResponse } from '../services/ccavenue.js'

const router = Router()

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || 'https://carvaanholidays.com').replace(/\/$/, '')
const CLIENT_ORIGIN   = (process.env.CLIENT_ORIGIN || 'https://carvaanholidays.com').replace(/\/$/, '')
const ADVANCE_PERCENT = Math.max(0, Math.min(100,
  Number(process.env.PAYMENT_ADVANCE_PERCENT || process.env.ICICI_ADVANCE_PERCENT || 25)))

// CCAvenue order_id: alphanumeric, <= 30. Ours is ~20 alnum.
function makeOrderId() {
  const ts = Date.now().toString(36)
  const rand = crypto.randomBytes(6).toString('hex')
  return `CH${ts}${rand}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 28)
}

async function findPackage(slug) {
  if (!dbReady()) return memFindPackage(slug)
  return Package.findOne({ slug, active: true }).lean()
}

// GET /api/payment/config
router.get('/config', (_req, res) => {
  const cfg = ccavenueConfig()
  res.json({
    enabled: cfg.configured,
    env: cfg.env,
    gateway: 'ccavenue',
    advancePercent: ADVANCE_PERCENT,
    currency: 'INR',
  })
})

// POST /api/payment/initiate  { slug, name, email, phone, travellers, travelDate, message }
// Returns { postUrl, encRequest, accessCode } — the client auto-submits a form to CCAvenue.
router.post('/initiate', async (req, res, next) => {
  try {
    const cfg = ccavenueConfig()
    if (!cfg.configured) {
      return res.status(503).json({ error: 'Online payment is not configured yet. Please try the enquiry option.' })
    }
    if (!dbReady()) {
      return res.status(503).json({ error: 'Service temporarily unavailable. Please try again shortly.' })
    }

    const { slug, name = '', email = '', phone = '', travellers = '', travelDate = '', message = '' } = req.body || {}
    if (!slug) return res.status(400).json({ error: 'Missing package' })
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return res.status(400).json({ error: 'Name, email and phone are required.' })
    }

    const pkg = await findPackage(slug)
    if (!pkg) return res.status(404).json({ error: 'Package not found' })

    const price = Number(pkg.price || 0)
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'This package cannot be paid online. Please contact us.' })
    }

    const pct = ADVANCE_PERCENT
    const chargeable = pct > 0 && pct < 100 ? (price * pct) / 100 : price
    const amount = Math.round(chargeable * 100) / 100
    const amountStr = amount.toFixed(2)

    const orderId = makeOrderId()

    await Payment.create({
      merchantTxnNo: orderId,
      packageSlug: slug,
      packageTitle: pkg.title,
      amount,
      packagePrice: price,
      advancePercent: pct,
      currencyCode: 'INR',
      name, email, phone, travellers, travelDate, notes: message,
      status: 'INITIATED',
      env: cfg.env,
    })

    const requestParams = {
      merchant_id: cfg.merchantId,
      order_id: orderId,
      amount: amountStr,
      currency: 'INR',
      redirect_url: `${PUBLIC_BASE_URL}/api/payment/callback`,
      cancel_url: `${PUBLIC_BASE_URL}/api/payment/callback`,
      language: 'EN',
      billing_name: name.trim().slice(0, 60),
      billing_email: email.trim(),
      billing_tel: phone.replace(/[^0-9]/g, '').slice(-10),
      merchant_param1: slug,
      merchant_param2: (pkg.title || '').slice(0, 60),
    }

    const encRequest = encrypt(buildRequest(requestParams))

    return res.json({
      ok: true,
      orderId,
      postUrl: cfg.postUrl,
      encRequest,
      accessCode: cfg.accessCode,
    })
  } catch (e) {
    next(e)
  }
})

// POST /api/payment/callback — CCAvenue posts encResp here (form-encoded).
router.post('/callback', express.urlencoded({ extended: true, limit: '1mb' }), async (req, res) => {
  const encResp = req.body?.encResp || ''
  let parsed = {}
  let ok = false
  let orderId = ''

  try {
    if (encResp) {
      const decrypted = decrypt(encResp)
      parsed = parseResponse(decrypted)
      orderId = parsed.order_id || ''
      ok = String(parsed.order_status || '').toLowerCase() === 'success'
    }
  } catch (e) {
    console.error('CCAvenue callback decrypt failed:', e.message)
  }

  try {
    if (dbReady() && orderId) {
      const statusMap = { success: 'SUCCESS', aborted: 'CANCELLED', failure: 'FAILED', invalid: 'FAILED' }
      const os = String(parsed.order_status || '').toLowerCase()
      await Payment.updateOne(
        { merchantTxnNo: orderId },
        {
          $set: {
            status: statusMap[os] || 'FAILED',
            hashVerified: true, // decryption success == authenticity (only we + CCAvenue hold the key)
            txnID: parsed.tracking_id || '',
            paymentMode: parsed.payment_mode || '',
            responseCode: parsed.order_status || '',
            respDescription: parsed.status_message || parsed.failure_message || '',
            paymentDateTime: parsed.trans_date || '',
            callbackParams: parsed,
          },
        }
      )
    }
  } catch (e) {
    console.error('CCAvenue callback DB update failed:', e.message)
  }

  const os = String(parsed.order_status || '').toLowerCase()
  const status = ok ? 'success' : (os === 'aborted' ? 'cancelled' : 'failed')
  return res.redirect(303, `${CLIENT_ORIGIN}/payment-result?status=${status}&txn=${encodeURIComponent(orderId)}`)
})

// GET /api/payment/status/:orderId — result page polls this
router.get('/status/:orderId', async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const pmt = await Payment.findOne({ merchantTxnNo: req.params.orderId }).lean()
    if (!pmt) return res.status(404).json({ error: 'Payment not found' })
    res.json({
      merchantTxnNo: pmt.merchantTxnNo,
      status: pmt.status,
      amount: pmt.amount,
      packageTitle: pmt.packageTitle,
      packageSlug: pmt.packageSlug,
      txnID: pmt.txnID,
      paymentMode: pmt.paymentMode,
      respDescription: pmt.respDescription,
      name: pmt.name,
      advancePercent: pmt.advancePercent,
    })
  } catch (e) { next(e) }
})

export default router
