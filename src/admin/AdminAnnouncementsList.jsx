import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListAnnouncements, adminDeleteAnnouncement, adminUpdateAnnouncement } from '../api/client'

export default function AdminAnnouncementsList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const load = () => {
    setLoading(true); setErr(null)
    adminListAnnouncements()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id, text) => {
    if (!confirm(`Delete "${text}"? This cannot be undone.`)) return
    await adminDeleteAnnouncement(id)
    load()
  }
  const toggleActive = async (it) => {
    await adminUpdateAnnouncement(it._id, { active: !it.active })
    load()
  }

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Announcement Bar</h1>
          <p className="admin__page-sub">Top-strip messages shown above the header. Multiple active items scroll as a marquee.</p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load}>Refresh</button>
          <Link className="admin__btn admin__btn--primary" to="/admin/announcements/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Announcement
          </Link>
        </div>
      </header>

      {loading && <div className="admin__state">Loading…</div>}
      {err && <div className="admin__state admin__state--err">{err}</div>}

      {!loading && !err && (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Text</th>
                <th>Link</th>
                <th>Animation</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td>
                    <span className="admin__ann-preview" style={{ background: it.bgColor, color: it.textColor }}>
                      {it.text.length > 32 ? it.text.slice(0, 30) + '…' : it.text}
                    </span>
                  </td>
                  <td className="admin__cell-trim">{it.text}</td>
                  <td className="admin__cell-trim">{it.link || '—'}</td>
                  <td>{it.animation || 'marquee'}</td>
                  <td>{it.order || 0}</td>
                  <td>
                    <span className={`admin__pill ${it.active ? 'admin__pill--ok' : 'admin__pill--off'}`}>
                      {it.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin__row-actions">
                    <Link className="admin__btn" to={`/admin/announcements/${it._id}/edit`}>Edit</Link>
                    <button className="admin__btn" onClick={() => toggleActive(it)}>{it.active ? 'Hide' : 'Show'}</button>
                    <button className="admin__btn admin__btn--danger" onClick={() => onDelete(it._id, it.text)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="7" className="admin__state">No announcements yet. Click "New Announcement" to add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
