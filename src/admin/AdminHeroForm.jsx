import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminListHeroSlides,
  adminCreateHeroSlide,
  adminUpdateHeroSlide,
  adminUploadHeroMedia,
  adminDeleteHeroSlide,
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
  fitMode: 'cover',
  focusPoint: 'center',
  order: 0,
  active: true,
}

// IMPORTANT: the hero box on the public site is 16:9 (the area below the
// nav bars, roughly 100vh - 178px on desktop). Match this exactly to avoid
// any cropping or letterboxing.
const SIZES = {
  image:  'EXACT SIZE: 1920 × 1080 px  ·  ASPECT RATIO: 16:9 (landscape)  ·  JPG/PNG  ·  ≤ 2 MB',
  video:  'EXACT SIZE: 1920 × 1080 px  ·  ASPECT RATIO: 16:9 (landscape)  ·  MP4 (H.264)  ·  8–15 sec  ·  ≤ 20 MB ideal (80 MB max)',
  poster: 'EXACT SIZE: 1920 × 1080 px  ·  ASPECT RATIO: 16:9  ·  JPG (used while the video loads)',
  card:   'EXACT SIZE: 400 × 600 px  ·  ASPECT RATIO: 2:3 (portrait)  ·  JPG  ·  ≤ 500 KB each',
}

const mediaSrc = (u) => (u && u.startsWith('/uploads/') ? u : u)

