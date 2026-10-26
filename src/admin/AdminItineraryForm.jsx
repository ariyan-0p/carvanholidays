import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  adminListPackages,
  adminListItineraries,
  adminGetItinerary,
  adminCreateItinerary,
  adminUpdateItinerary,
  adminItineraryPdf,
  adminItinerarySettings,
  adminUploadImages,
} from '../api/client'
import DaysEditor from './DaysEditor'
import RowsEditor from './RowsEditor'
import {
  THEMES,
  inDays,
  itineraryFromPackage,
  itineraryFromTemplate,
  openPdfBlob,
  shareUrl,
} from './itineraryUtils'

const linesToArr = (s) => s.split('\n').map(x => x.trim()).filter(Boolean)
const arrToLines = (a) => (a || []).join('\n')

const blank = () => ({
  title: '', tagline: '', destination: '', country: '', coverImage: '', sourcePackageSlug: '',
  status: 'draft', isTemplate: false, templateName: '',
  theme: 'teal', sections: {},
  customer: { name: '', phone: '', email: '' },
  consultant: { name: '', phone: '', email: '', photo: '' },
  welcome: { heading: '', body: '', signoff: '' },
  travelDate: '', nights: '', days: '', adults: 2, children: 0, rooms: 1,
  overview: '', highlights: [], itinerary: [], hotelOptions: [], flights: [],
  vehicle: { kind: '', pickup: '', drop: '', notes: '' },
  inclusions: [], exclusions: [],
  currency: 'INR', priceLines: [], totalPrice: '', perPerson: '', priceNote: '', addons: [],
  batches: [], reviews: [], thingsToCarry: [], keepInMind: [],
  advancePercent: '', paymentTerms: '', cancellationSlabs: [], cancellationPolicy: '', terms: '', notes: '',
  validUntil: inDays(7), bookBy: '',
})

const blankHotel = () => ({ name: '', stars: 4, rating: '', location: '', roomType: '', mealPlan: '', nights: '', description: '', images: [], facilities: [], notes: '' })

function Panel({ title, hint, defaultOpen = false, children }) {
  return (
    <details className="admin__panel" open={defaultOpen}>
      <summary><span>{title}</span>{hint && <small>{hint}</small>}</summary>
      <div className="admin__panel-body">{children}</div>
    </details>
  )
}

