import { useEffect, useMemo, useRef, useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import { MEAL_KEYS, activityKind, pad2, summarize } from '../utils/itinerary'
import './ItineraryTimeline.css'

/* ---------- tiny inline icons ---------- */
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
const Icon = ({ name, size = 16 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', ...stroke, 'aria-hidden': true }
  switch (name) {
    case 'breakfast': return <svg {...p}><path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2" /><path d="M8 3c0 1.2 1 1.2 1 2.4M12 3c0 1.2 1 1.2 1 2.4" /></svg>
    case 'lunch': return <svg {...p}><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5" /><path d="M17 3c-2 1.5-3 4-3 7h3v11" /></svg>
    case 'dinner': return <svg {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /></svg>
    case 'stay': return <svg {...p}><path d="M3 19V6M3 12h18v7M21 12V9a2 2 0 0 0-2-2h-8v5" /><circle cx="7" cy="9" r="1.6" /></svg>
    case 'transfer': return <svg {...p}><path d="M5 16V11l2-5h10l2 5v5M3 16h18M7 16v2M17 16v2" /><circle cx="8" cy="13" r=".6" /><circle cx="16" cy="13" r=".6" /></svg>
    case 'flight': return <svg {...p}><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" /></svg>
    case 'leisure': return <svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>
    case 'pin': return <svg {...p}><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
    case 'chevron': return <svg {...p}><path d="m6 9 6 6 6-6" /></svg>
    case 'check': return <svg {...p} strokeWidth="2.6"><path d="m5 13 4 4L19 7" /></svg>
    default: return <svg {...p}><path d="m3 17 6-9 4 6 3-4 5 7H3Z" /><circle cx="17" cy="7" r="1.5" /></svg> // sightseeing
  }
}

const MEAL_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

function Day({ day, index, open, onToggle, registerRef }) {
  const [revealRef, shown] = useReveal({ threshold: 0.12 })
  const hasMealData = Array.isArray(day.meals)
  const meals = (day.meals || []).filter(m => MEAL_KEYS.includes(m))
  const activities = (day.activities || []).filter(Boolean)
  const body = day.description

  return (
    <li
      ref={(el) => { revealRef.current = el; registerRef(el) }}
      id={`day-${day.day ?? index + 1}`}
      className={`tl__day reveal ${shown ? 'is-visible' : ''} ${open ? 'is-open' : ''}`}
    >
      <span className="tl__node" aria-hidden="true"><b>{pad2(day.day ?? index + 1)}</b></span>

      <div className="tl__card">
        <button
          type="button"
          className="tl__head"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`day-body-${index}`}
        >
          <span className="tl__head-text">
            <span className="tl__eyebrow">
              Day {pad2(day.day ?? index + 1)}
              {day.location && <><i /><Icon name="pin" size={12} />{day.location}</>}
            </span>
            <span className="tl__title">{day.title}</span>
          </span>

          {/* compact preview when collapsed */}
          <span className="tl__peek" aria-hidden="true">
            {meals.map(m => <span key={m} className="tl__peek-dot" title={MEAL_LABEL[m]}><Icon name={m} size={13} /></span>)}
            {day.stay && <span className="tl__peek-dot" title={day.stay}><Icon name="stay" size={13} /></span>}
          </span>

          <span className="tl__chev"><Icon name="chevron" size={18} /></span>
        </button>

        <div className="tl__collapse" id={`day-body-${index}`} role="region">
          <div className="tl__collapse-inner">
            {day.image && (
              <figure className="tl__photo">
                <img src={day.image} alt={day.title} loading="lazy" />
              </figure>
            )}

            {body && <p className="tl__desc">{body}</p>}

            {activities.length > 0 && (
              <ul className="tl__acts">
                {activities.map((a, i) => (
                  <li key={i} className={`tl__act tl__act--${activityKind(a)}`}>
                    <span className="tl__act-ico"><Icon name={activityKind(a)} size={15} /></span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            )}

            {(hasMealData || day.stay) && (
              <div className="tl__facts">
                {hasMealData && (
                  <div className="tl__meals" aria-label="Meals included">
                    {MEAL_KEYS.map(m => {
                      const on = meals.includes(m)
                      return (
                        <span key={m} className={`tl__meal ${on ? 'is-on' : ''}`}>
                          <Icon name={m} size={15} />
                          {MEAL_LABEL[m]}
                          {on && <span className="tl__meal-tick"><Icon name="check" size={10} /></span>}
                        </span>
                      )
                    })}
                  </div>
                )}
                {day.stay && (
                  <div className="tl__stay">
                    <span className="tl__stay-ico"><Icon name="stay" size={18} /></span>
                    <span>
                      <small>Overnight stay</small>
                      <strong>{day.stay}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export default function ItineraryTimeline({ itinerary = [], pkg = {} }) {
  const days = useMemo(
    () => [...itinerary].sort((a, b) => (a.day ?? 0) - (b.day ?? 0)),
    [itinerary]
  )
  const stats = useMemo(() => summarize(days, pkg), [days, pkg])

  const [openSet, setOpenSet] = useState(() => new Set([0]))
  const [active, setActive] = useState(0)
  const listRef = useRef(null)
  const dayEls = useRef([])
  const navRef = useRef(null)

  const allOpen = openSet.size === days.length
  const toggle = (i) => setOpenSet(prev => {
    const next = new Set(prev)
    if (next.has(i)) next.delete(i); else next.add(i)
    return next
  })
  const toggleAll = () => setOpenSet(allOpen ? new Set() : new Set(days.map((_, i) => i)))

  // Scroll-linked rail: the lime line fills and the plane rides it down the page.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = list.getBoundingClientRect()
      const probe = window.innerHeight * 0.45
      const p = Math.min(1, Math.max(0, (probe - r.top) / Math.max(1, r.height)))
      list.style.setProperty('--p', p.toFixed(4))

      // which day is nearest the probe line
      let idx = 0
      dayEls.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= probe) idx = i
      })
      setActive(idx)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [days.length, openSet])

  // keep the active chip visible inside the horizontal day-nav
  useEffect(() => {
    const nav = navRef.current
    const chip = nav?.children[active]
    if (nav && chip) nav.scrollTo({ left: chip.offsetLeft - nav.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' })
  }, [active])

  const jump = (i) => {
    setOpenSet(prev => new Set(prev).add(i))
    requestAnimationFrame(() => {
      const el = dayEls.current[i]
      if (!el) return
      const top = el.getBoundingClientRect().top + window.scrollY - 150
      window.scrollTo({ top, behavior: 'smooth' })
    })
  }

  if (!days.length) return null

  const tiles = [
    { k: 'days', n: stats.days, label: stats.days === 1 ? 'Day' : 'Days' },
    { k: 'nights', n: stats.nights, label: stats.nights === 1 ? 'Night' : 'Nights' },
    { k: 'stays', n: stats.stays, label: stats.stays === 1 ? 'Stay' : 'Stays' },
    { k: 'meals', n: stats.meals, label: 'Meals' },
    { k: 'acts', n: stats.activities, label: 'Experiences' },
  ].filter(t => t.n > 0)

  return (
    <div className="tl">
      <div className="tl__summary">
        {tiles.map(t => (
          <div key={t.k} className="tl__tile">
            <strong>{pad2(t.n)}</strong>
            <span>{t.label}</span>
          </div>
        ))}
        <button type="button" className="tl__toggle-all" onClick={toggleAll}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <nav className="tl__nav" aria-label="Jump to day">
        <div className="tl__nav-track" ref={navRef}>
          {days.map((d, i) => (
            <button
              key={i}
              type="button"
              className={`tl__chip ${i === active ? 'is-active' : ''}`}
              onClick={() => jump(i)}
            >
              Day {d.day ?? i + 1}
            </button>
          ))}
        </div>
      </nav>

      <ol className="tl__list" ref={listRef}>
        <span className="tl__rail" aria-hidden="true">
          <span className="tl__rail-fill" />
          <span className="tl__plane">
            <svg viewBox="0 0 24 24" width="26" height="26"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" fill="currentColor" /></svg>
          </span>
        </span>

        {days.map((d, i) => (
          <Day
            key={i}
            day={d}
            index={i}
            open={openSet.has(i)}
            onToggle={() => toggle(i)}
            registerRef={(el) => { dayEls.current[i] = el }}
          />
        ))}
      </ol>
    </div>
  )
}
