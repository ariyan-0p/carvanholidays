import { useEffect, useState } from 'react'
import {
  adminGetPopupConfig,
  adminUpdatePopupConfig,
  adminUploadImages,
} from '../api/client'

const FIELD_KEYS = [
  { key: 'destination', label: 'Destination' },
  { key: 'travelDate',  label: 'Travel date' },
  { key: 'travellers',  label: 'Travellers' },
  { key: 'tripType',    label: 'Trip type' },
  { key: 'budget',      label: 'Budget' },
  { key: 'name',        label: 'Name' },
  { key: 'phone',       label: 'Phone' },
  { key: 'email',       label: 'Email' },
  { key: 'message',     label: 'Message / notes' },
]

export default function AdminPopupConfig() {
  const [cfg, setCfg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState(null)
  const [savedAt, setSavedAt] = useState(null)

  useEffect(() => {
    adminGetPopupConfig()
      .then((c) => setCfg(c))
      .catch((e) => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }))
  const setField = (k, v) => setCfg((c) => ({ ...c, fields: { ...(c.fields || {}), [k]: v } }))

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr(null)
    try {
      const { urls } = await adminUploadImages([file])
      if (urls?.[0]) set('bannerUrl', urls[0])
    } catch (er) {
      setErr(er?.response?.data?.error || er.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const save = async (e) => {
    e?.preventDefault()
    if (!cfg) return
    setBusy(true); setErr(null); setSavedAt(null)
    try {
      const updated = await adminUpdatePopupConfig(cfg)
      setCfg(updated)
      setSavedAt(new Date())
    } catch (er) {
      setErr(er?.response?.data?.error || er.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading || !cfg) return <div className="admin__page"><div className="admin__state">Loading…</div></div>

  const fields = cfg.fields || {}

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>Popup Form</h1>
          <p className="admin__page-sub">Edit the auto-popup that appears every few seconds on the public site. The left panel is the banner; the right panel is the enquiry form.</p>
        </div>
        <div className="admin__header-actions">
          <button className="admin__btn admin__btn--primary" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </header>

      {err && <div className="admin__state admin__state--err">{err}</div>}
      {savedAt && <div className="admin__state" style={{ color: '#166534', padding: 12 }}>Saved at {savedAt.toLocaleTimeString()}</div>}

      <form className="admin__form" onSubmit={save}>
        {/* Live preview */}
        <section className="admin__form-block">
          <h3>Live preview</h3>
          <PopupPreview cfg={cfg} />
        </section>

        {/* Banner panel (left side of popup) */}
        <section className="admin__form-block">
          <h3>Left banner</h3>
          {cfg.bannerUrl ? (
            <div className="admin__media-preview">
              <img src={cfg.bannerUrl} alt="" className="admin__media-preview-el" />
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('bannerUrl', '')}>Remove image</button>
            </div>
          ) : (
            <label className="admin__upload">
              <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
              <span>{uploading ? 'Uploading…' : 'Click to upload banner image'}</span>
              <small>Tall portrait or landscape works. If empty, a teal-to-green gradient is used.</small>
            </label>
          )}

          <div className="admin__form-grid" style={{ marginTop: 12 }}>
            <label className="admin__field admin__field--wide">
              <span>Banner heading</span>
              <input type="text" value={cfg.bannerHeading || ''} onChange={(e) => set('bannerHeading', e.target.value)} placeholder="Up to 30% off" />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Banner subheading</span>
              <input type="text" value={cfg.bannerSubheading || ''} onChange={(e) => set('bannerSubheading', e.target.value)} placeholder="On hand-picked holiday packages this season" />
            </label>
            <label className="admin__field">
              <span>Banner overlay color</span>
              <input type="color" value={cfg.bannerOverlayColor || '#08434A'} onChange={(e) => set('bannerOverlayColor', e.target.value)} />
            </label>
          </div>
        </section>

        {/* Right form panel — text */}
        <section className="admin__form-block">
          <h3>Right form text</h3>
          <div className="admin__form-grid">
            <label className="admin__field">
              <span>Tag (small badge)</span>
              <input type="text" value={cfg.tag || ''} onChange={(e) => set('tag', e.target.value)} placeholder="Limited-time offer" />
            </label>
            <label className="admin__field">
              <span>CTA button text</span>
              <input type="text" value={cfg.cta || ''} onChange={(e) => set('cta', e.target.value)} placeholder="Get my custom quote" />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Title</span>
              <input type="text" value={cfg.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Get up to 30% off on your next holiday" />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Subtitle</span>
              <textarea rows="2" value={cfg.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Legal / fine-print line</span>
              <textarea rows="2" value={cfg.legal || ''} onChange={(e) => set('legal', e.target.value)} />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Success title (use {'{name}'} to insert visitor's first name)</span>
              <input type="text" value={cfg.successTitle || ''} onChange={(e) => set('successTitle', e.target.value)} placeholder="Thanks {name}!" />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Success message</span>
              <textarea rows="2" value={cfg.successMessage || ''} onChange={(e) => set('successMessage', e.target.value)} />
            </label>
          </div>
        </section>

        {/* Behaviour */}
        <section className="admin__form-block">
          <h3>Behaviour</h3>
          <div className="admin__form-grid">
            <label className="admin__field">
              <span>Re-open every (seconds)</span>
              <input
                type="number"
                min="15"
                max="3600"
                value={cfg.intervalSeconds || 45}
                onChange={(e) => set('intervalSeconds', Number(e.target.value) || 45)}
              />
            </label>
            <label className="admin__field admin__field--inline">
              <input type="checkbox" checked={cfg.active !== false} onChange={(e) => set('active', e.target.checked)} />
              <span>Popup is active</span>
            </label>
            <label className="admin__field admin__field--inline">
              <input type="checkbox" checked={!!cfg.showAfterSubmit} onChange={(e) => set('showAfterSubmit', e.target.checked)} />
              <span>Keep showing even after a visitor has submitted once</span>
            </label>
          </div>
        </section>

        {/* Field toggles */}
        <section className="admin__form-block">
          <h3>Form fields</h3>
          <p className="admin__sub" style={{ marginBottom: 8 }}>Toggle which questions appear on the right panel.</p>
          <div className="admin__sections-grid admin__sections-grid--inline">
            {FIELD_KEYS.map((f) => {
              const on = fields[f.key] !== false
              return (
                <button
                  key={f.key}
                  type="button"
                  className={`admin__section-chip admin__section-chip--small ${on ? 'is-on' : ''}`}
                  onClick={() => setField(f.key, !on)}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </section>

        <div className="admin__form-actions">
          <button className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

function PopupPreview({ cfg }) {
  const overlay = cfg.bannerOverlayColor || '#08434A'
  const bg = cfg.bannerUrl
    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, ${overlay}cc 100%), url(${cfg.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${overlay} 0%, #12B84A 130%)` }
  return (
    <div className="admin__popup-preview">
      <aside className="admin__popup-preview-banner" style={bg}>
        <span className="admin__popup-preview-tag">{cfg.tag}</span>
        <h4>{cfg.bannerHeading}</h4>
        <p>{cfg.bannerSubheading}</p>
      </aside>
      <div className="admin__popup-preview-form">
        <span className="admin__popup-preview-tag admin__popup-preview-tag--green">{cfg.tag}</span>
        <h4>{cfg.title}</h4>
        <p>{cfg.subtitle}</p>
        <button type="button" className="admin__popup-preview-btn">{cfg.cta}</button>
      </div>
    </div>
  )
}
