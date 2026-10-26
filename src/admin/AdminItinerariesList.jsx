import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  adminListItineraries,
  adminDeleteItinerary,
  adminDuplicateItinerary,
  adminItineraryPdf,
} from '../api/client'
import { openPdfBlob, shareUrl, payUrl } from './itineraryUtils'

const STATUS = {
  draft: { label: 'Draft', cls: 'admin__pill--off' },
  sent: { label: 'Sent', cls: 'admin__pill--warn' },
  confirmed: { label: 'Confirmed', cls: 'admin__pill--ok' },
}

export default function AdminItinerariesList() {
  const nav = useNavigate()
  const [tab, setTab] = useState('itineraries') // itineraries | templates
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [q, setQ] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [note, setNote] = useState(null)

  const isTpl = tab === 'templates'

  const load = () => {
    setLoading(true); setErr(null)
    adminListItineraries({ templates: isTpl, ...(q ? { q } : {}) })
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t) }, [q, tab])

  const flash = (m) => { setNote(m); setTimeout(() => setNote(null), 2500) }

  const onPdf = async (it) => {
    setBusyId(it._id); setErr(null)
    try { openPdfBlob(await adminItineraryPdf(it._id), `${it.ref}.pdf`) }
    catch (e) { setErr(e?.response?.data?.error || e.message) }
    finally { setBusyId(null) }
  }
  const onCopy = async (it) => {
    try { await navigator.clipboard.writeText(shareUrl(it.shareToken)); flash('Share link copied') }
    catch { window.prompt('Copy this link:', shareUrl(it.shareToken)) }
  }
  const onCopyPay = async (it) => {
    const link = payUrl(it.shareToken)
    try { await navigator.clipboard.writeText(link); flash('Pay link copied') }
    catch { window.prompt('Copy this link:', link) }
  }
  const onDup = async (it) => {
    const copy = await adminDuplicateItinerary(it._id)
    nav(`/admin/itineraries/${copy._id}/edit`)
  }
  const onSaveAsTemplate = async (it) => {
    await adminDuplicateItinerary(it._id, true)
    flash(`Saved “${it.title}” as a template.`)
  }
  const onDelete = async (it) => {
    if (!confirm(`Delete ${isTpl ? 'template' : 'itinerary'} ${it.ref} (${it.templateName || it.title})? This cannot be undone.`)) return
    await adminDeleteItinerary(it._id)
    load()
  }

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Itineraries</h1>
          <p className="admin__page-sub">Build customer itineraries and quotes, then download them as branded PDFs.</p>
        </div>
        <div className="admin__header-actions">
          <Link className="admin__btn" to="/admin/itineraries/new?template=1">+ New template</Link>
          <Link className="admin__btn admin__btn--primary" to="/admin/itineraries/new">+ New itinerary</Link>
        </div>
      </header>

      <div className="admin__tabs">
        <button className={`admin__tab ${!isTpl ? 'is-on' : ''}`} onClick={() => setTab('itineraries')}>Customer itineraries</button>
        <button className={`admin__tab ${isTpl ? 'is-on' : ''}`} onClick={() => setTab('templates')}>Templates</button>
      </div>

      <input className="admin__search" placeholder={isTpl ? 'Search templates…' : 'Search by customer, title, ref or destination…'} value={q} onChange={e => setQ(e.target.value)} />

      {note && <div className="admin__state">{note}</div>}
      {loading && <div className="admin__state">Loading…</div>}
      {err && <div className="admin__state admin__state--err">{err}</div>}

      {!loading && !err && (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              {isTpl
                ? <tr><th></th><th>Template</th><th>Destination</th><th>Duration</th><th>Updated</th><th>Actions</th></tr>
                : <tr><th>Ref</th><th>Itinerary</th><th>Customer</th><th>Travel date</th><th>Total</th><th>Status</th><th>Actions</th></tr>}
            </thead>
            <tbody>
              {items.map(it => isTpl ? (
                <tr key={it._id}>
                  <td>{it.coverImage && <img src={it.coverImage} alt="" className="admin__thumb" />}</td>
                  <td><Link to={`/admin/itineraries/${it._id}/edit`}>{it.templateName || it.title}</Link><div className="admin__sub">{it.title}</div></td>
                  <td>{it.destination || '—'}</td>
                  <td>{it.nights != null ? `${it.nights}N/${it.days}D` : '—'}</td>
                  <td>{new Date(it.updatedAt).toLocaleDateString('en-IN')}</td>
                  <td className="admin__row-actions">
                    <Link to={`/admin/itineraries/new?from=${it._id}`} className="admin__btn admin__btn--primary">Use template</Link>
                    <Link to={`/admin/itineraries/${it._id}/edit`} className="admin__btn">Edit</Link>
                    <button className="admin__btn admin__btn--danger" onClick={() => onDelete(it)}>Delete</button>
                  </td>
                </tr>
              ) : (
                <tr key={it._id}>
                  <td><code>{it.ref}</code></td>
                  <td>
                    <Link to={`/admin/itineraries/${it._id}/edit`}>{it.title}</Link>
                    <div className="admin__sub">{[it.destination, it.nights != null && `${it.nights}N/${it.days}D`].filter(Boolean).join(' · ')}</div>
                  </td>
                  <td>{it.customer?.name || '—'}<div className="admin__sub">{it.customer?.phone}</div></td>
                  <td>{it.travelDate || '—'}</td>
                  <td>
                    {it.totalPrice ? `₹${Number(it.totalPrice).toLocaleString('en-IN')}` : '—'}
                    {it.paid > 0 && <div className="admin__sub" style={{ color: '#166534', fontWeight: 600 }}>Paid ₹{Number(it.paid).toLocaleString('en-IN')}</div>}
                  </td>
                  <td><span className={`admin__pill ${(STATUS[it.status] || STATUS.draft).cls}`}>{(STATUS[it.status] || STATUS.draft).label}</span></td>
                  <td className="admin__row-actions">
                    <button className="admin__btn admin__btn--primary" onClick={() => onPdf(it)} disabled={busyId === it._id}>
                      {busyId === it._id ? 'Building…' : 'PDF'}
                    </button>
                    <button className="admin__btn" onClick={() => onCopy(it)}>Copy PDF link</button>
                    {it.totalPrice > 0 && <button className="admin__btn" onClick={() => onCopyPay(it)}>Copy pay link</button>}
                    <Link to={`/admin/itineraries/${it._id}/edit`} className="admin__btn">Edit</Link>
                    <button className="admin__btn" onClick={() => onDup(it)}>Duplicate</button>
                    <button className="admin__btn" onClick={() => onSaveAsTemplate(it)}>Save as template</button>
                    <button className="admin__btn admin__btn--danger" onClick={() => onDelete(it)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="7" className="admin__state">
                  {isTpl ? 'No templates yet — open any itinerary and choose “Save as template”, or create one with “+ New template”.' : 'No itineraries yet — create your first one.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
