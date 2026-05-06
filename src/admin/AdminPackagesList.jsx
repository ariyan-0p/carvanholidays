import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListPackages, adminDeletePackage } from '../api/client'

export default function AdminPackagesList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => {
    setLoading(true)
    adminListPackages()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onDeactivate = async (slug) => {
    if (!confirm(`Deactivate "${slug}"? It will be hidden from the public site.`)) return
    await adminDeletePackage(slug, false)
    load()
  }
  const onHardDelete = async (slug) => {
    if (!confirm(`PERMANENTLY delete "${slug}"? This cannot be undone.`)) return
    await adminDeletePackage(slug, true)
    load()
  }

  const visible = items.filter(p => {
    if (!filter) return true
    const f = filter.toLowerCase()
    return [p.title, p.slug, p.city, p.country, p.destination]
      .filter(Boolean).some(v => v.toLowerCase().includes(f))
  })

  return (
    <div className="admin__page">
      <header className="admin__header">
        <h1>Packages</h1>
        <Link className="admin__btn admin__btn--primary" to="/admin/packages/new">+ New Package</Link>
      </header>

      <input
        className="admin__search"
        placeholder="Search by title, city, country…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      {loading && <div className="admin__state">Loading…</div>}
      {err && <div className="admin__state admin__state--err">{err}</div>}

      {!loading && !err && (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th></th>
                <th>Title</th>
                <th>City</th>
                <th>Country</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(p => (
                <tr key={p._id || p.slug}>
                  <td>{p.image && <img src={p.image} alt="" className="admin__thumb" />}</td>
                  <td>
                    <Link to={`/admin/packages/${p.slug}/edit`}>{p.title}</Link>
                    <div className="admin__sub">{p.slug}</div>
                  </td>
                  <td>{p.city || '—'}</td>
                  <td>{p.country || '—'}</td>
                  <td>{p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : '—'}</td>
                  <td>
                    <span className={`admin__pill ${p.active ? 'admin__pill--ok' : 'admin__pill--off'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="admin__row-actions">
                    <Link to={`/admin/packages/${p.slug}/edit`} className="admin__btn">Edit</Link>
                    {p.active && <button className="admin__btn" onClick={() => onDeactivate(p.slug)}>Deactivate</button>}
                    <button className="admin__btn admin__btn--danger" onClick={() => onHardDelete(p.slug)}>Delete</button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan="7" className="admin__state">No packages.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
