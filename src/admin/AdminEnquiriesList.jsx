import { Fragment, useEffect, useMemo, useState } from 'react'
import { adminListEnquiries, adminUpdateEnquiry, adminDeleteEnquiry } from '../api/client'

const STATUSES = ['all', 'new', 'contacted', 'closed']

const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) : '—'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
  day: 'numeric', month: 'short', year: 'numeric',
}) : '—'

export default function AdminEnquiriesList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState(null)

  const load = async () => {
    setLoading(true); setErr(null)
    try {
      const data = await adminListEnquiries({ status, q: q || undefined })
      setItems(data)
    } catch (e) {
      setErr(e?.response?.data?.error || e.message)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() /* eslint-disable-next-line */ }, [status])

  const onSearch = (e) => { e.preventDefault(); load() }

  const setStatusFor = async (id, newStatus) => {
    try {
      const updated = await adminUpdateEnquiry(id, { status: newStatus })
      setItems(curr => curr.map(it => it._id === id ? updated : it))
    } catch (e) {
      alert(e?.response?.data?.error || e.message)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this enquiry permanently?')) return
    try {
      await adminDeleteEnquiry(id)
      setItems(curr => curr.filter(it => it._id !== id))
    } catch (e) {
      alert(e?.response?.data?.error || e.message)
    }
  }

  const counts = useMemo(() => {
    const c = { all: items.length, new: 0, contacted: 0, closed: 0 }
    for (const it of items) c[it.status] = (c[it.status] || 0) + 1
    return c
  }, [items])

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Enquiries</h1>
          <p className="admin__page-sub">Submissions from the homepage search & enquiry form.</p>
        </div>
        <button className="admin__btn" onClick={load}>Refresh</button>
      </header>

      <div className="enq__toolbar">
        <div className="enq__filters">
          {STATUSES.map(s => (
            <button
              key={s}
              className={`enq__filter ${status === s ? 'is-active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {status === s && counts[s] !== undefined && <span className="enq__filter-count">{counts[s]}</span>}
            </button>
          ))}
        </div>
        <form className="enq__search" onSubmit={onSearch}>
          <input
            type="text"
            placeholder="Search name, email, phone, destination…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button type="submit" className="admin__btn">Search</button>
        </form>
      </div>

      {err && <div className="admin__state admin__state--err">{err}</div>}
      {loading && <div className="admin__state">Loading enquiries…</div>}
      {!loading && !err && items.length === 0 && (
        <div className="admin__state">No enquiries found.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="enq__table-wrap">
          <table className="enq__table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Type</th>
                <th>Trip</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <Fragment key={it._id}>
                  <tr className={`enq__row enq__row--${it.status}`}>
                    <td data-label="Received" className="enq__cell-date">{fmt(it.createdAt)}</td>
                    <td data-label="Name" className="enq__cell-name">
                      <strong>{it.name}</strong>
                    </td>
                    <td data-label="Contact" className="enq__cell-contact">
                      <a href={`mailto:${it.email}`}>{it.email}</a>
                      <a href={`tel:${it.phone}`}>{it.phone}</a>
                    </td>
                    <td data-label="Type"><span className="enq__type">{it.type || 'Holidays'}</span></td>
                    <td data-label="Trip" className="enq__cell-trip">
                      <strong>{it.destination || '—'}</strong>
                      {it.from && <small>from {it.from}</small>}
                      <small>{fmtDate(it.travelDate)} · {it.travellers || '—'}</small>
                    </td>
                    <td data-label="Status">
                      <select
                        value={it.status}
                        onChange={e => setStatusFor(it._id, e.target.value)}
                        className={`enq__status enq__status--${it.status}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="enq__actions">
                      <button
                        className="admin__btn admin__btn--sm"
                        onClick={() => setOpenId(openId === it._id ? null : it._id)}
                      >
                        {openId === it._id ? 'Hide' : 'View'}
                      </button>
                      <button
                        className="admin__btn admin__btn--sm admin__btn--danger"
                        onClick={() => remove(it._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  {openId === it._id && (
                    <tr className="enq__detail-row">
                      <td colSpan="7">
                        <div className="enq__detail">
                          <div><span>Source</span><strong>{it.source || 'website'}</strong></div>
                          <div><span>Travellers</span><strong>{it.travellers || '—'}</strong></div>
                          <div><span>Travel date</span><strong>{fmtDate(it.travelDate)}</strong></div>
                          <div className="enq__detail-msg">
                            <span>Message</span>
                            <p>{it.message || <em>(none)</em>}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
