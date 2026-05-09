import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adminListPackages,
  adminUpdatePackage,
  adminListHomeSections,
  adminUpdateHomeSection,
} from '../api/client'
import { HOME_SECTIONS } from '../config/homeSections'

export default function AdminHomepageLayout() {
  const [items, setItems] = useState([])
  const [overrides, setOverrides] = useState({})
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [editingKey, setEditingKey] = useState(null)
  const [editDraft, setEditDraft] = useState({ tag: '', title: '', subtitle: '', visible: true })

  const load = () => {
    setLoading(true); setErr(null)
    Promise.all([adminListPackages(), adminListHomeSections().catch(() => ({}))])
      .then(([pkgs, ovr]) => {
        setItems(pkgs)
        setOverrides(ovr || {})
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  // Merge default + admin override for display
  const sectionFor = (s) => {
    const ovr = overrides[s.key] || {}
    const pick = (k) => (ovr[k] != null && ovr[k] !== '' ? ovr[k] : s[k])
    return {
      ...s,
      tag: pick('tag'),
      title: pick('title'),
      subtitle: pick('subtitle'),
      visible: ovr.visible !== false,
      isOverridden: !!overrides[s.key],
    }
  }

  const startEdit = (s) => {
    setEditingKey(s.key)
    const ovr = overrides[s.key] || {}
    setEditDraft({
      tag: ovr.tag ?? s.tag ?? '',
      title: ovr.title ?? s.title ?? '',
      subtitle: ovr.subtitle ?? s.subtitle ?? '',
      visible: ovr.visible !== false,
    })
  }

  const cancelEdit = () => setEditingKey(null)

  const saveEdit = async (key) => {
    setBusyId('section:' + key)
    try {
      await adminUpdateHomeSection(key, editDraft)
      setEditingKey(null)
      load()
    } finally { setBusyId(null) }
  }

  const resetSection = async (key) => {
    setBusyId('section:' + key)
    try {
      await adminUpdateHomeSection(key, { tag: '', title: '', subtitle: '', visible: true })
      setEditingKey(null)
      load()
    } finally { setBusyId(null) }
  }

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
          {HOME_SECTIONS.map((s) => {
            const live = sectionFor(s)
            const isEditing = editingKey === s.key
            return (
            <div key={s.key} className={`admin__home-col ${live.visible ? '' : 'is-hidden'}`}>
              <div className="admin__home-col-head">
                {!isEditing ? (
                  <>
                    <span className="admin__home-col-tag">{live.tag || s.label}</span>
                    <h3>{live.title || s.label}</h3>
                    <small>{live.subtitle}</small>
                    <div className="admin__home-col-actions">
                      <button type="button" className="admin__btn admin__btn--sm" onClick={() => startEdit(s)}>
                        Edit heading
                      </button>
                      {live.isOverridden && (
                        <button
                          type="button"
                          className="admin__btn admin__btn--sm"
                          onClick={() => resetSection(s.key)}
                          disabled={busyId === 'section:' + s.key}
                          title="Restore default heading"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <span className="admin__home-col-count">
                      {grouped[s.key].length} package{grouped[s.key].length === 1 ? '' : 's'}
                      {!live.visible && ' · hidden'}
                    </span>
                  </>
                ) : (
                  <div className="admin__home-edit">
                    <label>
                      <span>Tag (small badge)</span>
                      <input
                        type="text"
                        value={editDraft.tag}
                        onChange={(e) => setEditDraft(d => ({ ...d, tag: e.target.value }))}
                        placeholder={s.tag}
                      />
                    </label>
                    <label>
                      <span>Title</span>
                      <input
                        type="text"
                        value={editDraft.title}
                        onChange={(e) => setEditDraft(d => ({ ...d, title: e.target.value }))}
                        placeholder={s.title}
                      />
                    </label>
                    <label>
                      <span>Subtitle</span>
                      <textarea
                        rows="2"
                        value={editDraft.subtitle}
                        onChange={(e) => setEditDraft(d => ({ ...d, subtitle: e.target.value }))}
                        placeholder={s.subtitle}
                      />
                    </label>
                    <label className="admin__home-edit-toggle">
                      <input
                        type="checkbox"
                        checked={editDraft.visible}
                        onChange={(e) => setEditDraft(d => ({ ...d, visible: e.target.checked }))}
                      />
                      <span>Show this shelf on the homepage</span>
                    </label>
                    <div className="admin__home-edit-actions">
                      <button type="button" className="admin__btn admin__btn--sm" onClick={cancelEdit}>Cancel</button>
                      <button
                        type="button"
                        className="admin__btn admin__btn--primary admin__btn--sm"
                        onClick={() => saveEdit(s.key)}
                        disabled={busyId === 'section:' + s.key}
                      >
                        {busyId === 'section:' + s.key ? 'Saving…' : 'Save heading'}
                      </button>
                    </div>
                  </div>
                )}
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
          )})}

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
