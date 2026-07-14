import mongoose from 'mongoose'

/**
 * Tracks a single ICICI Orange PG payment attempt for a package booking.
 * merchantTxnNo is our unique reference sent to ICICI and echoed back in
 * both the initiateSale response and the payment callback.
 */
const paymentSchema = new mongoose.Schema(
  {
    merchantTxnNo: { type: String, required: true, unique: true, index: true },

    // What is being paid for
    packageSlug:  { type: String, default: '' },
    packageTitle: { type: String, default: '' },
    amount:       { type: Number, required: true },  // amount actually charged (advance or full), INR
    packagePrice: { type: Number, default: 0 },       // per-person price at time of booking
    advancePercent: { type: Number, default: 0 },     // 0 = full payment
    currencyCode: { type: String, default: '356' },   // INR

    // Customer
    name:       { type: String, default: '' },
    email:      { type: String, default: '' },
    phone:      { type: String, default: '' },
    travellers: { type: String, default: '' },
    travelDate: { type: String, default: '' },
    notes:      { type: String, default: '' },

    // Lifecycle
    status: {
      type: String,
      enum: ['INITIATED', 'REDIRECTED', 'SUCCESS', 'FAILED', 'CANCELLED', 'PENDING'],
      default: 'INITIATED',
      index: true,
    },

    // ICICI references
    tranCtx:        { type: String, default: '' },  // from initiateSale response
    txnID:          { type: String, default: '' },  // PG-generated txn id (from callback)
    paymentMode:    { type: String, default: '' },  // CARD / UPI / NB / WALLET
    responseCode:   { type: String, default: '' },
    respDescription:{ type: String, default: '' },
    paymentDateTime:{ type: String, default: '' },

    // Full raw payloads for audit / debugging (never trust these for business logic
    // without hash verification — which we do before writing SUCCESS).
    initiateResponse: { type: Object, default: null },
    callbackParams:   { type: Object, default: null },

    hashVerified: { type: Boolean, default: false },
    env: { type: String, default: 'uat' }, // uat | prod
  },
  { timestamps: true }
)

export default mongoose.model('Payment', paymentSchema)
