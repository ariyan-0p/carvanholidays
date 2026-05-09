import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminGetBlog,
  adminCreateBlog,
  adminUpdateBlog,
  adminUploadImages,
} from '../api/client'

const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const todayISO = () => new Date().toISOString().slice(0, 10)

const EMPTY = {
  title: '',
  slug: '',
  coverUrl: '',
  excerpt: '',
  content: '',
  author: 'Carvaan Team',
  tags: '',
  readTime: '',
  publishedAt: todayISO(),
  active: true,
}

export default function AdminBlogForm() {
  const { id } = useParams()
  const isEdit = !!id
  const nav = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState(null)
  const [slugTouched, setSlugTouched] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    adminGetBlog(id)
      .then((b) => {
        setForm({
          ...EMPTY,
          ...b,
          tags: Array.isArray(b.tags) ? b.tags.join(', ') : '',
          publishedAt: b.publishedAt ? new Date(b.publishedAt).toISOString().slice(0, 10) : todayISO(),
        })
        setSlugTouched(true)
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const onTitleChange = (val) => {
    set('title', val)
    if (!slugTouched) set('slug', slugify(val))
  }

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr(null)
    try {
      const { urls } = await adminUploadImages([file])
      if (urls?.[0]) set('coverUrl', urls[0])
    } catch (er) {
      setErr(er?.response?.data?.error || er.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (!form.title.trim()) return setErr('Title is required.')
    if (!form.content.trim()) return setErr('Content is required.')
    setBusy(true)
    try {
      const payload = {
        ...form,
        tags: String(form.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        publishedAt: form.publishedAt || todayISO(),
      }
      if (isEdit) await adminUpdateBlog(id, payload)
      else await adminCreateBlog(payload)
      nav('/admin/blogs')
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
          <h1>{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h1>
          <p className="admin__page-sub">Write your article. Plain text wraps into paragraphs automatically — or paste HTML for richer formatting.</p>
        </div>
      </header>

      <form className="admin__form" onSubmit={submit}>
        <div className="admin__form-section">
          <label className="admin__label">Cover image</label>
          {form.coverUrl ? (
            <div className="admin__media-preview">
              <img src={form.coverUrl} alt="" className="admin__media-preview-el" />
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('coverUrl', '')}>Remove cover</button>
            </div>
          ) : (
            <label className="admin__upload">
              <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
              <span>{uploading ? 'Uploading…' : 'Click to upload cover image'}</span>
              <small>Landscape image, ideally 1600 × 1000 · max 8MB</small>
            </label>
          )}
        </div>

        <div className="admin__form-grid">
          <label className="admin__field admin__field--wide">
            <span>Title *</span>
            <input
              type="text"
              value={form.title}
              onChange={e => onTitleChange(e.target.value)}
              placeholder="e.g. 7 Reasons to Visit Ladakh in Spring"
              required
            />
          </label>

          <label className="admin__field admin__field--wide">
            <span>URL slug</span>
            <input
              type="text"
              value={form.slug}
              onChange={e => { set('slug', slugify(e.target.value)); setSlugTouched(true) }}
              placeholder="auto-generated from title"
            />
          </label>

          <label className="admin__field">
            <span>Author</span>
            <input
              type="text"
              value={form.author}
              onChange={e => set('author', e.target.value)}
              placeholder="Carvaan Team"
            />
          </label>

          <label className="admin__field">
            <span>Publish date</span>
            <input
              type="date"
              value={form.publishedAt}
              onChange={e => set('publishedAt', e.target.value)}
            />
          </label>

          <label className="admin__field">
            <span>Read time (optional)</span>
            <input
              type="text"
              value={form.readTime}
              onChange={e => set('readTime', e.target.value)}
              placeholder="e.g. 5 min read"
            />
          </label>

          <label className="admin__field">
            <span>Tags (comma-separated)</span>
            <input
              type="text"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="ladakh, spring, adventure"
            />
          </label>

          <label className="admin__field admin__field--inline">
            <input type="checkbox" checked={!!form.active} onChange={e => set('active', e.target.checked)} />
            <span>Publish (visible on public site)</span>
          </label>

          <label className="admin__field admin__field--wide">
            <span>Excerpt (short summary)</span>
            <textarea
              rows="2"
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              placeholder="One-line teaser shown in blog cards and the article header"
            />
          </label>

          <label className="admin__field admin__field--wide">
            <span>Content *</span>
            <textarea
              rows="14"
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder={'Write your article here.\n\nLeave a blank line between paragraphs.\n\nYou can also paste HTML — <h2>Sub-heading</h2>, <strong>bold</strong>, <a href="/packages">links</a>, <ul><li>lists</li></ul> all work.'}
              required
            />
          </label>
        </div>

        {err && <div className="admin__state admin__state--err">{err}</div>}

        <div className="admin__form-actions">
          <button type="button" className="admin__btn" onClick={() => nav('/admin/blogs')}>Cancel</button>
          <button type="submit" className="admin__btn admin__btn--primary" disabled={busy || uploading}>
            {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create blog post')}
          </button>
        </div>
      </form>
    </div>
  )
}
