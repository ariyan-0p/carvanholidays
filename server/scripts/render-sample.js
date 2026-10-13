// Render a sample itinerary PDF without a database:
//   node scripts/render-sample.js [out.pdf] [teal|sand|midnight]
import fs from 'fs'
import { packages } from '../src/data/packages.seed.js'
import { renderItineraryPdf } from '../src/services/itineraryPdf.js'
import { DEFAULT_SETTINGS } from '../src/config/itineraryDefaults.js'

const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`
const p = packages[0]
const days = p.itinerary.map((d, i) => ({ ...d }))
// show the editorial Morning / Afternoon / Evening layout on day 2
days[1] = {
  ...days[1],
  morning: 'Begin slowly with breakfast and a short walk through Leh market — nothing is required of you before 10 am.',
  afternoon: 'Visit Shanti Stupa, Magnetic Hill and the Hall of Fame, with a stop at Sangam where the Indus meets the Zanskar.',
  evening: 'Sunset chai on the hotel terrace, then a relaxed dinner.',
  attractions: 'Shanti Stupa, Magnetic Hill, Hall of Fame, Sangam Point',
  note: 'Carry a valid photo ID for all permits.',
}

const sample = {
  ref: 'CH-SAMPLE-0001',
  theme: process.argv[3] || 'teal',
  title: p.title,
  tagline: 'An all-women journey across the roof of the world',
  destination: p.destination,
  country: p.country,
  coverImage: p.image,
  customer: { name: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya@example.com' },
  consultant: { name: 'Arpit Khare', phone: '+91 91319 78160' },
  welcome: {
    heading: 'An invitation to Ladakh',
    body: 'Ladakh reveals itself in quiet moments — prayer flags in thin air, a chai shared at a high pass, a sky so clear it feels close enough to touch.\n\nThis journey is for women who want to slow down, laugh loudly and cross a few of the highest roads in the world together.',
    signoff: 'Warmly, Arpit',
  },
  sections: { welcome: true, reviews: true, carry: true },
  travelDate: '14 – 21 June 2026',
  nights: p.nights,
  days: p.days,
  adults: 2,
  children: 0,
  rooms: 1,
  overview: p.description,
  highlights: p.highlights,
  itinerary: days,
  hotelOptions: [
    {
      name: 'Grand Dragon Ladakh', stars: 5, rating: '8.9 Excellent', location: 'Leh', roomType: 'Deluxe Valley View', mealPlan: 'MAP (Breakfast + Dinner)', nights: 4,
      description: 'A landmark resort with valley views, a heated indoor pool and a spa — a comfortable base after high-altitude days.',
      images: [U('photo-1566073771259-6a8506099945'), U('photo-1582719508461-905c673771fd'), U('photo-1520250497591-112f2f40a3f4'), U('photo-1551882547-ff40c63fe5fa'), U('photo-1564501049412-61c2a3083791')],
      facilities: ['Heated pool', 'Spa & wellness', 'Free Wi-Fi', 'Airport shuttle', 'Restaurant', 'Bar'],
      notes: 'Early check-in subject to availability.',
    },
    { name: 'The Zen Ladakh', stars: 4, location: 'Leh', roomType: 'Superior Room', mealPlan: 'MAP (Breakfast + Dinner)', nights: 4, images: [U('photo-1542314831-068cd1dbfeeb'), U('photo-1578683010236-d716f9a3f461')] },
  ],
  flights: [
    { sector: 'DEL → IXL', airline: 'IndiGo', flightNo: '6E 2171', depart: '14 Jun, 06:10', arrive: '14 Jun, 07:35', baggage: 'Cabin 7 kg · Check-in 15 kg' },
    { sector: 'IXL → DEL', airline: 'IndiGo', flightNo: '6E 2172', depart: '21 Jun, 08:15', arrive: '21 Jun, 09:40', baggage: 'Cabin 7 kg · Check-in 15 kg' },
  ],
  vehicle: { kind: 'Tempo Traveller (12-seater)', pickup: 'Leh Airport', drop: 'Leh Airport', notes: 'Same vehicle and driver for the whole trip.' },
  inclusions: p.inclusions,
  exclusions: p.exclusions,
  currency: 'INR',
  priceLines: [
    { label: 'Hotels (7 nights, MAP)', amount: 38000 },
    { label: 'Transport & permits', amount: 16000 },
    { label: 'Experiences & guides', amount: 7200 },
    { label: 'GST (5%)', amount: 2800 },
  ],
  totalPrice: 64000,
  perPerson: 32000,
  priceNote: 'Inclusive of all taxes for 2 adults sharing one room',
  addons: [
    { name: 'Camel safari, Hunder', description: '45-minute ride on the Nubra dunes', price: 1200 },
    { name: 'Rafting, Zanskar', description: 'Half-day grade II–III rafting', price: 2500 },
  ],
  batches: [{ label: '14 June 2026', note: 'Few seats left' }, { label: '12 July 2026', note: 'Open' }, { label: '9 Aug 2026', note: 'Open' }],
  reviews: [
    { name: 'Riya K., Mumbai', rating: 5, text: 'Best women-only trip I have done — safe, fun and perfectly paced. Our trip captain was brilliant.' },
    { name: 'Neha S., Delhi', rating: 5, text: 'Every detail was handled. Pangong at sunrise is something I will never forget.' },
  ],
  thingsToCarry: [
    { group: 'Documents', items: ['Government photo ID', 'Printed permits', 'Travel insurance'] },
    { group: 'Clothing', items: ['Thermal layers', 'Down jacket', 'Sturdy trekking shoes', 'Sunglasses & cap'] },
    { group: 'Medicines', items: ['Diamox (as advised)', 'Personal prescriptions', 'Sunscreen SPF 50+'] },
    { group: 'Gear', items: ['Power bank', 'Reusable water bottle', 'Daypack'] },
  ],
  keepInMind: ['Rest on Day 1 — altitude is serious.', 'Network is patchy beyond Leh.'],
  validUntil: '30 May 2026',
  bookBy: '15 May 2026',
}
const settings = {
  ...DEFAULT_SETTINGS,
  bank: { ...DEFAULT_SETTINGS.bank, accountNumber: '0000 0000 0000', ifsc: 'XXXX0000000', bankName: 'Sample Bank', upiId: 'carvaan@upi' },
}
const out = process.argv[2] || 'sample-itinerary.pdf'
console.time('render')
fs.writeFileSync(out, await renderItineraryPdf(sample, settings))
console.timeEnd('render')
console.log('wrote', out)
