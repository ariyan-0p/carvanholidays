import crypto from 'crypto'

/**
 * ICICI Bank "Orange PG" integration helpers.
 *
 * Two hash schemes per the interface spec:
 *   v1 (form/query APIs like refund, status, and the payment CALLBACK):
 *       concat non-null/non-empty param VALUES in ascending order of param
 *       NAME, HMAC-SHA256 with the merchant secure key, hex lowercase.
 *   v2 (JSON APIs like initiateSale):
 *       HMAC-SHA256 of the minified JSON string, hex lowercase, sent in the
 *       `securehash` HTTP request header.
 */

const SECURE_KEY   = process.env.ICICI_SECURE_KEY || ''
const MERCHANT_ID  = process.env.ICICI_MERCHANT_ID || ''
const ENV          = (process.env.ICICI_ENV || 'uat').toLowerCase()

const URLS = {
  uat: {
    initiateSale: 'https://pgpayuat.icicibank.com/tsp/pg/api/v2/initiateSale',
    command:      'https://pgpayuat.icicibank.com/tsp/pg/api/command',
  },
  prod: {
    initiateSale: 'https://pgpay.icicibank.com/pg/api/v2/initiateSale',
    command:      'https://pgpay.icicibank.com/pg/api/command',
  },
}

export const iciciConfig = () => ({
  env: ENV,
  merchantId: MERCHANT_ID,
  configured: Boolean(SECURE_KEY && MERCHANT_ID),
  urls: URLS[ENV] || URLS.uat,
})

/** Hash Calc v1 — for form-encoded requests and the browser callback. */
export function hashV1(params, key = SECURE_KEY) {
  const concatenated = Object.keys(params)
    .filter((k) => k !== 'secureHash' && k !== 'securehash')
    .filter((k) => params[k] !== null && params[k] !== undefined && String(params[k]) !== '')
    .sort((a, b) => a.localeCompare(b))
    .map((k) => String(params[k]))
    .join('')
  return crypto.createHmac('sha256', key).update(concatenated, 'utf8').digest('hex').toLowerCase()
}

/** Hash Calc v2 — HMAC of the minified JSON string. */
export function hashV2(minifiedJsonString, key = SECURE_KEY) {
  return crypto.createHmac('sha256', key).update(minifiedJsonString, 'utf8').digest('hex').toLowerCase()
}

/**
 * Verify the secureHash on the payment callback (form-encoded → v1).
 * Returns true only when the recomputed hash matches the one ICICI sent.
 */
export function verifyCallbackHash(params) {
  const received = (params.secureHash || params.securehash || '').toLowerCase()
  if (!received) return false
  const expected = hashV1(params)
  // timingSafeEqual needs equal-length buffers
  if (received.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  } catch {
    return false
  }
}

/**
 * Call initiateSale (server-to-server). `payload` is the plain JSON object of
 * sale parameters (without any hash). We minify it, compute v2 hash, and send
 * it in the `securehash` header.
 * Returns { ok, status, data } where data is the parsed JSON response.
 */
export async function initiateSale(payload) {
  const { urls } = iciciConfig()
  const body = JSON.stringify(payload) // minified (no spaces) — required by spec
  const securehash = hashV2(body)

  const res = await fetch(urls.initiateSale, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      securehash,
    },
    body,
  })

  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return { ok: res.ok, status: res.status, data }
}

/**
 * Command endpoint (STATUS / REFUND) — form-encoded, v1 hash in `secureHash` param.
 */
export async function command(params) {
  const { urls } = iciciConfig()
  const full = { ...params, merchantId: params.merchantId || MERCHANT_ID }
  const secureHash = hashV1(full)
  const form = new URLSearchParams({ ...full, secureHash })

  const res = await fetch(urls.command, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  return { ok: res.ok, status: res.status, data }
}

/** Ask ICICI for the authoritative status of a transaction. */
export async function transactionStatus({ merchantTxnNo, originalTxnNo }) {
  return command({
    merchantId: MERCHANT_ID,
    merchantTxnNo,
    originalTxnNo,
    transactionType: 'STATUS',
  })
}
