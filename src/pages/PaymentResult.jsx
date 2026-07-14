import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchPaymentStatus } from '../api/client'
import './pages.css'
import './payment.css'

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function PaymentResult() {
  const [params] = useSearchParams()
  const status = params.get('status') || 'unknown'   // success | failed | invalid | unknown
  const txn = params.get('txn') || ''
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(!!txn)

  useEffect(() => {
    if (!txn) { setLoading(false); return }
    fetchPaymentStatus(txn)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [txn])

  const ok = status === 'success' || detail?.status === 'SUCCESS'

  return (
    <div className="payres">
      <div className="payres__card">
        <div className={`payres__icon ${ok ? 'is-ok' : 'is-fail'}`}>
          {ok ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          )}
        </div>

        {ok ? (
          <>
            <h1 className="payres__title">Payment <em>successful</em></h1>
            <p className="payres__sub">
              Thank you{detail?.name ? `, ${detail.name.split(' ')[0]}` : ''}! Your advance
              {detail?.amount ? <> of <strong>{inr(detail.amount)}</strong></> : null} is received.
              Our team will confirm your full itinerary within 24 hours.
            </p>
          </>
        ) : (
          <>
            <h1 className="payres__title">Payment {status === 'invalid' ? 'could not be verified' : 'not completed'}</h1>
            <p className="payres__sub">
              {status === 'invalid'
                ? 'We could not verify this transaction securely. If money was debited, it will be auto-refunded by your bank. Please contact us before retrying.'
                : 'Your payment was not completed. No amount has been captured. You can try again or request a callback.'}
            </p>
          </>
        )}

        {!loading && detail && (
          <div className="payres__meta">
            {detail.packageTitle && <div><span>Package</span><strong>{detail.packageTitle}</strong></div>}
            {txn && <div><span>Reference</span><strong>{txn}</strong></div>}
            {detail.txnID && <div><span>Txn ID</span><strong>{detail.txnID}</strong></div>}
            {detail.paymentMode && <div><span>Method</span><strong>{detail.paymentMode}</strong></div>}
          </div>
        )}

        <div className="payres__actions">
          {ok ? (
            <Link to="/packages" className="book-box__btn">Browse more trips</Link>
          ) : (
            <>
              {detail?.packageSlug && (
                <Link to={`/book/${detail.packageSlug}`} className="book-box__btn">Try again</Link>
              )}
              <a href="tel:+919131978160" className="book-box__btn book-box__btn--ghost">Call us</a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
