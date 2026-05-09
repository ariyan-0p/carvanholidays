import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminListInsta,
  adminCreateInsta,
  adminUpdateInsta,
  adminUploadMedia,
} from '../api/client'

const EMPTY = {
  videoUrl: '',
  posterUrl: '',
  caption: '',
  instaUrl: '',
  order: 0,
  active: true,
}

export default function AdminInstaForm() {
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
    adminListInsta()
      .then((list) => {
        const found = list.find(x => x._id === id)
        if (found) setForm({ ...EMPTY, ...found })
        else setErr('Reel not found')
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
    if (!form.instaUrl.trim()) return setErr('Instagram link is required.')
    if (!form.videoUrl && !form.posterUrl) return setErr('Please upload a video (or at least a thumbnail image).')
    setBusy(true)
    try {
      if (isEdit) await adminUpdateInsta(id, form)
      else await adminCreateInsta(form)
      nav('/admin/insta')
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
          <h1>{isEdit ? 'Edit Reel' : 'New Instagram Reel'}</h1>
          <p className="admin__page-sub">Upload a video, paste the Instagram link, and it'll appear in the homepage Instagram section.</p>
        </div>
      </header>

      <form className="admin__form" onSubmit={submit}>
        <div className="admin__form-section">
          <label className="admin__label">Video *</label>
          {form.videoUrl ? (
            <div className="admin__media-preview">
              <video src={form.videoUrl} controls className="admin__media-preview-el" />
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('videoUrl', '')}>Remove video</button>
            </div>
          ) : (
            <label className="admin__upload">
              <input type="file" accept="video/*" onChange={(e) => onUpload(e, 'videoUrl')} disabled={uploading} />
              <span>{uploading ? 'Uploading…' : 'Click to upload reel video'}</span>
              <small>MP4 / MOV / WebM, up to 80MB. Portrait (9:16) looks best.</small>
            </label>
          )}
        </div>

        <div className="admin__form-section">
          <label className="admin__label">Thumbnail / poster image (optional)</label>
          {form.posterUrl ? (
            <div className="admin__media-preview">
              <img src={form.posterUrl} alt="" className="admin__media-preview-el" />
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('posterUrl', '')}>Remove poster</button>
            </div>
          ) : (
            <label className="admin__upload">
              <input type="file" accept="image/*" onChange={(e) => onUpload(e, 'posterUrl')} disabled={uploading} />
              <span>{uploading ? 'Uploading…' : 'Click to upload thumbnail'}</span>
              <small>Shown until the visitor hovers and the video starts playing</small>
            </label>
          )}
        </div>

        <div className="admin__form-grid">
          <label className="admin__field admin__field--wide">
            <span>Instagram URL *</span>
            <input
              type="url"
              value={form.instaUrl}
              onChange={e => set('instaUrl', e.target.value)}
              placeholder="https://www.instagram.com/reel/XXXXXXXXXXX/"
              required
            />
          </label>

          <label className="admin__field admin__field--wide">
            <span>Caption (optional)</span>
            <textarea
              rows="2"
              value={form.caption}
              onChange={e => set('caption', e.target.value)}
              placeholder="Short hook shown on hover, e.g. Sunrise at Pangong Lake"
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
          <button type="button" className="admin__btn" onClick={() => nav('/admin/insta')}>Cancel</button>
          <button type="submit" className="admin__btn admin__btn--primary" disabled={busy || uploading}>
            {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create reel')}
          </button>
        </div>
      </form>
    </div>
  )
}