export default function AdminHeroForm() {
  const { id: routeId } = useParams()
  const initialIsEdit = !!routeId

  const nav = useNavigate()

  const [form, setForm] = useState(EMPTY)
  // `slideId` may become populated mid-session if we auto-create after the
  // first upload, so we no longer derive isEdit only from the route param.
  const [slideId, setSlideId] = useState(routeId || null)
  const isEdit = !!slideId
  const [loading, setLoading] = useState(initialIsEdit)
  const [busy, setBusy] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [autoSavedAt, setAutoSavedAt] = useState(null)
  const [uploading, setUploading] = useState(null) // 'media' | 'poster' | 'card' | null
  const [progress, setProgress] = useState(0)
  const [err, setErr] = useState(null)

  const mediaInput = useRef(null)
  const posterInput = useRef(null)
  const cardInput = useRef(null)

  useEffect(() => {
    if (!routeId) return
    adminListHeroSlides()
      .then((list) => {
        const found = list.find(x => x._id === routeId)
        if (found) setForm({ ...EMPTY, ...found, cards: Array.isArray(found.cards) ? found.cards : [] })
        else setErr('Slide not found')
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [routeId])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Auto-save: when we already have a slideId, persist a patch to the server
  // immediately so the public hero stays in sync as the admin edits.
  const autoPersist = async (patch) => {
    if (!slideId) return
    setAutoSaving(true); setErr(null)
    try {
      await adminUpdateHeroSlide(slideId, patch)
      setAutoSavedAt(Date.now())
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || 'Auto-save failed')
    } finally {
      setAutoSaving(false)
    }
  }

  const handleUpload = async (files, target) => {
    if (!files || files.length === 0) return
    setUploading(target); setProgress(0); setErr(null)
    try {
      const { urls } = await adminUploadHeroMedia(files, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      if (!urls?.length) throw new Error('Upload failed')

      let nextForm
      if (target === 'media') {
        const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(urls[0])
        nextForm = { ...form, mediaUrl: urls[0], kind: isVideo ? 'video' : 'image' }
      } else if (target === 'poster') {
        nextForm = { ...form, posterUrl: urls[0] }
      } else {
        nextForm = { ...form, cards: [...(form.cards || []), ...urls].slice(0, 3) }
      }
      setForm(nextForm)

      // If this is the FIRST upload on a brand-new slide, create the DB
      // record immediately. From now on uploading or editing fields auto-saves
      // — so the hero updates on the live site without the admin having to
      // click "Save" again.
      if (target === 'media' && !slideId && nextForm.mediaUrl) {
        try {
          const created = await adminCreateHeroSlide(nextForm)
          setSlideId(created._id)
          setAutoSavedAt(Date.now())
          // Update URL so refreshing keeps you in edit mode for this slide.
          window.history.replaceState({}, '', `/admin/hero/${created._id}/edit`)
        } catch (e) {
          setErr(e?.response?.data?.error || e.message || 'Could not create slide')
        }
      } else if (slideId) {
        // Subsequent uploads (poster, cards, replacing media) — push the patch
        // to the existing record straight away.
        const patch = target === 'media'
          ? { mediaUrl: nextForm.mediaUrl, kind: nextForm.kind }
          : target === 'poster'
            ? { posterUrl: nextForm.posterUrl }
            : { cards: nextForm.cards }
        autoPersist(patch)
      }
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || 'Upload failed')
    } finally {
      setUploading(null); setProgress(0)
    }
  }

  const removeCard = (idx) => {
    const nextCards = (form.cards || []).filter((_, i) => i !== idx)
    setForm(f => ({ ...f, cards: nextCards }))
    if (slideId) autoPersist({ cards: nextCards })
  }

  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (!form.mediaUrl) return setErr('Please upload a background image or video.')
    setBusy(true)
    try {
      if (slideId) await adminUpdateHeroSlide(slideId, form)
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
        {slideId && (
          <div className="admin__header-actions" style={{ fontSize: 12, color: autoSaving ? '#0a5560' : '#12B84A', fontWeight: 600 }}>
            {autoSaving
              ? '● Saving…'
              : autoSavedAt
                ? '✓ Live on website'
                : '✓ Live on website'}
          </div>
        )}
      </header>

      {!slideId && (
        <div
          className="admin__form-section"
          style={{ background: '#fff8e1', border: '1px solid #f5d27a', color: '#7c5a00' }}
        >
          <strong>📸 Upload your image or video below.</strong>
          <p className="admin__help" style={{ color: '#7c5a00', margin: '4px 0 0' }}>
            As soon as you upload the background media, this slide will go live on the homepage hero automatically.
            You can then fill in the text fields and they'll auto-save.
          </p>
        </div>
      )}

      <form className="admin__form" onSubmit={submit}>
        {/* === Background media === */}
        <div className="admin__form-section">
          <label className="admin__label">Background media (image or video) *</label>
          <div className="admin__help" style={{ background: '#eef9f0', border: '1px solid #b8e6c1', padding: '10px 12px', borderRadius: 6, color: '#0a5560', lineHeight: 1.6 }}>
            <div><b>📐 For images:</b><br />{SIZES.image}</div>
            <div style={{ marginTop: 8 }}><b>🎬 For videos:</b><br />{SIZES.video}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
              👉 Use a free online tool like <b>iloveimg.com/resize-image</b> or <b>squoosh.app</b> to resize/crop your image to <b>1920 × 1080 (16:9)</b> before uploading.
            </div>
          </div>

          {form.mediaUrl ? (
            <div className="admin__hero-media-preview">
              {form.kind === 'video' ? (
                <video src={mediaSrc(form.mediaUrl)} muted autoPlay loop playsInline />
              ) : (
                <img src={mediaSrc(form.mediaUrl)} alt="background" />
              )}
              <div className="admin__hero-media-actions">
                <button type="button" className="admin__btn" onClick={() => mediaInput.current?.click()}>Replace</button>
                <button
                  type="button"
                  className="admin__btn admin__btn--danger"
                  onClick={async () => {
                    if (slideId) {
                      if (!confirm('Remove this slide from the website?')) return
                      try {
                        await adminDeleteHeroSlide(slideId)
                        nav('/admin/hero')
                      } catch (e) {
                        setErr(e?.response?.data?.error || e.message)
                      }
                    } else {
                      set('mediaUrl', '')
                    }
                  }}
                >
                  Remove
                </button>
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

        {/* === Image fit + focus point — visible only after media uploaded === */}
        {form.mediaUrl && (
          <div className="admin__form-section">
            <label className="admin__label">How should the image fit?</label>
            <p className="admin__help">
              Pick <b>Fill</b> for 1920×1080 (16:9) media — it covers the whole hero area and may crop the edges.
              Pick <b>Show full image</b> for non-16:9 media (banner, poster, square) so the entire image is visible (small bars may appear on the sides).
            </p>
            <div className="admin__form-grid">
              <label className="admin__field admin__field--inline">
                <input
                  type="radio"
                  name="fitMode"
                  value="cover"
                  checked={form.fitMode !== 'contain'}
                  onChange={() => {
                    set('fitMode', 'cover')
                    if (slideId) autoPersist({ fitMode: 'cover' })
                  }}
                />
                <span><b>Fill</b> — cover the area (may crop)</span>
              </label>
              <label className="admin__field admin__field--inline">
                <input
                  type="radio"
                  name="fitMode"
                  value="contain"
                  checked={form.fitMode === 'contain'}
                  onChange={() => {
                    set('fitMode', 'contain')
                    if (slideId) autoPersist({ fitMode: 'contain' })
                  }}
                />
                <span><b>Show full image</b> — fit inside (no crop)</span>
              </label>
              <label className="admin__field">
                <span>Focus point (when cropping)</span>
                <select
                  value={form.focusPoint || 'center'}
                  onChange={(e) => {
                    set('focusPoint', e.target.value)
                    if (slideId) autoPersist({ focusPoint: e.target.value })
                  }}
                  disabled={form.fitMode === 'contain'}
                >
                  <option value="center">Center (default)</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top left">Top-left</option>
                  <option value="top right">Top-right</option>
                  <option value="bottom left">Bottom-left</option>
                  <option value="bottom right">Bottom-right</option>
                </select>
              </label>
            </div>
          </div>
        )}

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
