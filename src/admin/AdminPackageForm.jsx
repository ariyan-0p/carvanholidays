import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, {
  adminCreatePackage,
  adminUpdatePackage,
  adminUploadImages,
} from '../api/client'

const empty = {
  slug: '', title: '', city: '', destination: '', country: '',
  category: 'heritage', duration: '', nights: '', days: '',
  price: '', totalPrice: '', pax: 1, currency: 'INR',
  badge: '', rating: 4.8, reviews: 0,
  summary: '', description: '',
  highlights: [], inclusions: [], exclusions: [], hotels: [],
  itinerary: [],
  image: '', gallery: [],
  featured: false, active: true,
}

const CATEGORIES = ['beach','heritage','luxury','honeymoon','adventure','family','multi-country','pilgrimage']

const linesToArr = (s) => s.split('\n').map(x => x.trim()).filter(Boolean)
const arrToLines = (a) => (a || []).join('\n')

export default function AdminPackageForm() {
  const { slug } = useParams()
  const editing = Boolean(slug)
  const nav = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(editing)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!editing) return
    api.get(`/admin/packages`).then(r => {
      const found = r.data.find(p => p.slug === slug)
      if (!found) { setErr('Package not found'); setLoading(false); return }
      setForm({ ...empty, ...found })
      setLoading(false)
    }).catch(e => { setErr(e.message); setLoading(false) })
  }, [slug, editing])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const onUploadHero = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const { urls } = await adminUploadImages(files)
      set('image', urls[0])
    } catch (e) { setErr(e?.response?.data?.error || e.message) }
    finally { setUploading(false); e.target.value = '' }
  }

  const onUploadGallery = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const { urls } = await adminUploadImages(files)
      set('gallery', [...(form.gallery || []), ...urls])
    } catch (e) { setErr(e?.response?.data?.error || e.message) }
    finally { setUploading(false); e.target.value = '' }
  }

  const removeGalleryImg = (i) =>
    set('gallery', form.gallery.filter((_, idx) => idx !== i))

  const addItineraryRow = () =>
    set('itinerary', [...form.itinerary, { day: form.itinerary.length + 1, title: '', description: '' }])
  const updateItin = (i, key, value) => {
    const next = [...form.itinerary]
    next[i] = { ...next[i], [key]: key === 'day' ? Number(value) : value }
    set('itinerary', next)
  }
  const removeItin = (i) => set('itinerary', form.itinerary.filter((_, idx) => idx !== i))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setErr(null)
    const payload = {
      ...form,
      nights: form.nights === '' ? undefined : Number(form.nights),
      days: form.days === '' ? undefined : Number(form.days),
      price: form.price === '' ? undefined : Number(form.price),
      totalPrice: form.totalPrice === '' ? undefined : Number(form.totalPrice),
      pax: form.pax === '' ? undefined : Number(form.pax),
      rating: form.rating === '' ? undefined : Number(form.rating),
      reviews: form.reviews === '' ? undefined : Number(form.reviews),
    }
    try {
      if (editing) await adminUpdatePackage(slug, payload)
      else await adminCreatePackage(payload)
      nav('/admin/packages')
    } catch (e) {
      setErr(e?.response?.data?.error || e.message)
    } finally { setBusy(false) }
  }

  if (loading) return <div className="admin__state">Loading…</div>

  return (
    <form className="admin__page admin__form" onSubmit={submit}>
      <header className="admin__header">
        <h1>{editing ? `Edit: ${form.title}` : 'New Package'}</h1>
        <div>
          <button type="button" className="admin__btn" onClick={() => nav('/admin/packages')}>Cancel</button>
          <button type="submit" disabled={busy} className="admin__btn admin__btn--primary">
            {busy ? 'Saving…' : (editing ? 'Save changes' : 'Create')}
          </button>
        </div>
      </header>

      {err && <div className="admin__state admin__state--err">{err}</div>}

      <section className="admin__form-grid">
        <label>Title<input value={form.title} onChange={e => set('title', e.target.value)} required /></label>
        <label>Slug (URL){' '}
          <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-from-title-if-blank" disabled={editing} />
        </label>
        <label>City (lowercase, hyphenated){' '}
          <input value={form.city} onChange={e => set('city', e.target.value.toLowerCase())} placeholder="e.g. jaipur, kuala-lumpur" required />
        </label>
        <label>Country<input value={form.country} onChange={e => set('country', e.target.value)} /></label>
        <label>Destination (display){' '}
          <input value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="e.g. Jaipur, Pushkar, Ajmer" />
        </label>
        <label>Category
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>Duration text<input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="7N / 8D" /></label>
        <label>Nights<input type="number" value={form.nights} onChange={e => set('nights', e.target.value)} /></label>
        <label>Days<input type="number" value={form.days} onChange={e => set('days', e.target.value)} /></label>
        <label>Price (per person)<input type="number" value={form.price} onChange={e => set('price', e.target.value)} /></label>
        <label>Total price<input type="number" value={form.totalPrice} onChange={e => set('totalPrice', e.target.value)} /></label>
        <label>Pax<input type="number" value={form.pax} onChange={e => set('pax', e.target.value)} /></label>
        <label>Currency<input value={form.currency} onChange={e => set('currency', e.target.value)} /></label>
        <label>Badge<input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="Best Seller" /></label>
        <label>Rating<input type="number" step="0.1" value={form.rating} onChange={e => set('rating', e.target.value)} /></label>
        <label>Reviews<input type="number" value={form.reviews} onChange={e => set('reviews', e.target.value)} /></label>
        <label className="admin__form-toggle">
          <input type="checkbox" checked={!!form.featured} onChange={e => set('featured', e.target.checked)} /> Featured
        </label>
        <label className="admin__form-toggle">
          <input type="checkbox" checked={!!form.active} onChange={e => set('active', e.target.checked)} /> Active
        </label>
      </section>

      <section className="admin__form-block">
        <label>Summary<textarea rows="2" value={form.summary} onChange={e => set('summary', e.target.value)} /></label>
        <label>Description<textarea rows="5" value={form.description} onChange={e => set('description', e.target.value)} /></label>
      </section>

      <section className="admin__form-block">
        <h3>Hero image</h3>
        {form.image && <img src={form.image} alt="" className="admin__hero-preview" />}
        <input type="file" accept="image/*" onChange={onUploadHero} />
        <input value={form.image} onChange={e => set('image', e.target.value)} placeholder="…or paste image URL" />
      </section>

      <section className="admin__form-block">
        <h3>Gallery</h3>
        <div className="admin__gallery">
          {(form.gallery || []).map((url, i) => (
            <div key={i} className="admin__gallery-item">
              <img src={url} alt="" />
              <button type="button" onClick={() => removeGalleryImg(i)}>×</button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" multiple onChange={onUploadGallery} />
        {uploading && <div className="admin__state">Uploading…</div>}
      </section>

      <section className="admin__form-block admin__form-block--cols">
        <label>Highlights (one per line)
          <textarea rows="6" value={arrToLines(form.highlights)} onChange={e => set('highlights', linesToArr(e.target.value))} />
        </label>
        <label>Inclusions (one per line)
          <textarea rows="6" value={arrToLines(form.inclusions)} onChange={e => set('inclusions', linesToArr(e.target.value))} />
        </label>
        <label>Exclusions (one per line)
          <textarea rows="6" value={arrToLines(form.exclusions)} onChange={e => set('exclusions', linesToArr(e.target.value))} />
        </label>
        <label>Hotels (one per line)
          <textarea rows="6" value={arrToLines(form.hotels)} onChange={e => set('hotels', linesToArr(e.target.value))} />
        </label>
      </section>

      <section className="admin__form-block">
        <div className="admin__form-block-head">
          <h3>Itinerary</h3>
          <button type="button" className="admin__btn" onClick={addItineraryRow}>+ Add day</button>
        </div>
        {form.itinerary.map((it, i) => (
          <div key={i} className="admin__itin-row">
            <input type="number" value={it.day || ''} onChange={e => updateItin(i, 'day', e.target.value)} placeholder="Day" />
            <input value={it.title || ''} onChange={e => updateItin(i, 'title', e.target.value)} placeholder="Title" />
            <textarea rows="2" value={it.description || ''} onChange={e => updateItin(i, 'description', e.target.value)} placeholder="Description" />
            <button type="button" className="admin__btn admin__btn--danger" onClick={() => removeItin(i)}>×</button>
          </div>
        ))}
      </section>

      <div className="admin__form-footer">
        <button type="submit" disabled={busy} className="admin__btn admin__btn--primary">
          {busy ? 'Saving…' : (editing ? 'Save changes' : 'Create package')}
        </button>
      </div>
    </form>
  )
}
