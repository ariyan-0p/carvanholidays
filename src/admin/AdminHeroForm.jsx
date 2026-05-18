import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminListHeroSlides,
  adminCreateHeroSlide,
  adminUpdateHeroSlide,
  adminUploadHeroMedia,
} from '../api/client'

const EMPTY = {
  kind: 'image',
  mediaUrl: '',
  posterUrl: '',
  label: '',
  destination: '',
  subtitle: '',
  description: '',
  price: '',
  duration: '',
  slug: '',
  ctaText: 'Explore',
  cards: [],
  order: 0,
  active: true,
}

const SIZES = {
  image: '1920 × 1080 px (16:9 landscape), JPG/PNG, ≤ 2 MB',
  video: '1920 × 1080 px MP4 (H.264), 8–15 seconds, ≤ 20 MB ideal (80 MB max)',
  poster: '1920 × 1080 px JPG (used while the video loads)',
  card: '400 × 600 px (2:3 portrait), JPG, ≤ 500 KB each',
}

const mediaSrc = (u) => (u && u.startsWith('/uploads/') ? u : u)

export default function AdminHeroForm() {
  const { id } = useParams()
  const isEdit = !!id
  const nav = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(null) // 'media' | 'poster' | 'card' | null
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState(null)

  const mediaInput = useRef(null)
  const posterInput = useRef(null)
  const cardInput = useRef(null)

  useEffect(() => {
    if (!isEdit) return
    adminListHeroSlides()
      .then((list) => {
        const found = list.find(x => x._id === id)
        if (found) setForm({ ...EMPTY, ...found, cards: Array.isArray(found.cards) ? found.cards : [] })
        else setErr('Slide not found')
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
      if (target === 'media') {
        const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(urls[0])
        setForm(f => ({ ...f, mediaUrl: urls[0], kind: isVideo ? 'video' : 'image' }))
      } else if (target === 'poster') {
        set('posterUrl', urls[0])
      } else if (target === 'card') {
        setForm(f => ({ ...f, cards: [...(f.cards || []), ...urls].slice(0, 3) }))
      }
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || 'Upload failed')
    } finally {
      setUploading(null); setProgress(0)
    }
  }

  const removeCard = (idx) => {
    setForm(f => ({ ...f, cards: (f.cards || []).filter((_, i) => i !== idx) }))
  }

  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (!form.mediaUrl) return setErr('Please upload a background image or video.')
    setBusy(true)
    try {
      if (isEdit) await adminUpdateHeroSlide(id, form)
      else await adminCreateHeroSlide(form)
      nav('/admin/hero')
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
          <h1>{isEdit ? 'Edit Hero Slide' : 'New Hero Slide'}</h1>
          <p className="admin__page-sub">Background can be an image or a short looping video. Side cards and text are optional.</p>
        </div>
      </header>

      <form className="admin__form" onSubmit={submit}>
        {/* === Background media === */}
        <div className="admin__form-section">
          <label className="admin__label">Background media (image or video) *</label>
          <p className="admin__help">
            <b>Recommended:</b> Images → {SIZES.image}. Videos → {SIZES.video}.
          </p>

          {form.mediaUrl ? (
            <div className="admin__hero-media-preview">
              {form.kind === 'video' ? (
                <video src={mediaSrc(form.mediaUrl)} muted autoPlay loop playsInline />
              ) : (
                <img src={mediaSrc(form.mediaUrl)} alt="background" />
              )}
              <div className="admin__hero-media-actions">
                <button type="button" className="admin__btn" onClick={() => mediaInput.current?.click()}>Replace</button>
                <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('mediaUrl', '')}>Remove</button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="admin__btn admin__btn--primary"
              onClick={() => mediaInput.current?.click()}
              disabled={uploading === 'media'}
            >
              {uploading === 'media' ? `Uploading… ${progress}%` : 'Upload image or video'}
            </button>
          )}
          <input
            type="file"
            ref={mediaInput}
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files, 'media')}
          />
        </div>

        {/* === Video poster === */}
        {form.kind === 'video' && (
          <div className="admin__form-section">
            <label className="admin__label">Video poster (optional)</label>
            <p className="admin__help">Shown while the video loads. Recommended: {SIZES.poster}.</p>
            {form.posterUrl ? (
              <div className="admin__hero-media-preview admin__hero-media-preview--small">
                <img src={mediaSrc(form.posterUrl)} alt="poster" />
                <div className="admin__hero-media-actions">
                  <button type="button" className="admin__btn" onClick={() => posterInput.current?.click()}>Replace</button>
                  <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('posterUrl', '')}>Remove</button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="admin__btn"
                onClick={() => posterInput.current?.click()}
                disabled={uploading === 'poster'}
              >
                {uploading === 'poster' ? `Uploading… ${progress}%` : 'Upload poster image'}
              </button>
            )}
            <input
              type="file"
              ref={posterInput}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleUpload(e.target.files, 'poster')}
            />
          </div>
        )}

        {/* === Text content === */}
        <div className="admin__form-section">
          <label className="admin__label">Text content</label>
          <div className="admin__form-grid">
            <label className="admin__field">
              <span>Eyebrow label</span>
              <input type="text" value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. Holiday Package" />
            </label>
            <label className="admin__field">
              <span>Destination (big title)</span>
              <input type="text" value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="e.g. Bali" />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Subtitle</span>
              <input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="e.g. Island of the Gods" />
            </label>
            <label className="admin__field admin__field--wide">
              <span>Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="One or two sentences about the destination"
              />
            </label>
            <label className="admin__field">
              <span>Price</span>
              <input type="text" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. ₹45,000" />
            </label>
            <label className="admin__field">
              <span>Duration</span>
              <input type="text" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 7N / 8D" />
            </label>
            <label className="admin__field">
              <span>CTA button text</span>
              <input type="text" value={form.ctaText} onChange={e => set('ctaText', e.target.value)} placeholder="Explore" />
            </label>
            <label className="admin__field">
              <span>Linked package slug (optional)</span>
              <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="e.g. bali-island-of-the-gods" />
            </label>
          </div>
        </div>

        {/* === Side cards === */}
        <div className="admin__form-section">
          <label className="admin__label">Floating side cards (optional — up to 3)</label>
          <p className="admin__help">Recommended: {SIZES.card}.</p>
          <div className="admin__hero-cards">
            {(form.cards || []).map((c, i) => (
              <div key={i} className="admin__hero-card-thumb">
                <img src={mediaSrc(c)} alt={`card ${i + 1}`} />
                <button type="button" className="admin__btn admin__btn--danger" onClick={() => removeCard(i)}>Remove</button>
              </div>
            ))}
            {(form.cards || []).length < 3 && (
              <button
                type="button"
                className="admin__btn"
                onClick={() => cardInput.current?.click()}
                disabled={uploading === 'card'}
              >
                {uploading === 'card' ? `Uploading… ${progress}%` : '+ Add card image'}
              </button>
            )}
            <input
              type="file"
              ref={cardInput}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleUpload(e.target.files, 'card')}
            />
          </div>
        </div>

        {/* === Display options === */}
        <div className="admin__form-section">
          <label className="admin__label">Display</label>
          <div className="admin__form-grid">
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
          <button type="button" className="admin__btn" onClick={() => nav('/admin/hero')}>Cancel</button>
          <button type="submit" className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create hero slide')}
          </button>
        </div>
      </form>
    </div>
  )
}
