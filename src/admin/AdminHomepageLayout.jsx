import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminListPackages, adminUpdatePackage } from '../api/client'
import { HOME_SECTIONS } from '../config/homeSections'

export default function AdminHomepageLayout() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    setLoading(true); setErr(null)
    adminListPackages()
      .then(setItems)
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const grouped = useMemo(() => {
    const m = Object.fromEntries(HOME_SECTIONS.map(s => [s.key, []]))
    for (const p of items) {
      if (!p.active) continue
      const sections = Array.isArray(p.homepageSections) ? p.homepageSections : []
      // Honour the legacy `featured` flag too
      const all = sections.includes('featured') || !p.featured ? sections : ['featured', ...sections]
      for (const k of all) if (m[k]) m[k].push(p)
    }
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => (a.homepageOrder || 0) - (b.homepageOrder || 0))
    }
    return m
  }, [items])

  const toggleSection = async (pkg, key) => {
    const cur = new Set(pkg.homepageSections || [])
    if (cur.has(key)) cur.delete(key); else cur.add(key)
    setBusyId(pkg.slug)
    try {
      await adminUpdatePackage(pkg.slug, { homepageSections: Array.from(cur) })
      load()
    } finally { setBusyId(null) }
  }

  const setOrder = async (pkg, value) => {
    setBusyId(pkg.slug)
    try {
      await adminUpdatePackage(pkg.slug, { homepageOrder: Number(value) || 0 })
      load()
    } finally { setBusyId(null) }
  }

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Homepage Layout</h1>
          <p className="admin__page-sub">Decide which packages show in each homepage shelf, and in what order. Toggling a chip moves the package between shelves; the order field controls position within a shelf.</p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn" onClick={load}>Refresh</button>
          <Link className="admin__btn" to="/admin/packages">Back to packages</Link>
        </div>
      </header>

      {loading && <div className="admin__state">Loading packages…</div>}
      {err && <div className="admin__state admin__state--err">{err}</div>}

      {!loading && !err && (
        <div className="admin__home-layout">
          {HOME_SECTIONS.map((s) => (
            <div key={s.key} className="admin__home-col">
              <div className="admin__home-col-head">
                <span className="admin__home-col-tag">{s.tag || s.label}</span>
                <h3>{s.label}</h3>
                <small>{s.subtitle}</small>
                <span className="admin__home-col-count">{grouped[s.key].length} package{grouped[s.key].length === 1 ? '' : 's'}</span>
              </div>

              <div className="admin__home-col-body">
                {grouped[s.key].length === 0 && (
                  <div className="admin__home-empty">No packages assigned. Toggle a chip below to add one.</div>
                )}
                {grouped[s.key].map(pkg => (
                  <div key={pkg.slug} className="admin__home-item">
                    {pkg.image && <img src={pkg.image} alt="" className="admin__thumb admin__thumb--contain" />}
                    <div className="admin__home-item-body">
                      <Link to={`/admin/packages/${pkg.slug}/edit`} className="admin__home-item-title">{pkg.title}</Link>
                      <div className="admin__home-item-meta">
                        {pkg.city || '—'} · ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="admin__home-item-controls">
                        <label>
                          Order
                          <input
                            type="number"
                            defaultValue={pkg.homepageOrder || 0}
                            disabled={busyId === pkg.slug}
                            onBlur={(e) => {
                              const v = Number(e.target.value) || 0
                              if (v !== (pkg.homepageOrder || 0)) setOrder(pkg, v)
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="admin__btn admin__btn--sm"
                          disabled={busyId === pkg.slug}
                          onClick={() => toggleSection(pkg, s.key)}
                        >
                          Remove from {s.label}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="admin__home-all">
            <h3>All packages — toggle any shelf</h3>
            <p className="admin__sub">Click a section chip on a package to add or remove it from that shelf.</p>
            <div className="admin__home-all-list">
              {items.filter(p => p.active).map((pkg) => (
                <div key={pkg.slug} className="admin__home-item">
                  {pkg.image && <img src={pkg.image} alt="" className="admin__thumb admin__thumb--contain" />}
                  <div className="admin__home-item-body">
                    <Link to={`/admin/packages/${pkg.slug}/edit`} className="admin__home-item-title">{pkg.title}</Link>
                    <div className="admin__home-item-meta">{pkg.city || '—'} · ₹{Number(pkg.price || 0).toLocaleString('en-IN')}</div>
                    <div className="admin__sections-grid admin__sections-grid--inline">
                      {HOME_SECTIONS.map((s) => {
                        const isOn = (pkg.homepageSections || []).includes(s.key)
                          || (s.key === 'featured' && pkg.featured)
                        return (
                          <button
                            key={s.key}
                            type="button"
                            className={`admin__section-chip admin__section-chip--small ${isOn ? 'is-on' : ''}`}
                            disabled={busyId === pkg.slug}
                            onClick={() => toggleSection(pkg, s.key)}
                          >
                            {s.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
