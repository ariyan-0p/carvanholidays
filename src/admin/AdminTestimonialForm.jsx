import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminListTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminUploadMedia,
} from '../api/client'

const EMPTY = {
  kind: 'message',
  name: '',
  quote: '',
  location: '',
  trip: '',
  rating: 5,
  mediaUrl: '',
  posterUrl: '',
  order: 0,
  active: true,
}

export default function AdminTestimonialForm() {
  const { id } = useParams()
  const isEdit = !!id
  const nav = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    adminListTestimonials()
      .then((list) => {
        const found = list.find(x => x._id === id)
        if (found) setForm({ ...EMPTY, ...found })
        else setErr('Testimonial not found')
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const onUpload = async (e, field) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr(null)
    try {
      const { urls } = await adminUploadMedia([file])
      if (urls?.[0]) set(field, urls[0])
    } catch (er) {
      setErr(er?.response?.data?.error || er.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (!form.name.trim()) return setErr('Name is required.')
    if ((form.kind === 'video' || form.kind === 'photo') && !form.mediaUrl) {
      return setErr(`Please upload a ${form.kind} file.`)
    }
    if (form.kind === 'message' && !form.quote.trim()) {
      return setErr('Quote is required for message-only testimonials.')
    }
    setBusy(true)
    try {
      if (isEdit) await adminUpdateTestimonial(id, form)
      else await adminCreateTestimonial(form)
      nav('/admin/testimonials')
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
          <h1>{isEdit ? 'Edit Testimonial' : 'New Testimonial'}</h1>
          <p className="admin__page-sub">Pick a type, fill the details, and save. It will appear on the homepage right away.</p>
        </div>
      </header>

      <form className="admin__form" onSubmit={submit}>
        <div className="admin__form-section">
          <label className="admin__label">Type *</label>
          <div className="admin__kind-row">
            {[
              { v: 'message', label: 'Just a message', icon: '💬' },
              { v: 'photo', label: 'Photo + message', icon: '📷' },
              { v: 'video', label: 'Video + message', icon: '🎬' },
            ].map(k => (
              <button
                key={k.v}
                type="button"
                className={`admin__kind-btn ${form.kind === k.v ? 'is-active' : ''}`}
                onClick={() => set('kind', k.v)}
              >
                <span className="admin__kind-icon">{k.icon}</span>
                <span>{k.label}</span>
              </button>
            ))}
          </div>
        </div>

        {(form.kind === 'video' || form.kind === 'photo') && (
          <div className="admin__form-section">
            <label className="admin__label">{form.kind === 'video' ? 'Video file *' : 'Photo *'}</label>
            {form.mediaUrl ? (
              <div className="admin__media-preview">
                {form.kind === 'video'
                  ? <video src={form.mediaUrl} controls className="admin__media-preview-el" />
                  : <img src={form.mediaUrl} alt="" className="admin__media-preview-el" />}
                <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('mediaUrl', '')}>Remove</button>
              </div>
            ) : (
              <label className="admin__upload">
                <input
                  type="file"
                  accept={form.kind === 'video' ? 'video/*' : 'image/*'}
                  onChange={(e) => onUpload(e, 'mediaUrl')}
                  disabled={uploading}
                />
                <span>{uploading ? 'Uploading…' : `Click to upload ${form.kind}`}</span>
                <small>{form.kind === 'video' ? 'MP4 / MOV / WebM, up to 80MB' : 'JPG / PNG / WebP, up to 80MB'}</small>
              </label>
            )}
          </div>
        )}

        {form.kind === 'message' && (
          <div className="admin__form-section">
            <label className="admin__label">Avatar (optional)</label>
            {form.mediaUrl ? (
              <div className="admin__media-preview">
                <img src={form.mediaUrl} alt="" className="admin__media-preview-el admin__media-preview-el--avatar" />
                <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('mediaUrl', '')}>Remove</button>
              </div>
            ) : (
              <label className="admin__upload">
                <input type="file" accept="image/*" onChange={(e) => onUpload(e, 'mediaUrl')} disabled={uploading} />
                <span>{uploading ? 'Uploading…' : 'Click to upload avatar'}</span>
                <small>Square image works best</small>
              </label>
            )}
          </div>
        )}

        <div className="admin__form-grid">
          <label className="admin__field">
            <span>Name *</span>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Full name" />
          </label>

          <label className="admin__field">
            <span>Location (optional)</span>
            <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Mumbai" />
          </label>

          <label className="admin__field">
            <span>Trip taken (optional)</span>
            <input type="text" value={form.trip} onChange={e => set('trip', e.target.value)} placeholder="e.g. Bali, 7N/8D" />
          </label>

          <label className="admin__field">
            <span>Rating</span>
            <select value={form.rating} onChange={e => set('rating', Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </label>

          <label className="admin__field admin__field--wide">
            <span>Quote {form.kind === 'message' ? '*' : '(optional)'}</span>
            <textarea
              rows="4"
              value={form.quote}
              onChange={e => set('quote', e.target.value)}
              placeholder="What did the traveller say about their trip?"
            />
          </label>

          <label className="admin__field">
            <span>Display order</span>
            <input
              type="number"
              value={form.order}
              onChange={e => set('order', Number(e.target.value) || 0)}
              placeholder="0"
            />
          </label>

          <label className="admin__field admin__field--inline">
            <input type="checkbox" checked={!!form.active} onChange={e => set('active', e.target.checked)} />
            <span>Show on homepage</span>
          </label>
        </div>

        {err && <div className="admin__state admin__state--err">{err}</div>}

        <div className="admin__form-actions">
          <button type="button" className="admin__btn" onClick={() => nav('/admin/testimonials')}>Cancel</button>
          <button type="submit" className="admin__btn admin__btn--primary" disabled={busy || uploading}>
            {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create testimonial')}
          </button>
        </div>
      </form>
    </div>
  )
}
