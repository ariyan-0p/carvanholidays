import { Router } from 'express'
import express from 'express'
import crypto from 'crypto'
import Package from '../models/Package.js'
import Payment from '../models/Payment.js'
import { dbReady, memFindPackage } from '../store.js'
import { iciciConfig, initiateSale, verifyCallbackHash, transactionStatus } from '../services/iciciPg.js'

const router = Router()

const PUBLIC_BASE_URL   = (process.env.PUBLIC_BASE_URL || 'https://carvaanholidays.com').replace(/\/$/, '')
const CLIENT_ORIGIN     = (process.env.CLIENT_ORIGIN || 'https://carvaanholidays.com').replace(/\/$/, '')
const ADVANCE_PERCENT   = Math.max(0, Math.min(100, Number(process.env.ICICI_ADVANCE_PERCENT || 25)))

// 20-char max, alphanumeric-only unique reference (spec requirement).
function makeTxnNo() {
  const ts = Date.now().toString(36)                 // ~8 chars
  const rand = crypto.randomBytes(6).toString('hex') // 12 chars
  return `CH${ts}${rand}`.replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
}

// YYYYMMDDHHMISS in IST
function txnDateIST() {
  const now = new Date(Date.now() + 5.5 * 60 * 60 * 1000) // shift to IST
  const p = (n) => String(n).padStart(2, '0')
  return (
    now.getUTCFullYear().toString() +
    p(now.getUTCMonth() + 1) +
    p(now.getUTCDate()) +
    p(now.getUTCHours()) +
    p(now.getUTCMinutes()) +
    p(now.getUTCSeconds())
  )
}

async function findPackage(slug) {
  if (!dbReady()) return memFindPackage(slug)
  return Package.findOne({ slug, active: true }).lean()
}

// GET /api/payment/config — lets the booking page know if online payment is live
router.get('/config', (_req, res) => {
  const cfg = iciciConfig()
  res.json({
    enabled: cfg.configured,
    env: cfg.env,
    advancePercent: ADVANCE_PERCENT,
    currency: 'INR',
  })
})

// POST /api/payment/initiate  { slug, name, email, phone, travellers, travelDate, message }
router.post('/initiate', async (req, res, next) => {
  try {
    const cfg = iciciConfig()
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
    const amount = Math.round(chargeable * 100) / 100 // 2 decimals
    const amountStr = amount.toFixed(2)

    const merchantTxnNo = makeTxnNo()

    await Payment.create({
      merchantTxnNo,
      packageSlug: slug,
      packageTitle: pkg.title,
      amount,
      packagePrice: price,
      advancePercent: pct,
      currencyCode: '356',
      name, email, phone, travellers, travelDate, notes: message,
      status: 'INITIATED',
      env: cfg.env,
    })

    // Field set + naming matches the ICICI UAT kit sample exactly so the
    // secureHash (v1, computed inside initiateSale) lines up with what the PG
    // recomputes on its side.
    const payload = {
      merchantId: cfg.merchantId,
      merchantTxnNo,
      amount: amountStr,
      currencyCode: '356',
      payType: '0',                       // Standard / redirection
      transactionType: 'SALE',
      customerEmailID: email.trim(),
      customerMobileNo: phone.replace(/[^0-9]/g, '').slice(-10),
      customerName: name.trim(),
      txnDate: txnDateIST(),
      returnURL: `${PUBLIC_BASE_URL}/api/payment/callback`,
    }
    if (cfg.aggregatorId) payload.aggregatorID = cfg.aggregatorId

    const { data } = await initiateSale(payload)

    // R1000 = initiation success
    if (data?.responseCode === 'R1000' && data?.redirectURI && data?.tranCtx) {
      await Payment.updateOne(
        { merchantTxnNo },
        { $set: { status: 'REDIRECTED', tranCtx: data.tranCtx, initiateResponse: data } }
      )
      return res.json({
        ok: true,
        merchantTxnNo,
        // Client redirects the browser here (GET) per spec:
        redirectUrl: `${data.redirectURI}?tranCtx=${encodeURIComponent(data.tranCtx)}`,
      })
    }

    await Payment.updateOne(
      { merchantTxnNo },
      { $set: { status: 'FAILED', responseCode: data?.responseCode || '', respDescription: data?.responseDescription || data?.respDescription || 'Initiation failed', initiateResponse: data } }
    )
    return res.status(502).json({
      error: data?.responseDescription || data?.respDescription || 'Could not start payment. Please try again.',
      code: data?.responseCode || null,
    })
  } catch (e) {
    next(e)
  }
})

// POST /api/payment/callback — ICICI posts the payment result here (form-encoded).
// Parse form bodies for this route specifically (global app uses express.json()).
router.post('/callback', express.urlencoded({ extended: true, limit: '1mb' }), async (req, res) => {
  const params = req.body || {}
  const merchantTxnNo = params.merchantTxnNo || ''
  const verified = verifyCallbackHash(params)
  const code = String(params.responseCode || '')
  const isSuccess = verified && (code === '000' || code === '0000')

  try {
    if (dbReady() && merchantTxnNo) {
      await Payment.updateOne(
        { merchantTxnNo },
        {
          $set: {
            status: isSuccess ? 'SUCCESS' : (verified ? 'FAILED' : 'FAILED'),
            hashVerified: verified,
            txnID: params.txnID || '',
            paymentMode: params.paymentMode || '',
            responseCode: code,
            respDescription: params.respDescription || '',
            paymentDateTime: params.paymentDateTime || '',
            callbackParams: params,
          },
        }
      )
    }
  } catch (e) {
    console.error('Payment callback DB update failed:', e.message)
  }

  // Redirect the customer's browser to the result page on the site.
  const status = isSuccess ? 'success' : (verified ? 'failed' : 'invalid')
  const url = `${CLIENT_ORIGIN}/payment-result?status=${status}&txn=${encodeURIComponent(merchantTxnNo)}`
  return res.redirect(303, url)
})

// GET /api/payment/status/:merchantTxnNo — result page polls this
router.get('/status/:merchantTxnNo', async (req, res, next) => {
  try {
    if (!dbReady()) return res.status(503).json({ error: 'DB not connected' })
    const pmt = await Payment.findOne({ merchantTxnNo: req.params.merchantTxnNo }).lean()
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
