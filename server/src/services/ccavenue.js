import crypto from 'crypto'

/**
 * CCAvenue "Non-Seamless" (redirect) integration.
 *
 * Flow:
 *   1. Build a plaintext param string (key=value&key=value…)
 *   2. AES-128-CBC encrypt it with the Working Key → hex  (encRequest)
 *   3. Browser POSTs { encRequest, access_code } to CCAvenue's
 *      initiateTransaction URL → CCAvenue hosts the payment page
 *   4. On completion CCAvenue POSTs `encResp` (hex) back to our redirect_url
 *   5. We decrypt encResp, read `order_status` (Success / Aborted / Failure)
 *
 * Encryption per CCAvenue's official kit:
 *   key = MD5(workingKey) (16 bytes), IV = 0x00..0x0f fixed, AES-128-CBC.
 */

const MERCHANT_ID = process.env.CCAVENUE_MERCHANT_ID || ''
const ACCESS_CODE = process.env.CCAVENUE_ACCESS_CODE || ''
const WORKING_KEY = process.env.CCAVENUE_WORKING_KEY || ''
const ENV         = (process.env.CCAVENUE_ENV || 'prod').toLowerCase()

const IV = Buffer.from([
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
  0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
])

const URLS = {
  test: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
  prod: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction',
}

export const ccavenueConfig = () => ({
  env: ENV,
  merchantId: MERCHANT_ID,
  accessCode: ACCESS_CODE,
  configured: Boolean(MERCHANT_ID && ACCESS_CODE && WORKING_KEY),
  postUrl: URLS[ENV] || URLS.prod,
})

function keyBytes() {
  return crypto.createHash('md5').update(WORKING_KEY, 'utf8').digest() // 16 bytes
}

export function encrypt(plainText) {
  const cipher = crypto.createCipheriv('aes-128-cbc', keyBytes(), IV)
  return cipher.update(plainText, 'utf8', 'hex') + cipher.final('hex')
}

export function decrypt(encHex) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', keyBytes(), IV)
  return decipher.update(encHex, 'hex', 'utf8') + decipher.final('utf8')
}

/** Build the CCAvenue request plaintext. Values are sanitised of & and = . */
export function buildRequest(params) {
  const clean = (v) => String(v ?? '').replace(/[&=]/g, ' ').trim()
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v) !== '')
    .map(([k, v]) => `${k}=${clean(v)}`)
    .join('&')
}

/** Parse the decrypted CCAvenue response string into an object. */
export function parseResponse(decrypted) {
  const out = {}
  for (const pair of decrypted.split('&')) {
    const idx = pair.indexOf('=')
    if (idx === -1) continue
    out[pair.slice(0, idx)] = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '))
  }
  return out
}
