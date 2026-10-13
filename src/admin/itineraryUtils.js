// Small helpers shared by the itinerary admin screens.

export const openPdfBlob = (blob, name = 'itinerary.pdf') => {
  const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.target = '_blank'
  a.rel = 'noopener'
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export const shareUrl = (token) => `${window.location.origin}/api/itineraries/share/${token}/pdf`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export const formatDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
export const inDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return formatDate(d) }

export const THEMES = [
  { key: 'teal', label: 'Carvaan Teal', swatch: ['#0D3B40', '#63D60A'] },
  { key: 'sand', label: 'Forest & Sand', swatch: ['#33403A', '#C98A5B'] },
  { key: 'midnight', label: 'Midnight & Amber', swatch: ['#14213D', '#FCA311'] },
]

// Map a Package document onto the itinerary fields (the "start from package" automation).
export const itineraryFromPackage = (p, adults = 2) => ({
  title: p.title || '',
  destination: p.destination || '',
  country: p.country || '',
  coverImage: p.image || '',
  nights: p.nights ?? '',
  days: p.days ?? '',
  overview: p.description || p.summary || '',
  highlights: p.highlights || [],
  itinerary: (p.itinerary || []).map(d => ({
    day: d.day, title: d.title || '', description: d.description || '',
    location: d.location || '', meals: d.meals || [], stay: d.stay || '',
    activities: d.activities || [], image: d.image || '',
  })),
  inclusions: p.inclusions || [],
  exclusions: p.exclusions || [],
  hotelOptions: (p.hotels || []).filter(Boolean).map(name => ({ name })),
  perPerson: p.price || '',
  totalPrice: p.price ? Number(p.price) * adults : '',
  sourcePackageSlug: p.slug,
})

// Copy a saved template into a fresh itinerary: keep all content, drop identity + customer.
export const itineraryFromTemplate = (t) => {
  // eslint-disable-next-line no-unused-vars
  const { _id, ref, shareToken, createdAt, updatedAt, __v, isTemplate, templateName, status, customer, travelDate, ...rest } = t
  return rest
}
