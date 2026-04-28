// Seed data — Carvaan Holidays packages.
// Real packages are added in batches as the client provides them.
// Run `npm run seed` from /server to wipe & reseed in MongoDB.
//
// Pricing convention: `price` is per person (we divide 2-pax PDF totals by 2).

export const packages = [
  // ===== Batch 1 =====
  {
    slug: 'malaysia-kuala-lumpur-4n5d',
    title: 'Malaysia — Kuala Lumpur Getaway',
    destination: 'Kuala Lumpur',
    country: 'Malaysia',
    category: 'family',
    duration: '4N / 5D',
    nights: 4,
    days: 5,
    price: 24750,                 // per person (₹49,500 / 2 pax)
    totalPrice: 49500,            // 2-pax package total from quote
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1573548842355-73bb50e50323?auto=format&fit=crop&w=1200&q=80', // Petronas towers
      'https://images.unsplash.com/photo-1582630553254-44b32cb6814a?auto=format&fit=crop&w=1200&q=80', // Batu Caves
      'https://images.unsplash.com/photo-1601999915933-bd1ada30d3a5?auto=format&fit=crop&w=1200&q=80', // Genting
    ],
    badge: 'Popular',
    rating: 4.7,
    reviews: 142,
    summary: 'Kuala Lumpur, Genting Highlands, Batu Caves and Petronas Twin Towers.',
    description:
      "A perfectly paced 5-day Malaysia escape — explore the high-rise charm of Kuala Lumpur, ride the cable car at Genting Highlands, marvel at the limestone caves of Batu and pose with the iconic Petronas Twin Towers. Stay at a 3-star hotel with daily breakfast, all transfers and city tours on a private basis.",
    highlights: [
      'Genting Highlands day trip',
      'Two-way cable car ride',
      'Batu Caves photo stop',
      'KL half-day city tour',
      'Petronas Twin Towers visit',
      'Private AC transfers',
    ],
    inclusions: [
      '4 nights at 3-star Ramada Encore (or similar) with breakfast',
      'Airport pickup and drop on private basis',
      'Genting Highlands day trip with two-way cable car',
      'Batu Caves photo stop en-route to Genting',
      'KL half-day city tour (Kings Place, National Monument, Independence Square, Beryl\'s Chocolate Factory)',
      'All transfers in private AC vehicle',
    ],
    exclusions: [
      'International airfare',
      'Visa fees',
      'Lunch and dinner',
      'Personal expenses, tips and gratuities',
      'Anything not mentioned in inclusions',
    ],
    itinerary: [
      { day: 1, title: 'Arrive at Kuala Lumpur', description: 'Welcome to Malaysia! Airport pickup and transfer to your hotel. Check-in at 1400 hrs. Evening at leisure. Overnight at KL hotel.' },
      { day: 2, title: 'Genting Highlands + Batu Caves', description: 'Post breakfast, drive up to Genting Highlands (RWG) with a 20-min photo stop at the limestone Batu Caves. Enjoy the two-way cable car and the casino-resort city before returning to KL.' },
      { day: 3, title: 'KL Half-day City Tour', description: 'After breakfast, half-day private city tour — Kings Place, National Monument, Independence Square, Beryl\'s Chocolate Factory and a photo stop at the Petronas Twin Towers.' },
      { day: 4, title: 'Day at Leisure', description: 'Free day to shop, explore Bukit Bintang, or take an optional Sunway Lagoon / Aquaria KLCC excursion.' },
      { day: 5, title: 'Departure', description: 'Breakfast at the hotel and private airport transfer for your flight back home.' },
    ],
    featured: true,
    active: true,
  },
  {
    slug: 'magical-sri-lanka-5n6d',
    title: 'Magical Sri Lanka — Kandy · Nuwara Eliya · Bentota · Colombo',
    destination: 'Sri Lanka',
    country: 'Sri Lanka',
    category: 'heritage',
    duration: '5N / 6D',
    nights: 5,
    days: 6,
    price: 37750,                 // per person (₹75,500 / 2 pax)
    totalPrice: 75500,
    image: 'https://images.unsplash.com/photo-1586181620541-bc4c0d9f5b1b?auto=format&fit=crop&w=1200&q=80', // Sigiriya
    gallery: [
      'https://images.unsplash.com/photo-1546708973-b3a26c0d1c2f?auto=format&fit=crop&w=1200&q=80', // Nine Arch Bridge
      'https://images.unsplash.com/photo-1577094312651-23eebcb6f2bb?auto=format&fit=crop&w=1200&q=80', // tea plantation
      'https://images.unsplash.com/photo-1586172493039-3a4eecca33dc?auto=format&fit=crop&w=1200&q=80', // Kandy temple
    ],
    badge: 'Best Seller',
    rating: 4.8,
    reviews: 96,
    summary: 'Hill country, beach and capital — the perfect island sampler.',
    description:
      "A 6-day journey through the heart of Sri Lanka. Begin in misty Kandy with the Temple of the Tooth, climb up to the tea estates of Nuwara Eliya, unwind on the golden beaches of Bentota, and finish in the colonial-meets-modern capital, Colombo. All hotels are 3-star with breakfast and dinner included (Half Board), and you travel in a private AC vehicle throughout.",
    highlights: [
      'Pinnawela Elephant Orphanage',
      'Temple of the Tooth Relic, Kandy',
      'Tea factory tour in Nuwara Eliya',
      'Madhu River boat ride, Bentota',
      'Turtle Hatchery visit',
      'Colombo city tour',
    ],
    inclusions: [
      '5 nights accommodation at 3-star hotels (Hotel Devon, Ashford, Rathna Beach Resort/Coco Royal, Berjaya Hotel Colombo)',
      'Daily breakfast and dinner (Half Board)',
      'Pickup and drop at Bandaranaike International Airport',
      'All inter-city transfers in private AC vehicle',
      'Kandy full city tour',
      'Nuwara Eliya full city tour',
      'Bentota sightseeing',
      'Colombo full city tour',
    ],
    exclusions: [
      'International airfare',
      'Visa fees / ETA',
      'Lunch',
      'Monument and entrance fees',
      'Personal expenses, tips and gratuities',
      'Anything not mentioned in inclusions',
    ],
    itinerary: [
      { day: 1, title: 'Arrive Colombo → Kandy', description: 'Pickup from Bandaranaike International Airport and drive to Kandy — the last royal capital and a UNESCO World Heritage site. Check-in and overnight at Hotel Devon.' },
      { day: 2, title: 'Kandy Full City Tour', description: 'Visit Pinnawela Elephant Orphanage, the Peradeniya Botanical Gardens, the sacred Temple of the Tooth Relic (Dalada Maligawa) and the Gem Museum. Evening at leisure.' },
      { day: 3, title: 'Kandy → Nuwara Eliya', description: 'Drive into the cool hill country. City tour of Nuwara Eliya — visit a working tea factory, Seetha Eliya temple and Hakgala Gardens. Overnight at Ashford Hotel.' },
      { day: 4, title: 'Nuwara Eliya → Bentota', description: 'Drive down to the coast. Madhu River boat ride through mangroves and a visit to the Turtle Hatchery. Overnight at Rathna Beach Resort (Coco Royal).' },
      { day: 5, title: 'Bentota → Colombo', description: 'Transfer to Colombo. City tour — Galle Face Green, Viharamahadevi Park, National Museum, Independence Square, Fort district. Optional shopping at Odel and House of Fashion. Overnight at Berjaya Hotel Colombo.' },
      { day: 6, title: 'Departure', description: 'Transfer to Bandaranaike International Airport for your flight home.' },
    ],
    featured: true,
    active: true,
  },

  // ===== Demo placeholders kept for the homepage until more real packages arrive =====
  {
    slug: 'bali-island-of-the-gods',
    title: 'Bali — Island of the Gods',
    destination: 'Bali',
    country: 'Indonesia',
    category: 'beach',
    duration: '7N / 8D',
    nights: 7, days: 8, price: 45000,
    image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80',
    ],
    badge: 'Best Seller', rating: 4.9, reviews: 248,
    summary: 'Temples, rice terraces and beaches across the magical island.',
    description: 'Discover Bali — from Uluwatu cliffs to Ubud rice terraces and Seminyak beaches. (Demo package — replace with real itinerary.)',
    highlights: ['Airport Transfers', '4-Star Hotels', 'Daily Breakfast', 'Temple Tours', 'Rice Terrace Walk'],
    inclusions: ['Demo data — to be updated'],
    exclusions: ['Demo data — to be updated'],
    itinerary: [],
    featured: true, active: true,
  },
  {
    slug: 'maldives-luxury-escape',
    title: 'Maldives Luxury Escape',
    destination: 'Maldives', country: 'Maldives', category: 'luxury',
    duration: '5N / 6D', nights: 5, days: 6, price: 85000,
    image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80',
    badge: 'Luxury', rating: 5.0, reviews: 132,
    summary: 'Overwater villas, turquoise lagoons and golden sunsets.',
    description: 'A premium island getaway. (Demo package — replace with real itinerary.)',
    highlights: ['Overwater Villa', 'All Meals', 'Snorkelling', 'Sunset Cruise', 'Seaplane Transfer'],
    inclusions: ['Demo data — to be updated'],
    exclusions: ['Demo data — to be updated'],
    itinerary: [],
    featured: true, active: true,
  },
]
