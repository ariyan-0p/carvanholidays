import { Router } from 'express'
import express from 'express'
import crypto from 'crypto'
import Package from '../models/Package.js'
import Payment from '../models/Payment.js'
import Itinerary from '../models/Itinerary.js'
import { loadSettings } from '../services/itinerarySettings.js'
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
      const updated = await Payment.findOneAndUpdate(
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
        },
        { new: true }
      )
      // A successful itinerary payment confirms the itinerary.
      if (updated?.status === 'SUCCESS' && updated.itineraryId) {
        await Itinerary.updateOne({ _id: updated.itineraryId }, { $set: { status: 'confirmed' } })
      }
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
      kind: pmt.kind,
      payType: pmt.payType,
      itineraryRef: pmt.itineraryRef,
      payToken: pmt.itineraryId ? (await Itinerary.findById(pmt.itineraryId).select('shareToken').lean())?.shareToken || '' : '',
    })
  } catch (e) { next(e) }
})

/* ------------------------------------------------------------------ */
/* Pay link for a customer itinerary: /pay/:token (token = share token) */
/* ------------------------------------------------------------------ */

// Work out what is payable. Amounts always come from the saved itinerary, never the browser.
export async function itineraryPayState(it) {
  const settings = await loadSettings()
  const total = Number(it.totalPrice) || 0
  const pct = Math.max(1, Math.min(100, Number(it.advancePercent || settings.advancePercent || 50)))
  const agg = await Payment.aggregate([
    { $match: { itineraryId: it._id, status: 'SUCCESS' } },
    { $group: { _id: null, paid: { $sum: '$amount' } } },
  ])
  const paid = Math.round((agg[0]?.paid || 0) * 100) / 100
  const advanceTarget = Math.round((total * pct) / 100)
  const outstanding = Math.max(0, Math.round((total - paid) * 100) / 100)
  return {
    total,
    pct,
    paid,
    outstanding,
    advanceDue: Math.max(0, Math.min(outstanding, advanceTarget - paid)),
    balanceDue: outstanding,
    currency: it.currency || 'INR',
  }
}

async function findByToken(token) {
  if (!dbReady() || !/^[a-f0-9]{16,64}$/i.test(String(token || ''))) return null
  return Itinerary.findOne({ shareToken: token, isTemplate: { $ne: true } })
}

// GET /api/payment/itinerary/:token
router.get('/itinerary/:token', async (req, res, next) => {
  try {
    const it = await findByToken(req.params.token)
    if (!it) return res.status(404).json({ error: 'This payment link is not valid.' })
    const cfg = ccavenueConfig()
    const st = await itineraryPayState(it)
    res.json({
      enabled: cfg.configured && st.currency === 'INR',
      title: it.title,
      ref: it.ref,
      destination: it.destination,
      coverImage: it.coverImage || '',
      travelDate: it.travelDate || '',
      travellers: [it.adults ? `${it.adults} Adult${it.adults > 1 ? 's' : ''}` : '', it.children ? `${it.children} Child${it.children > 1 ? 'ren' : ''}` : ''].filter(Boolean).join(' + '),
      customer: { name: it.customer?.name || '', email: it.customer?.email || '', phone: it.customer?.phone || '' },
      ...st,
    })
  } catch (e) { next(e) }
})

// POST /api/payment/itinerary/:token/initiate  { payType, name, email, phone }
router.post('/itinerary/:token/initiate', async (req, res, next) => {
  try {
    const cfg = ccavenueConfig()
    if (!cfg.configured) return res.status(503).json({ error: 'Online payment is not available right now. Please contact us.' })
    const it = await findByToken(req.params.token)
    if (!it) return res.status(404).json({ error: 'This payment link is not valid.' })
    const st = await itineraryPayState(it)
    if (st.currency !== 'INR') return res.status(400).json({ error: 'Online payment is only available in INR. Please contact us.' })
    if (!st.total) return res.status(400).json({ error: 'This itinerary has no payable amount yet. Please contact us.' })

    const { payType = 'advance', name = '', email = '', phone = '' } = req.body || {}
    const n = String(name || it.customer?.name || '').trim()
    const e = String(email || it.customer?.email || '').trim()
    const p = String(phone || it.customer?.phone || '').trim()
    if (!n || !e || !p) return res.status(400).json({ error: 'Name, email and phone are required.' })

    const amountByType = { advance: st.advanceDue, balance: st.balanceDue, full: st.outstanding }
    if (!(payType in amountByType)) return res.status(400).json({ error: 'Invalid payment option.' })
    const amount = Math.round(amountByType[payType] * 100) / 100
    if (!(amount > 0)) return res.status(400).json({ error: 'Nothing is due for this option.' })

    const orderId = makeOrderId()
    await Payment.create({
      merchantTxnNo: orderId,
      kind: 'itinerary',
      itineraryId: it._id,
      itineraryRef: it.ref,
      payType,
      packageTitle: it.title,
      amount,
      packagePrice: st.total,
      advancePercent: st.pct,
      currencyCode: 'INR',
      name: n, email: e, phone: p,
      travellers: [it.adults, it.children].filter(Boolean).join('+'),
      travelDate: it.travelDate || '',
      status: 'INITIATED',
      env: cfg.env,
    })

    const encRequest = encrypt(buildRequest({
      merchant_id: cfg.merchantId,
      order_id: orderId,
      amount: amount.toFixed(2),
      currency: 'INR',
      redirect_url: `${PUBLIC_BASE_URL}/api/payment/callback`,
      cancel_url: `${PUBLIC_BASE_URL}/api/payment/callback`,
      language: 'EN',
      billing_name: n.slice(0, 60),
      billing_email: e,
      billing_tel: p.replace(/[^0-9]/g, '').slice(-10),
      merchant_param1: it.ref,
      merchant_param2: (it.title || '').slice(0, 60),
    }))

    res.json({ ok: true, orderId, postUrl: cfg.postUrl, encRequest, accessCode: cfg.accessCode })
  } catch (err) { next(err) }
})

export default router
