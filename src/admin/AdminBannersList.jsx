import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adminListBanners,
  adminDeleteBanner,
  adminUpdateBanner,
} from '../api/client'

const SLOT_LABELS = {
  'after-destinations': 'After "Popular Destinations"',
  'before-region':      'Before "Explore by Region"',
}

const SLOT_DESCRIPTIONS = {
  'after-destinations':
    'Shown on the homepage between the Popular Destinations grid and the Featured Holiday Packages shelf.',
  'before-region':
    'Shown on the homepage just above the "Explore by Region" section.',
}

const mediaUrl = (u) => (u && u.startsWith('/uploads/') ? u : u)

export default function AdminBannersList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const load = () => {
    setLoading(true); setErr(null)
    adminListBanners()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id, title) => {
    if (!confirm(`Delete "${title || 'this banner'}"? This cannot be undone.`)) return
    await adminDeleteBanner(id)
    load()
  }
  const toggleActive = async (it) => {
    await adminUpdateBanner(it._id, { active: !it.active })
    load()
  }

  const grouped = items.reduce((acc, it) => {
    (acc[it.slot] = acc[it.slot] || []).push(it)
    return acc
  }, {})

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Promo Banners</h1>
          <p className="admin__page-sub">
            Wide promotional banners shown between sections on the homepage. Multiple banners in the same slot rotate as a carousel every 6 seconds.
          </p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load}>Refresh</button>
          <Link className="admin__btn admin__btn--primary" to="/admin/banners/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Banner
          </Link>
        </div>
      </header>

      <div className="admin__form-section">
        <strong>Recommended banner sizes</strong>
        <ul style={{ margin: '8px 0 0 18px', lineHeight: 1.7, fontSize: 14, color: '#475569' }}>
          <li><b>Desktop banner:</b> 1920 × 520 px (≈3.7 : 1 wide), JPG or PNG, ≤ 500 KB</li>
          <li><b>Mobile banner (optional):</b> 800 × 800 px (1 : 1 square) or 800 × 1000 px, JPG, ≤ 300 KB</li>
          <li>Keep all important text away from the very edges — banners are slightly clipped on small screens.</li>
        </ul>
      </div>

      {loading && <div className="admin__state">Loading…</div>}
      {err && <div className="admin__state admin__state--err">{err}</div>}

      {!loading && !err && (
        <>
          {Object.keys(SLOT_LABELS).map((slotKey) => (
            <section key={slotKey} className="admin__form-section">
              <label className="admin__label">{SLOT_LABELS[slotKey]}</label>
              <p className="admin__help">{SLOT_DESCRIPTIONS[slotKey]}</p>

              <div className="admin__table-wrap">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Title</th>
                      <th>Link</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(grouped[slotKey] || []).map((it) => (
                      <tr key={it._id}>
                        <td>
                          <img
                            src={mediaUrl(it.imageUrl)}
                            alt={it.title || ''}
                            style={{ width: 180, height: 56, objectFit: 'cover', borderRadius: 4 }}
                          />
                        </td>
                        <td className="admin__cell-trim"><b>{it.title || '—'}</b></td>
                        <td className="admin__cell-trim">{it.link || '—'}</td>
                        <td>{it.order || 0}</td>
                        <td>
                          <span className={`admin__pill ${it.active ? 'admin__pill--ok' : 'admin__pill--off'}`}>
                            {it.active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="admin__row-actions">
                          <Link className="admin__btn" to={`/admin/banners/${it._id}/edit`}>Edit</Link>
                          <button className="admin__btn" onClick={() => toggleActive(it)}>{it.active ? 'Hide' : 'Show'}</button>
                          <button className="admin__btn admin__btn--danger" onClick={() => onDelete(it._id, it.title)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {(!grouped[slotKey] || grouped[slotKey].length === 0) && (
                      <tr><td colSpan="6" className="admin__state">No banners in this slot yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  )
}
