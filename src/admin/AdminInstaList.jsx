import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListInsta, adminDeleteInsta, adminUpdateInsta } from '../api/client'

export default function AdminInstaList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const load = () => {
    setLoading(true); setErr(null)
    adminListInsta()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id) => {
    if (!confirm('Delete this Instagram post? This cannot be undone.')) return
    await adminDeleteInsta(id)
    load()
  }
  const toggleActive = async (it) => {
    await adminUpdateInsta(it._id, { active: !it.active })
    load()
  }

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Instagram Reels</h1>
          <p className="admin__page-sub">Add Instagram videos to the homepage showcase. Each card links straight to your Instagram post.</p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load}>Refresh</button>
          <Link className="admin__btn admin__btn--primary" to="/admin/insta/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Reel
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
                <th>Caption</th>
                <th>Instagram link</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td>
                    {it.videoUrl
                      ? <video src={it.videoUrl} className="admin__thumb" muted />
                      : it.posterUrl
                        ? <img src={it.posterUrl} alt="" className="admin__thumb" />
                        : <div className="admin__thumb admin__thumb--placeholder">IG</div>}
                  </td>
                  <td className="admin__cell-trim">{it.caption || '—'}</td>
                  <td className="admin__cell-trim">
                    <a href={it.instaUrl} target="_blank" rel="noreferrer">{it.instaUrl}</a>
                  </td>
                  <td>{it.order || 0}</td>
                  <td>
                    <span className={`admin__pill ${it.active ? 'admin__pill--ok' : 'admin__pill--off'}`}>
                      {it.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin__row-actions">
                    <Link to={`/admin/insta/${it._id}/edit`} className="admin__btn">Edit</Link>
                    <button className="admin__btn" onClick={() => toggleActive(it)}>{it.active ? 'Hide' : 'Show'}</button>
                    <button className="admin__btn admin__btn--danger" onClick={() => onDelete(it._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="6" className="admin__state">No Instagram reels yet. Click "New Reel" to add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
