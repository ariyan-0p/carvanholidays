import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminListPartners,
  adminCreatePartner,
  adminUpdatePartner,
  adminUploadImages,
} from '../api/client'

const EMPTY = {
  name: '',
  logoUrl: '',
  link: '',
  order: 0,
  active: true,
}

export default function AdminPartnerForm() {
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
    adminListPartners()
      .then((list) => {
        const found = list.find(x => x._id === id)
        if (found) setForm({ ...EMPTY, ...found })
        else setErr('Partner not found')
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setErr(null)
    try {
      const { urls } = await adminUploadImages([file])
      if (urls?.[0]) set('logoUrl', urls[0])
    } catch (er) {
      setErr(er?.response?.data?.error || er.message || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (!form.name.trim()) return setErr('Partner name is required.')
    if (!form.logoUrl) return setErr('Please upload a logo.')
    setBusy(true)
    try {
      if (isEdit) await adminUpdatePartner(id, form)
      else await adminCreatePartner(form)
      nav('/admin/partners')
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
          <h1>{isEdit ? 'Edit Partner' : 'New Partner'}</h1>
          <p className="admin__page-sub">Upload the partner logo and a name. Visitors see them in a strip on the homepage.</p>
        </div>
      </header>

      <form className="admin__form" onSubmit={submit}>
        <div className="admin__form-section">
          <label className="admin__label">Logo *</label>
          {form.logoUrl ? (
            <div className="admin__media-preview admin__media-preview--partner">
              <img src={form.logoUrl} alt={form.name || 'Partner logo'} className="admin__media-preview-el admin__media-preview-el--logo" />
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('logoUrl', '')}>Remove logo</button>
            </div>
          ) : (
            <label className="admin__upload">
              <input type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
              <span>{uploading ? 'Uploading…' : 'Click to upload logo'}</span>
              <small>PNG with transparent background looks best · max 8MB</small>
            </label>
          )}
        </div>

        <div className="admin__form-grid">
          <label className="admin__field">
            <span>Partner name *</span>
            <input
              type="text"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. IATA, MakeMyTrip, Visa Inc."
              required
            />
          </label>

          <label className="admin__field admin__field--wide">
            <span>Website (optional)</span>
            <input
              type="url"
              value={form.link}
              onChange={e => set('link', e.target.value)}
              placeholder="https://partner.com"
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
          <button type="button" className="admin__btn" onClick={() => nav('/admin/partners')}>Cancel</button>
          <button type="submit" className="admin__btn admin__btn--primary" disabled={busy || uploading}>
            {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create partner')}
          </button>
        </div>
      </form>
    </div>
  )
}
