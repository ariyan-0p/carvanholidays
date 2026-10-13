import { useState } from 'react'
import { adminUploadImages } from '../api/client'

const linesToArr = (s) => s.split('\n').map(x => x.trim()).filter(Boolean)
const arrToLines = (a) => (a || []).join('\n')

const blankDay = (n) => ({
  day: n, title: '', description: '', location: '', meals: [], stay: '', activities: [], image: '',
})

/**
 * Day-by-day editor shared by the Package form and the Itinerary builder.
 * Controlled: `days` in, `onChange(nextDays)` out.
 */
export default function DaysEditor({ days = [], onChange, onError, bare = false }) {
  const [uploading, setUploading] = useState(false)

  const update = (i, key, value) => {
    const next = [...days]
    next[i] = { ...next[i], [key]: key === 'day' ? Number(value) : value }
    onChange(next)
  }
  const toggleMeal = (i, meal) => {
    const cur = days[i].meals || []
    update(i, 'meals', cur.includes(meal) ? cur.filter(m => m !== meal) : [...cur, meal])
  }
  const remove = (i) => onChange(days.filter((_, idx) => idx !== i))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= days.length) return
    const next = [...days]
    ;[next[i], next[j]] = [next[j], next[i]]
    // keep day numbers in sequence after a reorder
    onChange(next.map((d, idx) => ({ ...d, day: idx + 1 })))
  }
  const onUploadImage = async (i, e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const { urls } = await adminUploadImages(files)
      update(i, 'image', urls[0])
    } catch (er) { onError?.(er?.response?.data?.error || er.message) }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <section className={bare ? '' : 'admin__form-block'}>
      <div className="admin__form-block-head">
        {bare ? <span className="admin__sub">One card per day.</span> : <h3>Day-by-day itinerary</h3>}
        <button type="button" className="admin__btn" onClick={() => onChange([...days, blankDay(days.length + 1)])}>+ Add day</button>
      </div>

      {days.length === 0 && <div className="admin__sub">No days yet — add the first day to begin.</div>}

      {days.map((it, i) => (
        <div key={i} className="admin__day">
          <div className="admin__day-head">
            <input className="admin__day-num" type="number" value={it.day || ''} onChange={e => update(i, 'day', e.target.value)} placeholder="Day" />
            <input value={it.title || ''} onChange={e => update(i, 'title', e.target.value)} placeholder="Day title (e.g. Leh to Nubra Valley via Khardung La)" />
            <span className="admin__day-tools">
              <button type="button" className="admin__btn" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
              <button type="button" className="admin__btn" onClick={() => move(i, 1)} disabled={i === days.length - 1} title="Move down">↓</button>
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => remove(i)} title="Remove day">×</button>
            </span>
          </div>
          <textarea rows="3" value={it.description || ''} onChange={e => update(i, 'description', e.target.value)} placeholder="Description of the day" />
          <details className="admin__more" open={Boolean(it.morning || it.afternoon || it.evening || it.attractions || it.note)}>
            <summary>Morning / Afternoon / Evening, attractions &amp; note (optional)</summary>
            <label>Morning<textarea rows="2" value={it.morning || ''} onChange={e => update(i, 'morning', e.target.value)} /></label>
            <label>Afternoon<textarea rows="2" value={it.afternoon || ''} onChange={e => update(i, 'afternoon', e.target.value)} /></label>
            <label>Evening<textarea rows="2" value={it.evening || ''} onChange={e => update(i, 'evening', e.target.value)} /></label>
            <label>Major attractions<input value={it.attractions || ''} onChange={e => update(i, 'attractions', e.target.value)} placeholder="Hadimba Temple, Club House, Vashisht Hot Springs" /></label>
            <label>Note<input value={it.note || ''} onChange={e => update(i, 'note', e.target.value)} placeholder="Weather, permit or timing note" /></label>
          </details>
          <div className="admin__day-grid">
            <label>Location / route
              <input value={it.location || ''} onChange={e => update(i, 'location', e.target.value)} placeholder="Leh → Nubra Valley" />
            </label>
            <label>Overnight stay
              <input value={it.stay || ''} onChange={e => update(i, 'stay', e.target.value)} placeholder="Hotel name, city" />
            </label>
          </div>
          <div className="admin__day-meals">
            <span>Meals included:</span>
            {['breakfast', 'lunch', 'dinner'].map(m => (
              <label key={m} className="admin__check">
                <input type="checkbox" checked={(it.meals || []).includes(m)} onChange={() => toggleMeal(i, m)} />
                {m[0].toUpperCase() + m.slice(1)}
              </label>
            ))}
          </div>
          <label>Transfers &amp; activities (one per line)
            <textarea
              rows="3"
              value={arrToLines(it.activities)}
              onChange={e => update(i, 'activities', linesToArr(e.target.value))}
              placeholder="Airport pickup and transfer to hotel, Sightseeing: Shanti Stupa, Evening at leisure (one per line)"
            />
          </label>
          <div className="admin__day-photo">
            {it.image && <img src={it.image} alt="" />}
            <label className="admin__btn">
              {uploading ? 'Uploading…' : (it.image ? 'Change day photo' : 'Add day photo')}
              <input type="file" accept="image/*" hidden onChange={e => onUploadImage(i, e)} />
            </label>
            {it.image && <button type="button" className="admin__btn" onClick={() => update(i, 'image', '')}>Remove photo</button>}
          </div>
        </div>
      ))}
    </section>
  )
}
