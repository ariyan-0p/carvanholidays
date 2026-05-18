import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminListBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminUploadHeroMedia, // reused — same uploader handles images
} from '../api/client'

const SLOTS = [
  { value: 'after-destinations', label: 'After "Popular Destinations"' },
  { value: 'before-region',      label: 'Before "Explore by Region"' },
]

const EMPTY = {
  slot: 'after-destinations',
  title: '',
  imageUrl: '',
  mobileImageUrl: '',
  link: '',
  openInNewTab: false,
  order: 0,
  active: true,
}

const mediaSrc = (u) => u || ''

export default function AdminBannerForm() {
  const { id } = useParams()
  const isEdit = !!id
  const nav = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(null)
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState(null)

  const desktopInput = useRef(null)
  const mobileInput = useRef(null)

  useEffect(() => {
    if (!isEdit) return
    adminListBanners()
      .then((list) => {
        const found = list.find(x => x._id === id)
        if (found) setForm({ ...EMPTY, ...found })
        else setErr('Banner not found')
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleUpload = async (files, target) => {
    if (!files || files.length === 0) return
    setUploading(target); setProgress(0); setErr(null)
    try {
      const { urls } = await adminUploadHeroMedia(files, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      if (!urls?.length) throw new Error('Upload failed')
      if (target === 'desktop') set('imageUrl', urls[0])
      else if (target === 'mobile') set('mobileImageUrl', urls[0])
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || 'Upload failed')
    } finally {
      setUploading(null); setProgress(0)
    }
  }

  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (!form.imageUrl) return setErr('Please upload a desktop banner image.')
    if (!form.slot) return setErr('Please pick a slot.')
    setBusy(true)
    try {
      if (isEdit) await adminUpdateBanner(id, form)
      else await adminCreateBanner(form)
      nav('/admin/banners')
    } catch (er) {
      setErr(er?.response?.data?.error || er.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="admin__page"><div className="admin__state">Loading…</div></div>

  return (
    <div className="admin__page">
      <header className="admin__header">
        <div>
          <h1>{isEdit ? 'Edit Banner' : 'New Banner'}</h1>
          <p className="admin__page-sub">A wide image strip shown between homepage sections. Click target is optional.</p>
        </div>
      </header>

      <form className="admin__form" onSubmit={submit}>
        {/* Position */}
        <div className="admin__form-section">
          <label className="admin__label">Position on homepage *</label>
          <p className="admin__help">Pick where this banner appears.</p>
          <select value={form.slot} onChange={e => set('slot', e.target.value)}>
            {SLOTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Desktop image */}
        <div className="admin__form-section">
          <label className="admin__label">Desktop banner image *</label>
          <p className="admin__help">
            <b>Recommended:</b> 1920 × 520 px · <b>aspect ratio ≈ 3.7 : 1</b> (wide letterbox) · JPG/PNG · ≤ 500 KB.
            Slimmer ratios (e.g. 1920 × 480 = 4:1) also work — the banner fills the full width with the image cropped to fit.
          </p>
          {form.imageUrl ? (
            <div className="admin__hero-media-preview" style={{ aspectRatio: '1920 / 520' }}>
              <img src={mediaSrc(form.imageUrl)} alt="banner" />
              <div className="admin__hero-media-actions">
                <button type="button" className="admin__btn" onClick={() => desktopInput.current?.click()}>Replace</button>
                <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('imageUrl', '')}>Remove</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="admin__btn admin__btn--primary"
              onClick={() => desktopInput.current?.click()}
              disabled={uploading === 'desktop'}
            >
              {uploading === 'desktop' ? `Uploading… ${progress}%` : 'Upload desktop banner'}
            </button>
          )}
          <input
            type="file"
            ref={desktopInput}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files, 'desktop')}
          />
        </div>

        {/* Mobile image */}
        <div className="admin__form-section">
          <label className="admin__label">Mobile banner image (optional)</label>
          <p className="admin__help">
            <b>Recommended:</b> 800 × 800 px · <b>aspect ratio 1 : 1</b> (square) · JPG · ≤ 300 KB.
            A taller 800 × 1000 px (<b>4 : 5</b> portrait) also works. If not set, the desktop image is used on phones (cropped to a square).
          </p>
          {form.mobileImageUrl ? (
            <div className="admin__hero-media-preview admin__hero-media-preview--small" style={{ aspectRatio: '1 / 1' }}>
              <img src={mediaSrc(form.mobileImageUrl)} alt="mobile banner" />
              <div className="admin__hero-media-actions">
                <button type="button" className="admin__btn" onClick={() => mobileInput.current?.click()}>Replace</button>
                <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('mobileImageUrl', '')}>Remove</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="admin__btn"
              onClick={() => mobileInput.current?.click()}
              disabled={uploading === 'mobile'}
            >
              {uploading === 'mobile' ? `Uploading… ${progress}%` : 'Upload mobile banner'}
            </button>
          )}
          <input
            type="file"
            ref={mobileInput}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files, 'mobile')}
          />
        </div>

        {/* Details */}
        <div className="admin__form-section">
          <label className="admin__label">Details</label>
          <div className="admin__form-grid">
            <label className="admin__field admin__field--wide">
              <span>Title / alt text</span>
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Best Bike & Backpacking Trips"
              />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Click link (optional)</span>
              <input
                type="text"
                value={form.link}
                onChange={e => set('link', e.target.value)}
                placeholder="/packages?category=bike or https://…"
              />
            </label>
            <label className="admin__field admin__field--inline">
              <input
                type="checkbox"
                checked={!!form.openInNewTab}
                onChange={e => set('openInNewTab', e.target.checked)}
              />
              <span>Open link in a new tab</span>
            </label>
            <label className="admin__field">
              <span>Order</span>
              <input
                type="number"
                value={form.order}
                onChange={e => set('order', Number(e.target.value) || 0)}
                placeholder="0"
              />
            </label>
            <label className="admin__field admin__field--inline">
              <input type="checkbox" checked={!!form.active} onChange={e => set('active', e.target.checked)} />
              <span>Show on website</span>
            </label>
          </div>
        </div>

        {err && <div className="admin__state admin__state--err">{err}</div>}

        <div className="admin__form-actions">
          <button type="button" className="admin__btn" onClick={() => nav('/admin/banners')}>Cancel</button>
          <button type="submit" className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create banner')}
          </button>
        </div>
      </form>
    </div>
  )
}
