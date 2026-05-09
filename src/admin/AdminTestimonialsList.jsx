import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListTestimonials, adminDeleteTestimonial, adminUpdateTestimonial } from '../api/client'

const KIND_LABEL = { video: 'Video', photo: 'Photo', message: 'Message' }

export default function AdminTestimonialsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => {
    setLoading(true); setErr(null)
    adminListTestimonials()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id, name) => {
    if (!confirm(`Delete testimonial from "${name}"? This cannot be undone.`)) return
    await adminDeleteTestimonial(id)
    load()
  }

  const toggleActive = async (it) => {
    await adminUpdateTestimonial(it._id, { active: !it.active })
    load()
  }

  const visible = items.filter((t) => {
    if (!filter) return true
    const f = filter.toLowerCase()
    return [t.name, t.quote, t.location, t.trip, t.kind].filter(Boolean).some(v => String(v).toLowerCase().includes(f))
  })

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Testimonials</h1>
          <p className="admin__page-sub">Add video, photo, or written reviews shown on the homepage.</p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load}>Refresh</button>
          <Link className="admin__btn admin__btn--primary" to="/admin/testimonials/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Testimonial
          </Link>
        </div>
      </header>

      <input
        className="admin__search"
        placeholder="Search by name, quote, type…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      {loading && <div className="admin__state">Loading testimonials…</div>}
      {err && <div className="admin__state admin__state--err">{err}</div>}

      {!loading && !err && (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th></th>
                <th>Type</th>
                <th>Name</th>
                <th>Quote</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t._id}>
                  <td>
                    {t.kind === 'video' && t.mediaUrl
                      ? <video src={t.mediaUrl} className="admin__thumb" muted />
                      : t.kind === 'photo' && t.mediaUrl
                        ? <img src={t.mediaUrl} alt="" className="admin__thumb" />
                        : <div className="admin__thumb admin__thumb--placeholder">"</div>}
                  </td>
                  <td>{KIND_LABEL[t.kind] || t.kind}</td>
                  <td>
                    <strong>{t.name}</strong>
                    <div className="admin__sub">{[t.location, t.trip].filter(Boolean).join(' • ') || '—'}</div>
                  </td>
                  <td className="admin__cell-trim">{t.quote || '—'}</td>
                  <td>{t.order || 0}</td>
                  <td>
                    <span className={`admin__pill ${t.active ? 'admin__pill--ok' : 'admin__pill--off'}`}>
                      {t.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin__row-actions">
                    <Link to={`/admin/testimonials/${t._id}/edit`} className="admin__btn">Edit</Link>
                    <button className="admin__btn" onClick={() => toggleActive(t)}>{t.active ? 'Hide' : 'Show'}</button>
                    <button className="admin__btn admin__btn--danger" onClick={() => onDelete(t._id, t.name)}>Delete</button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan="7" className="admin__state">No testimonials yet. Click "New Testimonial" to add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
