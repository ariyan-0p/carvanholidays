// Built-in fallbacks for the itinerary PDF. Anything saved on the
// "Itinerary settings" admin page (or on the itinerary itself) overrides these.
// Bank details are deliberately blank: they must be entered in the admin.

export const DEFAULT_SECTIONS = {
  welcome: false, // personal letter – opt in per itinerary
  contents: true,
  snapshot: true,
  whyUs: true,
  glance: true,
  days: true,
  hotels: true,
  flights: true,
  vehicle: true,
  pricing: true,
  addons: true,
  inclusions: true,
  dates: true,
  reviews: false,
  policies: true,
  booking: true,
  carry: false,
  closing: true,
}

export const SECTION_LABELS = {
  welcome: 'Welcome letter',
  contents: 'Contents',
  snapshot: 'Trip snapshot',
  whyUs: 'Why travel with us',
  glance: 'Itinerary at a glance',
  days: 'Day-by-day itinerary',
  hotels: 'Where you’ll stay',
  flights: 'Flights',
  vehicle: 'Transport',
  pricing: 'Pricing',
  addons: 'Optional add-ons',
  inclusions: 'Inclusions & exclusions',
  dates: 'Travel dates',
  reviews: 'Guest reviews',
  policies: 'Cancellation & terms',
  booking: 'Payment & booking',
  carry: 'Things to carry',
  closing: 'Closing page',
}

export const DEFAULT_SETTINGS = {
  company: {
    name: 'Carvaan Holidays',
    tagline: 'Travel the way you imagine',
    address: 'Shop no. 46, Shakti Nagar Market Complex, DRM Road, Bhopal – 462022',
    phone: '+91 91319 78160',
    altPhone: '',
    email: 'info@carvaanholidays.com',
    website: 'www.carvaanholidays.com',
    instagram: '@carvaanholidays',
    whatsapp: '919131978160',
    founderName: 'Arpit Khare',
    founderTitle: 'Founder',
  },
  bank: { accountName: 'Carvaan Holidays', accountNumber: '', ifsc: '', accountType: 'Current', bankName: '', upiId: '' },
  whyUs:
    'We are a community of travellers who live for the next escape. With over 5 years of experience crafting itineraries, ' +
    'we plan every detail — stays, transfers, experiences — so you can simply show up and enjoy. Our trip captains and ' +
    'on-ground teams know each destination like the back of their hand, and we stay on call from the moment you book until ' +
    'the moment you are home. Safe, transparent and thoughtfully designed: that is the Carvaan promise.',
  advancePercent: 50,
  paymentTerms: '50% of the total amount is payable at the time of booking. The balance is to be paid on or before 5 days of the travel date.',
  cancellationSlabs: [
    { window: '45 days or more before travel', charge: 'Full refund' },
    { window: '30 – 44 days before travel', charge: '50% refund' },
    { window: 'Less than 30 days before travel', charge: 'No refund' },
  ],
  terms:
    'All guests must carry valid government photo ID.\n' +
    'Vehicles are provided for pick-up/drop and as per the itinerary; any extra usage is chargeable.\n' +
    'Services depend on weather and local conditions. In case of disruption we will do our best to provide an alternative.',
  reviews: [],
  keepInMind: [],
  thingsToCarry: [],
  closingTitle: 'Your story starts here.',
  closingMessage:
    'Thank you for considering us. Every detail in this itinerary can be tailored — tell us what you’d like to change and we’ll make it yours.',
}
