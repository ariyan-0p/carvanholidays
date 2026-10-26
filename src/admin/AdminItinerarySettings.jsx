import { useEffect, useState } from 'react'
import { adminItinerarySettings, adminSaveItinerarySettings } from '../api/client'
import RowsEditor from './RowsEditor'

const linesToArr = (s) => s.split('\n').map(x => x.trim()).filter(Boolean)
const arrToLines = (a) => (a || []).join('\n')

export default function AdminItinerarySettings() {
  const [s, setS] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [note, setNote] = useState(null)

  useEffect(() => {
    adminItinerarySettings().then(r => setS(r.settings)).catch(e => setErr(e?.response?.data?.error || e.message))
  }, [])

  if (!s) return <div className="admin__state">{err || 'Loading…'}</div>

  const set = (k, v) => setS(prev => ({ ...prev, [k]: v }))
  const setIn = (group, k, v) => setS(prev => ({ ...prev, [group]: { ...prev[group], [k]: v } }))

  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      const r = await adminSaveItinerarySettings(s)
      setS(r.settings)
      setNote('Saved. New PDFs will use these details.')
      setTimeout(() => setNote(null), 3000)
    } catch (er) { setErr(er?.response?.data?.error || er.message) }
    finally { setBusy(false) }
  }

  const company = s.company || {}
  const bank = s.bank || {}

  return (
    <form className="admin__page admin__form" onSubmit={save}>
      <header className="admin__header">
        <div>
          <h1>Itinerary settings</h1>
          <p className="admin__page-sub">Company-wide details used in every itinerary PDF. Set them once — override per itinerary only when needed.</p>
        </div>
        <button type="submit" disabled={busy} className="admin__btn admin__btn--primary">{busy ? 'Saving…' : 'Save settings'}</button>
      </header>
      {err && <div className="admin__state admin__state--err">{err}</div>}
      {note && <div className="admin__state">{note}</div>}

      <section className="admin__form-block">
        <div className="admin__form-block-head"><h3>Company &amp; contact</h3></div>
        <div className="admin__form-grid">
          <label>Company name<input value={company.name || ''} onChange={e => setIn('company', 'name', e.target.value)} /></label>
          <label>Tagline<input value={company.tagline || ''} onChange={e => setIn('company', 'tagline', e.target.value)} /></label>
          <label>Phone<input value={company.phone || ''} onChange={e => setIn('company', 'phone', e.target.value)} /></label>
          <label>Alternate phone<input value={company.altPhone || ''} onChange={e => setIn('company', 'altPhone', e.target.value)} /></label>
          <label>Email<input value={company.email || ''} onChange={e => setIn('company', 'email', e.target.value)} /></label>
          <label>Website<input value={company.website || ''} onChange={e => setIn('company', 'website', e.target.value)} /></label>
          <label>Instagram<input value={company.instagram || ''} onChange={e => setIn('company', 'instagram', e.target.value)} /></label>
          <label>WhatsApp number<input value={company.whatsapp || ''} onChange={e => setIn('company', 'whatsapp', e.target.value)} /></label>
          <label>Founder / signatory name<input value={company.founderName || ''} onChange={e => setIn('company', 'founderName', e.target.value)} /></label>
          <label>Founder title<input value={company.founderTitle || ''} onChange={e => setIn('company', 'founderTitle', e.target.value)} /></label>
        </div>
        <label>Office address<textarea rows="2" value={company.address || ''} onChange={e => setIn('company', 'address', e.target.value)} /></label>
      </section>

      <section className="admin__form-block">
        <div className="admin__form-block-head"><h3>Bank &amp; UPI</h3><span className="admin__sub">Shown on the “How to book” page. A UPI ID also creates a pay-by-QR code.</span></div>
        <div className="admin__form-grid">
          <label>Account name<input value={bank.accountName || ''} onChange={e => setIn('bank', 'accountName', e.target.value)} /></label>
          <label>Account number<input value={bank.accountNumber || ''} onChange={e => setIn('bank', 'accountNumber', e.target.value)} /></label>
          <label>IFSC<input value={bank.ifsc || ''} onChange={e => setIn('bank', 'ifsc', e.target.value)} /></label>
          <label>Bank name<input value={bank.bankName || ''} onChange={e => setIn('bank', 'bankName', e.target.value)} /></label>
          <label>Account type<input value={bank.accountType || ''} onChange={e => setIn('bank', 'accountType', e.target.value)} /></label>
          <label>UPI ID<input value={bank.upiId || ''} onChange={e => setIn('bank', 'upiId', e.target.value)} placeholder="name@bank" /></label>
        </div>
      </section>

      <section className="admin__form-block">
        <div className="admin__form-block-head"><h3>Default copy</h3></div>
        <label>“Why travel with us” paragraph<textarea rows="5" value={s.whyUs || ''} onChange={e => set('whyUs', e.target.value)} /></label>
        <div className="admin__form-grid">
          <label>Advance to confirm a booking (%)
            <input type="number" min="1" max="100" value={s.advancePercent ?? ''} onChange={e => set('advancePercent', e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
        </div>
        <label>Payment policy<textarea rows="2" value={s.paymentTerms || ''} onChange={e => set('paymentTerms', e.target.value)} /></label>
        <label>Terms &amp; conditions (one per line)
          <textarea rows="4" value={s.terms || ''} onChange={e => set('terms', e.target.value)} />
        </label>
        <div className="admin__form-grid">
          <label>Closing page title<input value={s.closingTitle || ''} onChange={e => set('closingTitle', e.target.value)} /></label>
          <label>Closing page message<textarea rows="2" value={s.closingMessage || ''} onChange={e => set('closingMessage', e.target.value)} /></label>
        </div>
      </section>

      <section className="admin__form-block">
        <RowsEditor
          title="Cancellation & refund slabs" items={s.cancellationSlabs || []} onChange={v => set('cancellationSlabs', v)}
          blank={{ window: '', charge: '' }} addLabel="+ Add slab"
          fields={[
            { key: 'window', label: 'When you cancel', placeholder: '45 days or more before travel', span: 2 },
            { key: 'charge', label: 'What you get back', placeholder: 'Full refund', span: 2 },
          ]}
        />
      </section>

      <section className="admin__form-block">
        <RowsEditor
          title="Default guest reviews" hint="Used when an itinerary has the Reviews section on and no reviews of its own."
          items={s.reviews || []} onChange={v => set('reviews', v)}
          blank={{ name: '', rating: 5, text: '' }} addLabel="+ Add review"
          fields={[
            { key: 'name', label: 'Name', placeholder: 'Riya K., Mumbai', span: 2 },
            { key: 'rating', label: 'Stars (1–5)', type: 'number' },
            { key: 'text', label: 'Review', type: 'textarea', span: 4 },
          ]}
        />
      </section>

      <section className="admin__form-block">
        <RowsEditor
          title="Default “Things to carry”" hint="Groups of items (Documents, Clothing, Medicines…)."
          items={s.thingsToCarry || []} onChange={v => set('thingsToCarry', v)}
          blank={{ group: '', items: [] }} addLabel="+ Add group"
          fields={[
            { key: 'group', label: 'Group', placeholder: 'Clothing', span: 1 },
            { key: 'items', label: 'Items (one per line)', type: 'lines', rows: 4, span: 3 },
          ]}
        />
        <label style={{ marginTop: 12 }}>“Please keep in mind” (one per line)
          <textarea rows="3" value={arrToLines(s.keepInMind)} onChange={e => set('keepInMind', linesToArr(e.target.value))} />
        </label>
      </section>

      <div className="admin__form-footer">
        <button type="submit" disabled={busy} className="admin__btn admin__btn--primary">{busy ? 'Saving…' : 'Save settings'}</button>
      </div>
    </form>
  )
}
