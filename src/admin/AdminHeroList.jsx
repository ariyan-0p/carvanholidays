import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adminListHeroSlides,
  adminDeleteHeroSlide,
  adminUpdateHeroSlide,
} from '../api/client'

const API_ORIGIN = ''

const mediaUrl = (u) =>
  u && u.startsWith('/uploads/') ? `${API_ORIGIN}${u}` : u

export default function AdminHeroList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const load = () => {
    setLoading(true); setErr(null)
    adminListHeroSlides()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id, label) => {
    if (!confirm(`Delete "${label || 'this slide'}"? This cannot be undone.`)) return
    await adminDeleteHeroSlide(id)
    load()
  }
  const toggleActive = async (it) => {
    await adminUpdateHeroSlide(it._id, { active: !it.active })
    load()
  }

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Hero Banner</h1>
          <p className="admin__page-sub">
            Slides shown on the homepage hero. You can mix images and videos — each slide auto-rotates every 5 seconds.
          </p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load}>Refresh</button>
          <Link className="admin__btn admin__btn--primary" to="/admin/hero/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Hero Slide
          </Link>
        </div>
      </header>

      <div className="admin__form-section">
        <strong>Recommended media sizes</strong>
        <ul style={{ margin: '8px 0 0 18px', lineHeight: 1.7, fontSize: 14, color: '#475569' }}>
          <li><b>Image background:</b> 1920 × 1080 px (16:9 landscape), JPG or PNG, ≤ 2 MB</li>
          <li><b>Video background:</b> 1920 × 1080 px, MP4 (H.264), 8–15 seconds, ≤ 20 MB ideal (80 MB max)</li>
          <li><b>Video poster (optional):</b> 1920 × 1080 px JPG — shown while the video loads</li>
          <li><b>Side cards (optional, up to 3):</b> 400 × 600 px (2:3 portrait), JPG, ≤ 500 KB each</li>
        </ul>
      </div>

      {loading && <div className="admin__state">Loading…</div>}
      {err && <div className="admin__state admin__state--err">{err}</div>}

      {!loading && !err && (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Preview</th>
                <th>Kind</th>
                <th>Destination</th>
                <th>Label</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td>
                    {it.kind === 'video' ? (
                      <video
                        src={mediaUrl(it.mediaUrl)}
                        muted playsInline
                        style={{ width: 110, height: 62, objectFit: 'cover', borderRadius: 4, background: '#000' }}
                      />
                    ) : (
                      <img
                        src={mediaUrl(it.mediaUrl)}
                        alt={it.destination || it.label || ''}
                        style={{ width: 110, height: 62, objectFit: 'cover', borderRadius: 4 }}
                      />
                    )}
                  </td>
                  <td><code>{it.kind}</code></td>
                  <td className="admin__cell-trim"><b>{it.destination || '—'}</b></td>
                  <td className="admin__cell-trim">{it.label || '—'}</td>
                  <td>{it.order || 0}</td>
                  <td>
                    <span className={`admin__pill ${it.active ? 'admin__pill--ok' : 'admin__pill--off'}`}>
                      {it.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin__row-actions">
                    <Link className="admin__btn" to={`/admin/hero/${it._id}/edit`}>Edit</Link>
                    <button className="admin__btn" onClick={() => toggleActive(it)}>{it.active ? 'Hide' : 'Show'}</button>
                    <button className="admin__btn admin__btn--danger" onClick={() => onDelete(it._id, it.destination)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="7" className="admin__state">No hero slides yet. The site will fall back to default slides until you add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
