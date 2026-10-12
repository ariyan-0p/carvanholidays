// Helpers shared by the itinerary timeline (and mirrored on the server for the PDF).

export const MEAL_KEYS = ['breakfast', 'lunch', 'dinner']

// Pick an icon name for an activity line from the words in it.
export function activityKind(text = '') {
  const t = text.toLowerCase()
  if (/flight|fly|airline|airport transfer by air/.test(t)) return 'flight'
  if (/transfer|pick.?up|drop|drive|cab|coach|car\b|transport|bus|train|ferry|cruise|boat/.test(t)) return 'transfer'
  if (/check.?in|check.?out|hotel|resort|camp|stay/.test(t)) return 'stay'
  if (/leisure|free time|at leisure|relax|rest/.test(t)) return 'leisure'
  return 'sightseeing'
}

// Roll the whole itinerary up into the numbers shown above the timeline.
export function summarize(itinerary = [], pkg = {}) {
  const days = itinerary.length || pkg.days || 0
  const stays = new Set(itinerary.map(d => (d.stay || '').trim().toLowerCase()).filter(Boolean))
  let meals = 0
  let activities = 0
  itinerary.forEach(d => {
    meals += (d.meals || []).filter(m => MEAL_KEYS.includes(m)).length
    activities += (d.activities || []).length
  })
  return { days, nights: pkg.nights ?? Math.max(0, days - 1), stays: stays.size, meals, activities }
}

export const pad2 = (n) => String(n).padStart(2, '0')
