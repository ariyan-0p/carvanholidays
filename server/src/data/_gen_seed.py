import json, sys, re, hashlib
sys.stdout.reconfigure(encoding='utf-8')

src = r'C:/PROJECTS LEARNING AND MAIN/carvanholidays/server/src/data/extracted-packages.json'
data = json.load(open(src, encoding='utf-8'))
skip = {
    'Langkawi Beach Getaway','Mauritius Island Escape','Sri Lanka Cultural Triangle',
    'Dazzling Dubai','Vietnam Highlights - Hanoi & Halong Bay',
    'Wonders of Vietnam','Vietnam Beach Escape - Phu Quoc',
}
kept = [p for p in data if p['title'] not in skip]

img = {
    'Ladakh':       ['photo-1626621341517-bbf3d9990a23','photo-1571115228074-c4023b71b6e6','photo-1582035834881-5f2c92dba74d'],
    'Baku':         ['photo-1565008447742-97f6f38c985c','photo-1572252009286-268acec5ca0a','photo-1606768666853-403c90a981ad'],
    'Bhutan':       ['photo-1585155770447-2f66e2a397b5','photo-1544216428-1a4d2d56a13d','photo-1606298855672-3efb63017be8'],
    'Europe':       ['photo-1499856871958-5b9627545d1a','photo-1471623432079-b009d30b6729','photo-1502602898657-3e91760cbb34'],
    'Georgia':      ['photo-1565008447742-97f6f38c985c','photo-1573687867948-fae28a8c4e2c','photo-1606768666853-403c90a981ad'],
    'Gujarat':      ['photo-1567157577867-05ccb1388e66','photo-1582719471384-894fbb16e074','photo-1517760444937-f6397edcbbcd'],
    'Kashmir':      ['photo-1599661046289-e31897846e41','photo-1605649487212-47bdab064df7','photo-1547114178-c4ddabbac6ea'],
    'Kerala':       ['photo-1602216056096-3b40cc0c9944','photo-1593693397690-362cb9666fc2','photo-1582510003544-4d00b7f74220'],
    'Malaysia':     ['photo-1596422846543-75c6fc197f07','photo-1573548842355-73bb50e50323','photo-1601999915933-bd1ada30d3a5'],
    'Maldives':     ['photo-1573843981267-be1999ff37cd','photo-1514282401047-d79a71a590e8','photo-1540541338287-41700207dee6'],
    'Meghalaya':    ['photo-1626059280636-1d44ca1d35cd','photo-1585579898497-cc9b18a90b0e','photo-1605649487212-47bdab064df7'],
    'Mysore':       ['photo-1582510003544-4d00b7f74220','photo-1582034986517-30d094ba0bb6','photo-1593693397690-362cb9666fc2'],
    'Nepal':        ['photo-1544735716-392fe2489ffa','photo-1605649487212-47bdab064df7','photo-1606999000208-50d0a4d04114'],
    'Philippines':  ['photo-1518509562904-e7ef99cddc85','photo-1535930891776-0c2dfb7fda1a','photo-1518483416533-bf24d6837d97'],
    'Rajasthan':    ['photo-1599661046289-e31897846e41','photo-1477587458883-47465ed62a0b','photo-1517760444937-f6397edcbbcd'],
    'Shimla':       ['photo-1605649487212-47bdab064df7','photo-1626059280636-1d44ca1d35cd','photo-1547114178-c4ddabbac6ea'],
    'Sikkim':       ['photo-1626059280636-1d44ca1d35cd','photo-1599661046289-e31897846e41','photo-1605649487212-47bdab064df7'],
    'Sri Lanka':    ['photo-1586181620541-bc4c0d9f5b1b','photo-1546708973-b3a26c0d1c2f','photo-1577094312651-23eebcb6f2bb'],
}

def lookup_img(p):
    for key in img:
        kl = key.lower()
        if kl in p['destination'].lower() or kl in p['country'].lower() or kl in p['title'].lower():
            return img[key]
    return img['Europe']

def slugify(s):
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip('-')

def js_str(s):
    if s is None: return "''"
    s = str(s).replace("\\","\\\\")
    s = s.replace("'", "\\'")
    s = s.replace("\n", " ").replace("\r", " ")
    return "'" + s + "'"

def js_arr(arr):
    if not arr: return "[]"
    return "[\n      " + ",\n      ".join(js_str(x) for x in arr) + "\n    ]"

