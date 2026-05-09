// Shelves on the homepage that admin can assign packages to.
// Order here defines the default top-to-bottom layout on the homepage.
export const HOME_SECTIONS = [
  {
    key: 'featured',
    label: 'Featured Packages',
    tag: 'Curated journeys',
    title: 'Featured Holiday Packages',
    subtitle: "Hand-picked itineraries crafted by our travel experts — every detail planned, every memory waiting.",
  },
  {
    key: 'top-picks',
    label: 'Top Picks This Month',
    tag: 'Travellers love',
    title: 'Top Picks This Month',
    subtitle: 'Most-loved getaways right now, going fast.',
  },
  {
    key: 'trending',
    label: 'Trending Now',
    tag: 'Trending',
    title: 'Trending Right Now',
    subtitle: 'Where everyone is heading — get on the list before it sells out.',
  },
  {
    key: 'weekend',
    label: 'Weekend Getaways',
    tag: 'Quick escapes',
    title: 'Weekend Getaways',
    subtitle: 'A short flight or a scenic drive — perfect for a 2-3 day reset.',
  },
  {
    key: 'offers',
    label: 'Special Offers',
    tag: 'Limited deals',
    title: 'Special Offers',
    subtitle: 'Limited-time fares and bundle savings — book before they end.',
  },
]

export const HOME_SECTION_KEYS = HOME_SECTIONS.map(s => s.key)
export const HOME_SECTION_LABELS = Object.fromEntries(HOME_SECTIONS.map(s => [s.key, s.label]))
