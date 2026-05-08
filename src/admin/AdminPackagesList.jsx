import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListPackages, adminDeletePackage } from '../api/client'

export default function AdminPackagesList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [filter, setFilter] = useState('')

  const load = () => {
    setLoading(true); setErr(null)
    adminListPackages()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const stats = useMemo(() => {
    const active = items.filter(p => p.active).length
    const featured = items.filter(p => p.featured && p.active).length
    const cities = new Set(items.filter(p => p.active && p.city).map(p => p.city)).size
    const countries = new Set(items.filter(p => p.active && p.country).map(p => p.country)).size
    return { total: items.length, active, featured, cities, countries }
  }, [items])

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
        <div>
          <h1>Packages</h1>
          <p className="admin__page-sub">Curate, edit, and manage holiday packages.</p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load} title="Refresh list">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Refresh
          </button>
          <Link className="admin__btn admin__btn--primary" to="/admin/packages/new">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Package
          </Link>
        </div>
      </header>

      {!loading && !err && items.length > 0 && (
        <div className="admin__stats">
          <div className="admin__stat">
            <span className="admin__stat-label">Total packages</span>
            <span className="admin__stat-value">{stats.total}</span>
            <span className="admin__stat-meta">{stats.active} active</span>
          </div>
          <div className="admin__stat">
            <span className="admin__stat-label">Featured on home</span>
            <span className="admin__stat-value">{stats.featured}</span>
            <span className="admin__stat-meta">Visible on homepage</span>
          </div>
          <div className="admin__stat">
            <span className="admin__stat-label">Cities</span>
            <span className="admin__stat-value">{stats.cities}</span>
            <span className="admin__stat-meta">Across {stats.countries} countries</span>
          </div>
        </div>
      )}

      <input
        className="admin__search"
        placeholder="Search by title, city, country…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />

      {loading && <div className="admin__state">Loading packages…</div>}
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