featured_titles = {
    'Magical Maldives Honeymoon','Bhutan Buddhist Trail','Blissful Kashmir',
    'Romantic Kerala','Magical Sri Lanka','Glimpses of Europe',
    'Malaysia - Kuala Lumpur and Genting','Philippines Island Hopping',
}
badge_map = {
    'Magical Maldives Honeymoon':'Luxury',
    'Glimpses of Europe':'Premium',
    'Wonders of Europe':'Premium',
    'Bhutan Buddhist Trail':'Best Seller',
    'Blissful Kashmir':'Popular',
    'Romantic Kerala':'Honeymoon',
    'Magical Sri Lanka':'Best Seller',
    'Malaysia - Kuala Lumpur and Genting':'Popular',
    'Philippines Island Hopping':'Adventure',
    'Leh Ladakh Bike Trip':'Adventure',
    'Blissful Ladakh - All Girls Trip':'Women Only',
    'Splendid Sikkim':'Popular',
}

def rating_for(title):
    h = int(hashlib.md5(title.encode()).hexdigest()[:4], 16)
    return round(4.5 + (h % 50)/100, 1)
def reviews_for(title):
    h = int(hashlib.md5(title.encode()).hexdigest()[:6], 16)
    return 60 + (h % 220)

def render(p):
    imgs = lookup_img(p)
    base = 'https://images.unsplash.com/'
    main_img = base + imgs[0] + '?auto=format&fit=crop&w=1200&q=80'
    gallery = [base + x + '?auto=format&fit=crop&w=1200&q=80' for x in imgs[1:]]
    slug = slugify(p['title'])
    title = p['title']
    badge = badge_map.get(title, '')
    featured = title in featured_titles
    rating = rating_for(title)
    reviews = reviews_for(title)
    itin_lines = []
    for d in p.get('itinerary') or []:
        itin_lines.append(
            "      { day: %d, title: %s, description: %s }" % (
                d.get('day', 0), js_str(d.get('title', '')), js_str(d.get('description', ''))
            )
        )
    itin = "[\n" + ",\n".join(itin_lines) + "\n    ]" if itin_lines else "[]"
    gallery_inner = ",\n      ".join(js_str(g) for g in gallery)
    parts = []
    parts.append("  {")
    parts.append("    slug: " + js_str(slug) + ",")
    parts.append("    title: " + js_str(title) + ",")
    parts.append("    destination: " + js_str(p['destination']) + ",")
    parts.append("    country: " + js_str(p['country']) + ",")
    parts.append("    category: " + js_str(p['category']) + ",")
    parts.append("    duration: " + js_str(p['duration']) + ",")
    parts.append("    nights: " + str(p['nights']) + ",")
    parts.append("    days: " + str(p['days']) + ",")
    parts.append("    price: " + str(p['pricePerPerson']) + ",")
    parts.append("    totalPrice: " + str(p['totalPrice']) + ",")
    parts.append("    pax: " + str(p['pax']) + ",")
    parts.append("    image: " + js_str(main_img) + ",")
    parts.append("    gallery: [\n      " + gallery_inner + "\n    ],")
    parts.append("    badge: " + js_str(badge) + ",")
    parts.append("    rating: " + str(rating) + ",")
    parts.append("    reviews: " + str(reviews) + ",")
    parts.append("    summary: " + js_str(p.get('summary', '')) + ",")
    parts.append("    description: " + js_str(p.get('description', '')) + ",")
    parts.append("    highlights: " + js_arr(p.get('highlights') or []) + ",")
    parts.append("    inclusions: " + js_arr(p.get('inclusions') or []) + ",")
    parts.append("    exclusions: " + js_arr(p.get('exclusions') or []) + ",")
    parts.append("    hotels: " + js_arr(p.get('hotels') or []) + ",")
    parts.append("    itinerary: " + itin + ",")
    parts.append("    featured: " + ("true" if featured else "false") + ",")
    parts.append("    active: true,")
    parts.append("  }")
    return "\n".join(parts)

entries = ",\n".join(render(p) for p in kept)

header = (
    "// Seed data - Carvaan Holidays packages.\n"
    "// Auto-generated from PDFs in src/assets/packages/.\n"
    "// Run `npm run seed` from /server to wipe & reseed.\n"
    "//\n"
    "// Pricing convention: `price` is per person.\n"
    "//   `totalPrice` is the original quote total for `pax` travelers.\n\n"
    "export const packages = [\n"
)
footer = "\n]\n"

out_path = r'C:/PROJECTS LEARNING AND MAIN/carvanholidays/server/src/data/packages.seed.js'
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(header + entries + footer)
print("Wrote " + str(len(kept)) + " packages to " + out_path)
