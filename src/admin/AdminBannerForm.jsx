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
  const [dimWarn, setDimWarn] = useState(null) // { picked, target, okRatio }

  const desktopInput = useRef(null)
  const mobileInput = useRef(null)

  // Required dimensions per upload target — single source of truth.
  const REQUIRED = {
    desktop: { w: 1920, h: 520, ratio: 1920 / 520, label: '1920 × 520 px (3.7 : 1)' },
    mobile:  { w: 1080, h: 1080, ratio: 1, label: '1080 × 1080 px (1 : 1)' },
  }

  const readImageSize = (file) =>
    new Promise((resolve) => {
      if (!file || !file.type?.startsWith('image/')) return resolve(null)
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url) }
      img.onerror = () => { resolve(null); URL.revokeObjectURL(url) }
      img.src = url
    })

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
    setUploading(target); setProgress(0); setErr(null); setDimWarn(null)

    const dims = await readImageSize(files[0])
    if (dims) {
      const want = REQUIRED[target]
      const okRatio = Math.abs((dims.w / dims.h) - want.ratio) < 0.03
      if (dims.w !== want.w || dims.h !== want.h) {
        setDimWarn({
          picked: `${dims.w} × ${dims.h}`,
          want: want.label,
          okRatio,
          target,
        })
      }
    }

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
          <div className="admin__help" style={{ background: '#eef9f0', border: '1px solid #b8e6c1', padding: '10px 12px', borderRadius: 6, color: '#0a5560' }}>
            <b>📐 EXACT SIZE: 1920 × 520 px</b> &nbsp;·&nbsp; Aspect ratio <b>3.7 : 1</b> (wide letterbox) &nbsp;·&nbsp; JPG/PNG &nbsp;·&nbsp; ≤ 500 KB
            <div style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
              Use <b>iloveimg.com/resize-image</b> or <b>squoosh.app</b> to crop your image to exactly 1920 × 520 before uploading.
            </div>
          </div>
          {dimWarn && dimWarn.target === 'desktop' && (
            <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 6, border: '1px solid #f5c66c', background: '#fff7e0', color: '#7c5a00', fontSize: 13 }}>
              <strong>⚠️ Wrong size.</strong> You uploaded <b>{dimWarn.picked} px</b> but the desktop banner expects exactly <b>{dimWarn.want}</b>.
              {' '}{dimWarn.okRatio ? 'Ratio is correct — just resize.' : 'Ratio is different — will be cropped. Please crop to 1920 × 520 and re-upload.'}
            </div>
          )}
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
          <div className="admin__help" style={{ background: '#eef9f0', border: '1px solid #b8e6c1', padding: '10px 12px', borderRadius: 6, color: '#0a5560' }}>
            <b>📐 EXACT SIZE: 1080 × 1080 px</b> &nbsp;·&nbsp; Aspect ratio <b>1 : 1</b> (square) &nbsp;·&nbsp; JPG &nbsp;·&nbsp; ≤ 300 KB
            <div style={{ marginTop: 6, fontSize: 12, color: '#475569' }}>
              Skip this and your desktop image will be used (cropped to a square on phones).
            </div>
          </div>
          {dimWarn && dimWarn.target === 'mobile' && (
            <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 6, border: '1px solid #f5c66c', background: '#fff7e0', color: '#7c5a00', fontSize: 13 }}>
              <strong>⚠️ Wrong size.</strong> You uploaded <b>{dimWarn.picked} px</b> but the mobile banner expects exactly <b>{dimWarn.want}</b>.
              {' '}{dimWarn.okRatio ? 'Ratio is correct — just resize.' : 'Ratio is different — will be cropped. Please crop to 1080 × 1080 and re-upload.'}
            </div>
          )}
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
