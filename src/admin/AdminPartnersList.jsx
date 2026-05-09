import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListPartners, adminDeletePartner, adminUpdatePartner } from '../api/client'

export default function AdminPartnersList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const load = () => {
    setLoading(true); setErr(null)
    adminListPartners()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDelete = async (id, name) => {
    if (!confirm(`Delete partner "${name}"? This cannot be undone.`)) return
    await adminDeletePartner(id)
    load()
  }
  const toggleActive = async (it) => {
    await adminUpdatePartner(it._id, { active: !it.active })
    load()
  }

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Official Partners</h1>
          <p className="admin__page-sub">Logos shown in the homepage partners strip. Tip: use transparent PNG/SVG logos for the cleanest look.</p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load}>Refresh</button>
          <Link className="admin__btn admin__btn--primary" to="/admin/partners/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Partner
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
                <th>Logo</th>
                <th>Name</th>
                <th>Link</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td>
                    {it.logoUrl
                      ? <img src={it.logoUrl} alt={it.name} className="admin__thumb admin__thumb--contain" />
                      : <div className="admin__thumb admin__thumb--placeholder">P</div>}
                  </td>
                  <td><strong>{it.name}</strong></td>
                  <td className="admin__cell-trim">
                    {it.link ? <a href={it.link} target="_blank" rel="noreferrer">{it.link}</a> : '—'}
                  </td>
                  <td>{it.order || 0}</td>
                  <td>
                    <span className={`admin__pill ${it.active ? 'admin__pill--ok' : 'admin__pill--off'}`}>
                      {it.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="admin__row-actions">
                    <Link to={`/admin/partners/${it._id}/edit`} className="admin__btn">Edit</Link>
                    <button className="admin__btn" onClick={() => toggleActive(it)}>{it.active ? 'Hide' : 'Show'}</button>
                    <button className="admin__btn admin__btn--danger" onClick={() => onDelete(it._id, it.name)}>Delete</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="6" className="admin__state">No partners yet. Click "New Partner" to add one.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
