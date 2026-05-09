import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  adminListAnnouncements,
  adminCreateAnnouncement,
  adminUpdateAnnouncement,
} from '../api/client'

const EMPTY = {
  text: '',
  link: '',
  bgColor: '#12B84A',
  textColor: '#ffffff',
  animation: 'marquee',
  order: 0,
  active: true,
}

const PRESETS = [
  { label: 'Green', bg: '#12B84A', fg: '#ffffff' },
  { label: 'Teal', bg: '#08434A', fg: '#ffffff' },
  { label: 'Amber', bg: '#f59e0b', fg: '#1f1f1f' },
  { label: 'Rose', bg: '#ec4899', fg: '#ffffff' },
  { label: 'Royal', bg: '#2563eb', fg: '#ffffff' },
  { label: 'Black', bg: '#0f1115', fg: '#ffffff' },
]

export default function AdminAnnouncementForm() {
  const { id } = useParams()
  const isEdit = !!id
  const nav = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    adminListAnnouncements()
      .then((list) => {
        const found = list.find(x => x._id === id)
        if (found) setForm({ ...EMPTY, ...found })
        else setErr('Announcement not found')
      })
      .catch(e => setErr(e?.response?.data?.error || e.message))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setErr(null)
    if (!form.text.trim()) return setErr('Announcement text is required.')
    setBusy(true)
    try {
      if (isEdit) await adminUpdateAnnouncement(id, form)
      else await adminCreateAnnouncement(form)
      nav('/admin/announcements')
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
          <h1>{isEdit ? 'Edit Announcement' : 'New Announcement'}</h1>
          <p className="admin__page-sub">Shown as a thin animated bar above the header on every public page.</p>
        </div>
      </header>

      {/* Live preview */}
      <div className="admin__form-section">
        <label className="admin__label">Live preview</label>
        <div className="admin__ann-livebar" style={{ background: form.bgColor, color: form.textColor }}>
          <span className="admin__ann-livebar-sparkle">✦</span>
          <span>{form.text || 'Your announcement text will appear here…'}</span>
        </div>
      </div>

      <form className="admin__form" onSubmit={submit}>
        <div className="admin__form-grid">
          <label className="admin__field admin__field--wide">
            <span>Text *</span>
            <input
              type="text"
              maxLength="200"
              value={form.text}
              onChange={e => set('text', e.target.value)}
              placeholder="e.g. Ladakh Spiti Early Bird – Save up to ₹3,000 🎉"
              required
            />
          </label>

          <label className="admin__field admin__field--wide">
            <span>Link (optional)</span>
            <input
              type="text"
              value={form.link}
              onChange={e => set('link', e.target.value)}
              placeholder="e.g. /packages?q=Ladakh"
            />
          </label>

          <label className="admin__field">
            <span>Animation</span>
            <select value={form.animation} onChange={e => set('animation', e.target.value)}>
              <option value="marquee">Marquee (scrolls left)</option>
              <option value="static">Static (centered)</option>
              <option value="pulse">Pulse</option>
            </select>
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
            <span>Show on website</span>
          </label>

          <label className="admin__field">
            <span>Background colour</span>
            <input type="color" value={form.bgColor} onChange={e => set('bgColor', e.target.value)} />
          </label>

          <label className="admin__field">
            <span>Text colour</span>
            <input type="color" value={form.textColor} onChange={e => set('textColor', e.target.value)} />
          </label>

          <div className="admin__field admin__field--wide">
            <span>Quick colour presets</span>
            <div className="admin__ann-presets">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className="admin__ann-preset"
                  style={{ background: p.bg, color: p.fg }}
                  onClick={() => { set('bgColor', p.bg); set('textColor', p.fg) }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {err && <div className="admin__state admin__state--err">{err}</div>}

        <div className="admin__form-actions">
          <button type="button" className="admin__btn" onClick={() => nav('/admin/announcements')}>Cancel</button>
          <button type="submit" className="admin__btn admin__btn--primary" disabled={busy}>
            {busy ? 'Saving…' : (isEdit ? 'Save changes' : 'Create announcement')}
          </button>
        </div>
      </form>
    </div>
  )
}
