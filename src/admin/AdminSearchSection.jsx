import { useEffect, useState } from 'react'
import { adminGetSearchSection, adminUpdateSearchSection } from '../api/client'

const ICON_KEYS = ['group', 'fire', 'sparkles', 'rocket', 'car', 'beach', 'target', 'info', 'globe', 'compass', 'map', 'heart', 'mountain', 'leaf']
const BADGE_OPTIONS = ['', 'Popular', 'Hot', 'New', 'Trending', 'Best Value', 'Limited']
const TABS = ['Holidays', 'Flights', 'Hotels', 'Visa', 'Cars']

const blankCategory = () => ({
  label: '', tagline: '', to: '/packages', color: '#14b8a6', icon: 'sparkles', badge: '', order: 99, active: true,
})

export default function AdminSearchSection() {
  const [cfg, setCfg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    adminGetSearchSection()
      .then(setCfg)
      .catch((e) => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }))

  // Category helpers
  const updateCat = (i, patch) => setCfg((c) => {
    const cats = [...(c.categories || [])]
    cats[i] = { ...cats[i], ...patch }
    return { ...c, categories: cats }
  })
  const addCat = () => setCfg((c) => ({ ...c, categories: [...(c.categories || []), blankCategory()] }))
  const removeCat = (i) => setCfg((c) => ({ ...c, categories: (c.categories || []).filter((_, idx) => idx !== i) }))
  const moveCat = (i, dir) => setCfg((c) => {
    const cats = [...(c.categories || [])]
    const j = i + dir
    if (j < 0 || j >= cats.length) return c
    ;[cats[i], cats[j]] = [cats[j], cats[i]]
    return { ...c, categories: cats }
  })

  // Stats helpers
  const updateStat = (i, patch) => setCfg((c) => {
    const stats = [...(c.stats || [])]
    stats[i] = { ...stats[i], ...patch }
    return { ...c, stats }
  })
  const addStat = () => setCfg((c) => ({ ...c, stats: [...(c.stats || []), { value: '', label: '' }] }))
  const removeStat = (i) => setCfg((c) => ({ ...c, stats: (c.stats || []).filter((_, idx) => idx !== i) }))

  // Popular helpers
  const updatePopular = (tab, items) => setCfg((c) => {
    const list = [...(c.popularByTab || [])]
    const idx = list.findIndex(x => x.tab === tab)
    if (idx >= 0) list[idx] = { ...list[idx], items }
    else list.push({ tab, items })
    return { ...c, popularByTab: list }
  })

  const popularFor = (tab) => (cfg?.popularByTab || []).find(x => x.tab === tab)?.items || []

  const save = async () => {
    setBusy(true); setErr(null)
    try {
      const out = await adminUpdateSearchSection(cfg)
      setCfg(out)
      setSavedAt(Date.now())
    } catch (e) {
      setErr(e?.response?.data?.error || e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="admin__page"><div className="admin__state">Loading…</div></div>
  if (!cfg) return <div className="admin__page"><div className="admin__state admin__state--err">{err || 'Could not load config.'}</div></div>

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Search Section</h1>
          <p className="admin__page-sub">
            Edit everything inside the homepage search panel: the heading, the live stats ribbon, the eight category tiles, and the "Popular" quick-pick chips for each tab.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {savedAt && <span style={{ fontSize: 12, color: '#5a8b7a' }}>Saved {new Date(savedAt).toLocaleTimeString()}</span>}
          <button className="admin__btn admin__btn--primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </header>

      {err && <div className="admin__state admin__state--err">{err}</div>}

      {/* === Header copy === */}
      <section className="admin__form-section">
        <label className="admin__label">Header copy</label>
        <p className="admin__help">Shown above the search card. The accent slice is rendered italic + coloured inside the headline.</p>
        <div className="admin__form-grid">
          <label className="admin__field">
            <span>Eyebrow (small uppercase line)</span>
            <input type="text" value={cfg.eyebrow || ''} onChange={e => set('eyebrow', e.target.value)} />
          </label>
          <label className="admin__field admin__field--wide">
            <span>Headline</span>
            <input type="text" value={cfg.headline || ''} onChange={e => set('headline', e.target.value)} />
          </label>
          <label className="admin__field">
            <span>Headline accent (italic-coloured slice)</span>
            <input type="text" value={cfg.headlineAccent || ''} onChange={e => set('headlineAccent', e.target.value)} placeholder="e.g. go next?" />
          </label>
          <label className="admin__field admin__field--wide">
            <span>Lede (short paragraph under headline)</span>
            <textarea rows={2} value={cfg.lede || ''} onChange={e => set('lede', e.target.value)} />
          </label>
        </div>
      </section>

      {/* === Stats ribbon === */}
      <section className="admin__form-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label className="admin__label" style={{ margin: 0 }}>Live stats ribbon</label>
          <label style={{ fontSize: 13, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={!!cfg.showStats} onChange={e => set('showStats', e.target.checked)} />
            Show on homepage
          </label>
        </div>
        <p className="admin__help">Pairs of value + label rendered as a tight stat strip. Best with 3–4 entries.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(cfg.stats || []).map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 10 }}>
              <input type="text" value={s.value || ''} placeholder="e.g. 40+" onChange={e => updateStat(i, { value: e.target.value })} />
              <input type="text" value={s.label || ''} placeholder="e.g. Curated packages" onChange={e => updateStat(i, { label: e.target.value })} />
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => removeStat(i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="admin__btn" onClick={addStat} style={{ alignSelf: 'flex-start' }}>+ Add stat</button>
        </div>
      </section>

      {/* === Categories === */}
      <section className="admin__form-section">
        <label className="admin__label">Category tiles</label>
        <p className="admin__help">The "Pick a way to explore" tiles. Drag-free reordering via ↑ ↓ buttons.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(cfg.categories || []).map((c, i) => (
            <div key={i} style={{ border: '1px solid rgba(8,67,74,0.1)', borderRadius: 12, padding: 14, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: c.color || '#14b8a6' }} />
                <strong style={{ flex: 1 }}>{c.label || '(unnamed)'}</strong>
                <button type="button" className="admin__btn" onClick={() => moveCat(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" className="admin__btn" onClick={() => moveCat(i, +1)} disabled={i === (cfg.categories.length - 1)}>↓</button>
                <label style={{ fontSize: 12, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <input type="checkbox" checked={c.active !== false} onChange={e => updateCat(i, { active: e.target.checked })} />
                  Active
                </label>
                <button type="button" className="admin__btn admin__btn--danger" onClick={() => removeCat(i)}>Delete</button>
              </div>

              <div className="admin__form-grid">
                <label className="admin__field">
                  <span>Label</span>
                  <input type="text" value={c.label || ''} onChange={e => updateCat(i, { label: e.target.value })} />
                </label>
                <label className="admin__field">
                  <span>Link (path or URL)</span>
                  <input type="text" value={c.to || ''} onChange={e => updateCat(i, { to: e.target.value })} placeholder="/packages" />
                </label>
                <label className="admin__field admin__field--wide">
                  <span>Tagline</span>
                  <input type="text" value={c.tagline || ''} onChange={e => updateCat(i, { tagline: e.target.value })} />
                </label>
                <label className="admin__field">
                  <span>Accent colour</span>
                  <input type="color" value={c.color || '#14b8a6'} onChange={e => updateCat(i, { color: e.target.value })} />
                </label>
                <label className="admin__field">
                  <span>Icon</span>
                  <select value={c.icon || 'sparkles'} onChange={e => updateCat(i, { icon: e.target.value })}>
                    {ICON_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </label>
                <label className="admin__field">
                  <span>Badge</span>
                  <select value={c.badge || ''} onChange={e => updateCat(i, { badge: e.target.value })}>
                    {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || '— none —'}</option>)}
                  </select>
                </label>
              </div>
            </div>
          ))}
          <button type="button" className="admin__btn" onClick={addCat} style={{ alignSelf: 'flex-start' }}>+ Add category</button>
        </div>
      </section>

      {/* === Popular searches per tab === */}
      <section className="admin__form-section">
        <label className="admin__label">"Popular" quick-pick chips</label>
        <p className="admin__help">Comma-separated. These appear below the search form for each tab type.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {TABS.map((tab) => {
            const items = popularFor(tab)
            return (
              <label key={tab} className="admin__field">
                <span>{tab}</span>
                <input
                  type="text"
                  value={items.join(', ')}
                  onChange={e => updatePopular(tab, e.target.value.split(',').map(x => x.trim()).filter(Boolean))}
                  placeholder="e.g. Bali, Maldives, Goa"
                />
              </label>
            )
          })}
        </div>
      </section>

      <div className="admin__form-actions">
        <button type="button" className="admin__btn admin__btn--primary" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