export default function AdminItineraryForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const nav = useNavigate()
  const [params] = useSearchParams()

  const [form, setForm] = useState(() => ({ ...blank(), isTemplate: params.get('template') === '1' }))
  const [meta, setMeta] = useState({ ref: '', shareToken: '' })
  const [loading, setLoading] = useState(editing)
  const [busy, setBusy] = useState(null) // 'save' | 'pdf' | null
  const [err, setErr] = useState(null)
  const [note, setNote] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [packages, setPackages] = useState([])
  const [templates, setTemplates] = useState([])
  const [pkgSlug, setPkgSlug] = useState('')
  const [tplId, setTplId] = useState('')
  const [secDefaults, setSecDefaults] = useState({ sections: {}, labels: {} })

  useEffect(() => {
    adminListPackages().then(setPackages).catch(() => setPackages([]))
    adminListItineraries({ templates: true }).then(setTemplates).catch(() => setTemplates([]))
    adminItinerarySettings()
      .then(r => setSecDefaults({ sections: r.sections || {}, labels: r.sectionLabels || {} }))
      .catch(() => {})
  }, [])

  // /admin/itineraries/new?from=<templateId> pre-fills a new itinerary from a saved template
  const fromId = params.get('from')
  useEffect(() => {
    if (editing || !fromId) return
    adminGetItinerary(fromId)
      .then(t => {
        setForm(f => ({ ...blank(), ...itineraryFromTemplate(t), customer: f.customer }))
        setNote(`Started from template “${t.templateName || t.title}”.`)
        setTimeout(() => setNote(null), 2800)
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
  }, [fromId, editing])

  useEffect(() => {
    if (!editing) return
    adminGetItinerary(id)
      .then(doc => {
        const b = blank()
        setForm({
          ...b, ...doc,
          customer: { ...b.customer, ...(doc.customer || {}) },
          consultant: { ...b.consultant, ...(doc.consultant || {}) },
          welcome: { ...b.welcome, ...(doc.welcome || {}) },
          vehicle: { ...b.vehicle, ...(doc.vehicle || {}) },
          sections: doc.sections || {},
        })
        setMeta({ ref: doc.ref, shareToken: doc.shareToken })
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [id, editing])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setIn = (group, k, v) => setForm(f => ({ ...f, [group]: { ...f[group], [k]: v } }))
  const flash = (m) => { setNote(m); setTimeout(() => setNote(null), 2800) }
  const sectionOn = (k) => (form.sections[k] !== undefined ? form.sections[k] : secDefaults.sections[k])

  /* ---- automation: fill from a package or a saved template ---- */
  const confirmReplace = () =>
    !(form.itinerary.length || form.title) || confirm('Replace the current content with this one?')

  const fillFromPackage = () => {
    const pkg = packages.find(p => p.slug === pkgSlug)
    if (!pkg || !confirmReplace()) return
    setForm(f => ({ ...f, ...itineraryFromPackage(pkg, Number(f.adults) || 2) }))
    flash(`Filled from “${pkg.title}” — review and customise below.`)
  }
  const fillFromTemplate = async () => {
    if (!tplId || !confirmReplace()) return
    try {
      const t = await adminGetItinerary(tplId)
      setForm(f => ({ ...blank(), ...itineraryFromTemplate(t), customer: f.customer, travelDate: f.travelDate, validUntil: f.validUntil, isTemplate: f.isTemplate, templateName: f.templateName }))
      flash(`Started from template “${t.templateName || t.title}”.`)
    } catch (e) { setErr(e?.response?.data?.error || e.message) }
  }

  /* ---- uploads ---- */
  const upload = async (files, onUrls) => {
    if (!files.length) return
    setUploading(true)
    try { const { urls } = await adminUploadImages(files); onUrls(urls) }
    catch (er) { setErr(er?.response?.data?.error || er.message) }
    finally { setUploading(false) }
  }
  const pick = (cb) => (e) => { const files = Array.from(e.target.files || []); e.target.value = ''; upload(files, cb) }

  const setHotel = (i, k, v) => {
    const next = [...form.hotelOptions]
    next[i] = { ...next[i], [k]: v }
    set('hotelOptions', next)
  }

  const payload = () => {
    const num = (v) => (v === '' || v == null ? undefined : Number(v))
    return {
      ...form,
      nights: num(form.nights),
      days: num(form.days) ?? (form.itinerary.length || undefined),
      adults: num(form.adults) ?? 2,
      children: num(form.children) ?? 0,
      rooms: num(form.rooms) ?? 1,
      totalPrice: num(form.totalPrice),
      perPerson: num(form.perPerson),
      advancePercent: num(form.advancePercent),
      priceLines: form.priceLines.filter(l => l.label).map(l => ({ ...l, amount: num(l.amount) })),
      hotelOptions: form.hotelOptions
        .filter(h => h.name)
        .map(h => ({ ...h, stars: num(h.stars), nights: num(h.nights) })),
      reviews: form.reviews.filter(r => r.text),
    }
  }

  const save = async () => {
    const saved = editing ? await adminUpdateItinerary(id, payload()) : await adminCreateItinerary(payload())
    setMeta({ ref: saved.ref, shareToken: saved.shareToken })
    return saved
  }

  const onSave = async (e, andPdf = false) => {
    e?.preventDefault()
    setBusy(andPdf ? 'pdf' : 'save'); setErr(null)
    try {
      const saved = await save()
      if (andPdf) openPdfBlob(await adminItineraryPdf(saved._id), `${saved.ref}.pdf`)
      if (!editing) nav(`/admin/itineraries/${saved._id}/edit`, { replace: true })
      else flash(andPdf ? 'Saved — PDF ready.' : 'Saved.')
    } catch (er) {
      setErr(er?.response?.data?.error || er.message)
    } finally { setBusy(null) }
  }

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl(meta.shareToken)); flash('Share link copied') }
    catch { window.prompt('Copy this link:', shareUrl(meta.shareToken)) }
  }

  if (loading) return <div className="admin__state">Loading…</div>

  const sumLines = form.priceLines.reduce((n, l) => n + (Number(l.amount) || 0), 0)

  return (
    <form className="admin__page admin__form" onSubmit={onSave}>
      <header className="admin__header admin__header--sticky">
        <div>
          <h1>{form.isTemplate ? 'Template' : 'Itinerary'}{editing && form.title ? `: ${form.title}` : ''}</h1>
          {meta.ref && <p className="admin__page-sub">Reference <code>{meta.ref}</code></p>}
        </div>
        <div>
          <button type="button" className="admin__btn" onClick={() => nav('/admin/itineraries')}>Back</button>
          <button type="submit" disabled={!!busy} className="admin__btn">{busy === 'save' ? 'Saving…' : 'Save'}</button>
          {!form.isTemplate && (
            <button type="button" disabled={!!busy} className="admin__btn admin__btn--primary" onClick={(e) => onSave(e, true)}>
              {busy === 'pdf' ? 'Building PDF…' : 'Save & download PDF'}
            </button>
          )}
        </div>
      </header>

      {err && <div className="admin__state admin__state--err">{err}</div>}
      {note && <div className="admin__state">{note}</div>}
      {uploading && <div className="admin__state">Uploading…</div>}

      <section className="admin__form-block admin__autofill">
        <div className="admin__form-block-head">
          <h3>Start from…</h3>
          <span className="admin__sub" style={{ marginLeft: 'auto' }}>Pull in days, stays, inclusions and pricing in one click.</span>
        </div>
        <div className="admin__autofill-row">
          <select value={pkgSlug} onChange={e => setPkgSlug(e.target.value)}>
            <option value="">A website package…</option>
            {packages.map(p => <option key={p.slug} value={p.slug}>{p.title} {p.duration ? `— ${p.duration}` : ''}</option>)}
          </select>
          <button type="button" className="admin__btn admin__btn--primary" onClick={fillFromPackage} disabled={!pkgSlug}>Use package</button>
        </div>
        <div className="admin__autofill-row" style={{ marginTop: 8 }}>
          <select value={tplId} onChange={e => setTplId(e.target.value)}>
            <option value="">{templates.length ? 'One of my saved templates…' : 'No saved templates yet — save any itinerary as a template from the list'}</option>
            {templates.map(t => <option key={t._id} value={t._id}>{t.templateName || t.title}</option>)}
          </select>
          <button type="button" className="admin__btn admin__btn--primary" onClick={fillFromTemplate} disabled={!tplId}>Use template</button>
        </div>
      </section>

      <Panel title="Design & sections" hint="Pick a colour theme and choose which pages appear in the PDF" defaultOpen>
        <div className="admin__themes">
          {THEMES.map(t => (
            <button type="button" key={t.key} className={`admin__theme ${form.theme === t.key ? 'is-on' : ''}`} onClick={() => set('theme', t.key)}>
              <span className="admin__theme-sw"><i style={{ background: t.swatch[0] }} /><i style={{ background: t.swatch[1] }} /></span>
              {t.label}
            </button>
          ))}
        </div>
        <div className="admin__sections-grid" style={{ marginTop: 14 }}>
          {Object.keys(secDefaults.labels).map(k => {
            const on = !!sectionOn(k)
            return (
              <button type="button" key={k} className={`admin__section-chip ${on ? 'is-on' : ''}`} onClick={() => setForm(f => ({ ...f, sections: { ...f.sections, [k]: !(f.sections[k] !== undefined ? f.sections[k] : secDefaults.sections[k]) } }))}>
                <span className="admin__section-chip-dot" />
                <span><strong>{secDefaults.labels[k]}</strong></span>
              </button>
            )
          })}
        </div>
        <div className="admin__sub" style={{ marginTop: 8 }}>Sections with nothing in them are skipped automatically, even when switched on.</div>
      </Panel>

      <Panel title="Customer & trip" defaultOpen>
        <div className="admin__form-grid">
          <label>Customer name<input value={form.customer.name} onChange={e => setIn('customer', 'name', e.target.value)} placeholder="Priya Sharma" /></label>
          <label>Phone<input value={form.customer.phone} onChange={e => setIn('customer', 'phone', e.target.value)} /></label>
          <label>Email<input type="email" value={form.customer.email} onChange={e => setIn('customer', 'email', e.target.value)} /></label>
          <label>Travel date<input value={form.travelDate} onChange={e => set('travelDate', e.target.value)} placeholder="14 – 21 June 2026" /></label>
          <label>Adults<input type="number" min="1" value={form.adults} onChange={e => set('adults', e.target.value)} /></label>
          <label>Children<input type="number" min="0" value={form.children} onChange={e => set('children', e.target.value)} /></label>
          <label>Rooms<input type="number" min="1" value={form.rooms} onChange={e => set('rooms', e.target.value)} /></label>
          <label>Nights<input type="number" value={form.nights} onChange={e => set('nights', e.target.value)} /></label>
          <label>Days<input type="number" value={form.days} onChange={e => set('days', e.target.value)} placeholder={String(form.itinerary.length || '')} /></label>
          <label>Status
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="draft">Draft</option><option value="sent">Sent to customer</option><option value="confirmed">Confirmed</option>
            </select>
          </label>
          <label className="admin__form-toggle"><input type="checkbox" checked={!!form.isTemplate} onChange={e => set('isTemplate', e.target.checked)} /> Reusable template</label>
          {form.isTemplate && <label>Template name<input value={form.templateName} onChange={e => set('templateName', e.target.value)} placeholder="Bali 6N honeymoon" /></label>}
        </div>
        <h4 className="admin__sub-h">Your consultant</h4>
        <div className="admin__form-grid">
          <label>Name<input value={form.consultant.name} onChange={e => setIn('consultant', 'name', e.target.value)} /></label>
          <label>Phone<input value={form.consultant.phone} onChange={e => setIn('consultant', 'phone', e.target.value)} /></label>
          <label>Email<input value={form.consultant.email} onChange={e => setIn('consultant', 'email', e.target.value)} /></label>
        </div>
      </Panel>

      <Panel title="Cover & overview" defaultOpen>
        <div className="admin__form-grid">
          <label>Itinerary title<input value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Magical Maldives Honeymoon" /></label>
          <label>Tagline<input value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Six nights of overwater calm" /></label>
          <label>Destination<input value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="Malé, Maldives" /></label>
          <label>Country<input value={form.country} onChange={e => set('country', e.target.value)} /></label>
        </div>
        <div className="admin__day-photo" style={{ margin: '12px 0' }}>
          {form.coverImage && <img src={form.coverImage} alt="" style={{ width: 160, height: 96 }} />}
          <label className="admin__btn">
            {form.coverImage ? 'Change cover photo' : 'Upload cover photo'}
            <input type="file" accept="image/*" hidden onChange={pick(u => set('coverImage', u[0]))} />
          </label>
          <input style={{ flex: 1, minWidth: 220 }} value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="…or paste an image URL" />
        </div>
        <label>Overview<textarea rows="4" value={form.overview} onChange={e => set('overview', e.target.value)} /></label>
        <label>Highlights (one per line)
          <textarea rows="4" value={arrToLines(form.highlights)} onChange={e => set('highlights', linesToArr(e.target.value))} />
        </label>
      </Panel>

      <Panel title="Welcome letter" hint="A personal note from you or the trip host (turn on in Design & sections)">
        <div className="admin__form-grid">
          <label>Heading<input value={form.welcome.heading} onChange={e => setIn('welcome', 'heading', e.target.value)} placeholder="An invitation to Bali" /></label>
          <label>Sign-off<input value={form.welcome.signoff} onChange={e => setIn('welcome', 'signoff', e.target.value)} placeholder="Warmly, Arpit" /></label>
        </div>
        <label>Letter (blank line = new paragraph)<textarea rows="6" value={form.welcome.body} onChange={e => setIn('welcome', 'body', e.target.value)} /></label>
        <div className="admin__day-photo">
          {form.consultant.photo && <img src={form.consultant.photo} alt="" style={{ width: 64, height: 80, borderRadius: 32 }} />}
          <label className="admin__btn">
            {form.consultant.photo ? 'Change host photo' : 'Add host photo'}
            <input type="file" accept="image/*" hidden onChange={pick(u => setIn('consultant', 'photo', u[0]))} />
          </label>
          {form.consultant.photo && <button type="button" className="admin__btn" onClick={() => setIn('consultant', 'photo', '')}>Remove</button>}
        </div>
      </Panel>

      <Panel title={`Day-by-day (${form.itinerary.length})`} hint="Meals, stays, activities and a photo per day" defaultOpen>
        <DaysEditor days={form.itinerary} onChange={(d) => set('itinerary', d)} onError={setErr} bare />
      </Panel>

      <Panel title={`Hotels (${form.hotelOptions.length})`} hint="Photos, facilities and rating per option">
        <div className="admin__form-block-head">
          <span className="admin__sub">Add one or more hotel options.</span>
          <button type="button" className="admin__btn" style={{ marginLeft: 'auto' }} onClick={() => set('hotelOptions', [...form.hotelOptions, blankHotel()])}>+ Add hotel</button>
        </div>
        {form.hotelOptions.map((h, i) => (
          <div key={i} className="admin__day">
            <div className="admin__day-head" style={{ gridTemplateColumns: '1fr 90px auto' }}>
              <input value={h.name || ''} onChange={e => setHotel(i, 'name', e.target.value)} placeholder="Hotel name" />
              <select value={h.stars || ''} onChange={e => setHotel(i, 'stars', e.target.value)}>
                {[5, 4, 3, 2].map(n => <option key={n} value={n}>{n} ★</option>)}
              </select>
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => set('hotelOptions', form.hotelOptions.filter((_, x) => x !== i))}>×</button>
            </div>
            <div className="admin__day-grid">
              <label>Location<input value={h.location || ''} onChange={e => setHotel(i, 'location', e.target.value)} /></label>
              <label>Guest rating<input value={h.rating || ''} onChange={e => setHotel(i, 'rating', e.target.value)} placeholder="8.3 Very good" /></label>
              <label>Room type<input value={h.roomType || ''} onChange={e => setHotel(i, 'roomType', e.target.value)} placeholder="Deluxe Valley View" /></label>
              <label>Meal plan<input value={h.mealPlan || ''} onChange={e => setHotel(i, 'mealPlan', e.target.value)} placeholder="MAP (Breakfast + Dinner)" /></label>
              <label>Nights<input type="number" value={h.nights ?? ''} onChange={e => setHotel(i, 'nights', e.target.value)} /></label>
            </div>
            <label>Description<textarea rows="2" value={h.description || ''} onChange={e => setHotel(i, 'description', e.target.value)} /></label>
            <label>Facilities (one per line)<textarea rows="3" value={arrToLines(h.facilities)} onChange={e => setHotel(i, 'facilities', linesToArr(e.target.value))} placeholder={'Swimming pool\nFree Wi-Fi\nSpa'} /></label>
            <div className="admin__day-photo">
              {(h.images || []).map((src, x) => (
                <span key={x} className="admin__thumbx">
                  <img src={src} alt="" />
                  <button type="button" onClick={() => setHotel(i, 'images', h.images.filter((_, y) => y !== x))} title="Remove">×</button>
                </span>
              ))}
              {(h.images || []).length < 5 && (
                <label className="admin__btn">
                  + Add photos (up to 5)
                  <input type="file" accept="image/*" multiple hidden onChange={pick(u => setHotel(i, 'images', [...(h.images || []), ...u].slice(0, 5)))} />
                </label>
              )}
            </div>
            <label>Notes<input value={h.notes || ''} onChange={e => setHotel(i, 'notes', e.target.value)} /></label>
          </div>
        ))}
      </Panel>

      <Panel title="Flights & transport">
        <RowsEditor
          title="Flights" items={form.flights} onChange={(v) => set('flights', v)}
          blank={{ sector: '', airline: '', flightNo: '', depart: '', arrive: '', baggage: '', note: '' }} addLabel="+ Add flight"
          fields={[
            { key: 'sector', label: 'Sector', placeholder: 'DEL → IXL', span: 2 },
            { key: 'airline', label: 'Airline', placeholder: 'IndiGo' },
            { key: 'flightNo', label: 'Flight no.', placeholder: '6E 2171' },
            { key: 'depart', label: 'Departs', placeholder: '14 Jun, 06:10', span: 2 },
            { key: 'arrive', label: 'Arrives', placeholder: '14 Jun, 07:35', span: 2 },
            { key: 'baggage', label: 'Baggage', placeholder: 'Cabin 7 kg · Check-in 15 kg', span: 2 },
            { key: 'note', label: 'Note', span: 2 },
          ]}
        />
        <h4 className="admin__sub-h">Transport on the ground</h4>
        <div className="admin__form-grid">
          <label>Vehicle<input value={form.vehicle.kind} onChange={e => setIn('vehicle', 'kind', e.target.value)} placeholder="Tempo Traveller (12-seater)" /></label>
          <label>Pick-up<input value={form.vehicle.pickup} onChange={e => setIn('vehicle', 'pickup', e.target.value)} placeholder="Leh Airport" /></label>
          <label>Drop<input value={form.vehicle.drop} onChange={e => setIn('vehicle', 'drop', e.target.value)} placeholder="Leh Airport" /></label>
          <label>Note<input value={form.vehicle.notes} onChange={e => setIn('vehicle', 'notes', e.target.value)} /></label>
        </div>
      </Panel>

      <Panel title="Pricing" hint="Line items, totals, add-ons, inclusions and exclusions" defaultOpen>
        <div className="admin__form-grid">
          <label>Currency<input value={form.currency} onChange={e => set('currency', e.target.value)} /></label>
          <label>Total package price<input type="number" value={form.totalPrice} onChange={e => set('totalPrice', e.target.value)} /></label>
          <label>Price per person<input type="number" value={form.perPerson} onChange={e => set('perPerson', e.target.value)} /></label>
          <label>Price note<input value={form.priceNote} onChange={e => set('priceNote', e.target.value)} placeholder="Inclusive of all taxes for 2 adults sharing one room" /></label>
        </div>
        <div className="admin__day-photo" style={{ margin: '8px 0 14px' }}>
          <button type="button" className="admin__btn" disabled={!form.perPerson}
            onClick={() => set('totalPrice', Number(form.perPerson) * (Number(form.adults) || 1))}>Total = per person × adults</button>
          <button type="button" className="admin__btn" disabled={!form.totalPrice}
            onClick={() => set('perPerson', Math.round(Number(form.totalPrice) / (Number(form.adults) || 1)))}>Per person = total ÷ adults</button>
          <button type="button" className="admin__btn" disabled={!sumLines} onClick={() => set('totalPrice', sumLines)}>Total = sum of line items ({sumLines.toLocaleString('en-IN')})</button>
        </div>
        <RowsEditor
          title="Price breakdown" hint="Optional itemised lines (hotels, activities, flights, GST…)"
          items={form.priceLines} onChange={(v) => set('priceLines', v)} blank={{ label: '', amount: '' }} addLabel="+ Add line"
          fields={[{ key: 'label', label: 'Item', placeholder: 'Hotels (7 nights)', span: 3 }, { key: 'amount', label: 'Amount', type: 'number' }]}
        />
        <RowsEditor
          title="Optional add-ons" items={form.addons} onChange={(v) => set('addons', v)} blank={{ name: '', description: '', price: '' }} addLabel="+ Add add-on"
          fields={[{ key: 'name', label: 'Add-on', placeholder: 'Camel safari', span: 2 }, { key: 'description', label: 'Details', span: 1 }, { key: 'price', label: 'Price', type: 'number' }]}
        />
        <div className="admin__form-grid" style={{ marginTop: 14 }}>
          <label>Inclusions (one per line)<textarea rows="7" value={arrToLines(form.inclusions)} onChange={e => set('inclusions', linesToArr(e.target.value))} /></label>
          <label>Exclusions (one per line)<textarea rows="7" value={arrToLines(form.exclusions)} onChange={e => set('exclusions', linesToArr(e.target.value))} /></label>
        </div>
      </Panel>

      <Panel title="Dates, reviews & packing" hint="Group-trip batches, guest reviews, things to carry">
        <RowsEditor
          title="Travel dates / batches" items={form.batches} onChange={(v) => set('batches', v)} blank={{ label: '', note: '' }} addLabel="+ Add date"
          fields={[{ key: 'label', label: 'Date', placeholder: '14 June 2026', span: 2 }, { key: 'note', label: 'Note', placeholder: 'Few seats left', span: 2 }]}
        />
        <RowsEditor
          title="Guest reviews" hint="Leave empty to use the defaults from Itinerary settings"
          items={form.reviews} onChange={(v) => set('reviews', v)} blank={{ name: '', rating: 5, text: '' }} addLabel="+ Add review"
          fields={[{ key: 'name', label: 'Name', span: 2 }, { key: 'rating', label: 'Stars', type: 'number' }, { key: 'text', label: 'Review', type: 'textarea', span: 4 }]}
        />
        <RowsEditor
          title="Things to carry" hint="Leave empty to use the defaults from Itinerary settings"
          items={form.thingsToCarry} onChange={(v) => set('thingsToCarry', v)} blank={{ group: '', items: [] }} addLabel="+ Add group"
          fields={[{ key: 'group', label: 'Group', placeholder: 'Clothing' }, { key: 'items', label: 'Items (one per line)', type: 'lines', rows: 4, span: 3 }]}
        />
        <label style={{ marginTop: 12 }}>Please keep in mind (one per line)
          <textarea rows="3" value={arrToLines(form.keepInMind)} onChange={e => set('keepInMind', linesToArr(e.target.value))} />
        </label>
      </Panel>

      <Panel title="Terms & booking" hint="Blank fields use your company defaults from Itinerary settings">
        <div className="admin__form-grid">
          <label>Quotation valid until<input value={form.validUntil} onChange={e => set('validUntil', e.target.value)} /></label>
          <label>Book by (deadline)<input value={form.bookBy} onChange={e => set('bookBy', e.target.value)} placeholder="15 May 2026" /></label>
          <label>Advance to confirm (%)<input type="number" min="1" max="100" value={form.advancePercent} onChange={e => set('advancePercent', e.target.value)} placeholder="company default" /></label>
        </div>
        <label>Payment terms (override)<textarea rows="2" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} placeholder="Leave blank to use the company default" /></label>
        <RowsEditor
          title="Cancellation slabs (override)" items={form.cancellationSlabs} onChange={(v) => set('cancellationSlabs', v)}
          blank={{ window: '', charge: '' }} addLabel="+ Add slab" empty="Using the company default slabs."
          fields={[{ key: 'window', label: 'When you cancel', span: 2 }, { key: 'charge', label: 'What you get back', span: 2 }]}
        />
        <label>Terms &amp; conditions (override, one per line)<textarea rows="3" value={form.terms} onChange={e => set('terms', e.target.value)} /></label>
        <label>Notes<textarea rows="3" value={form.notes} onChange={e => set('notes', e.target.value)} /></label>
      </Panel>

      {editing && meta.shareToken && !form.isTemplate && (
        <section className="admin__form-block">
          <div className="admin__form-block-head"><h3>Share with customer</h3></div>
          <div className="admin__autofill-row">
            <input readOnly value={shareUrl(meta.shareToken)} onFocus={e => e.target.select()} />
            <button type="button" className="admin__btn" onClick={copyLink}>Copy link</button>
          </div>
          <div className="admin__sub" style={{ marginTop: 6 }}>Anyone with this link can view the PDF. It always shows the latest saved version.</div>
        </section>
      )}

      <div className="admin__form-footer">
        <button type="submit" disabled={!!busy} className="admin__btn">{busy === 'save' ? 'Saving…' : 'Save'}</button>
        {!form.isTemplate && (
          <button type="button" disabled={!!busy} className="admin__btn admin__btn--primary" onClick={(e) => onSave(e, true)}>
            {busy === 'pdf' ? 'Building PDF…' : 'Save & download PDF'}
          </button>
        )}
      </div>
    </form>
  )
}
