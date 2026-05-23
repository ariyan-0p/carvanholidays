import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    to: { type: String, default: '/packages' },
    color: { type: String, default: '#14b8a6' },
    icon: { type: String, default: 'sparkles' }, // key from a known icon set
    badge: { type: String, default: '' },        // "Popular", "Hot", "New", or empty
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { _id: true, timestamps: false }
)

const tabPopularSchema = new mongoose.Schema(
  {
    tab: { type: String, required: true, trim: true }, // "Holidays" | "Flights" | "Hotels" | "Visa" | "Cars"
    items: { type: [String], default: [] },            // list of quick-pick chips
  },
  { _id: false }
)

const searchSectionSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },

    // Header copy shown above the form
    eyebrow:  { type: String, default: 'Plan your escape' },
    headline: { type: String, default: 'Where will you go next?' },
    headlineAccent: { type: String, default: 'go next?' }, // italic-coloured slice of the headline
    lede:     { type: String, default: "Tell us what you're after — or pick a category and we'll take it from there." },

    // Stat ribbon
    showStats: { type: Boolean, default: true },
    stats: {
      type: [{ value: String, label: String }],
      default: [
        { value: '40+',    label: 'Curated packages' },
        { value: '25',     label: 'Countries covered' },
        { value: '10,000+', label: 'Happy travellers' },
        { value: '4.9★',   label: 'Average rating' },
      ],
    },

    // Categories — the SubNav items, now editable
    categories: {
      type: [categorySchema],
      default: [
        { label: 'Group Tours',      tagline: 'Travel together, save together',  to: '/packages',     color: '#2563eb', icon: 'group',    badge: 'Popular', order: 1 },
        { label: 'Holiday Deals',    tagline: 'Curated escapes at special prices', to: '/packages',   color: '#f59e0b', icon: 'fire',     badge: 'Hot',     order: 2 },
        { label: 'Travel Styles',    tagline: 'Pick how you want to travel',     to: '/packages',     color: '#8b5cf6', icon: 'sparkles', badge: '',        order: 3 },
        { label: 'Upcoming Tours',   tagline: 'Fixed departures, ready to book', to: '/packages',     color: '#10b981', icon: 'rocket',   badge: 'New',     order: 4 },
        { label: 'Car Rentals',      tagline: 'Self-drive or with chauffeur',    to: '/car-rentals',  color: '#0ea5e9', icon: 'car',      badge: '',        order: 5 },
        { label: 'Weekend Getaways', tagline: 'Quick escapes close to home',     to: '/cities',       color: '#ec4899', icon: 'beach',    badge: '',        order: 6 },
        { label: 'Customised Trips', tagline: 'Built entirely around you',       to: '/contact',      color: '#14b8a6', icon: 'target',   badge: '',        order: 7 },
        { label: 'More About Us',    tagline: 'Stories, blogs & beyond',         to: '/about',        color: '#475569', icon: 'info',     badge: '',        order: 8 },
      ],
    },

    // Popular quick-picks for each tab
    popularByTab: {
      type: [tabPopularSchema],
      default: [
        { tab: 'Holidays', items: ['Bali', 'Maldives', 'Goa', 'Thailand', 'Europe'] },
        { tab: 'Flights',  items: ['Delhi', 'Mumbai', 'Bangalore', 'Dubai', 'Singapore'] },
        { tab: 'Hotels',   items: ['Jaipur', 'Shimla', 'Goa', 'Manali', 'Udaipur'] },
        { tab: 'Visa',     items: ['Dubai', 'Schengen', 'Thailand', 'Singapore', 'UK'] },
        { tab: 'Cars',     items: ['Delhi', 'Mumbai', 'Bangalore', 'Jaipur', 'Goa'] },
      ],
    },
  },
  { timestamps: true }
)

export default mongoose.model('SearchSection', searchSectionSchema)
