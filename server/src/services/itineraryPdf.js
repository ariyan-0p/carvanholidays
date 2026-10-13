// "Signature" itinerary / quote PDF template.
//
//   renderItineraryPdf(itinerary, settings) -> Buffer
//
// Three Chromium renders merged with pdf-lib:
//   1. cover  – full-bleed, zero page margin
//   2. body   – flowing A4 pages (sections below) with running footer + page numbers
//   3. back   – closing page with contact details and a QR code
//
// Every body section can be switched on/off per itinerary (itinerary.sections)
// and empty sections are skipped automatically. Colours come from a theme.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'
import QRCode from 'qrcode'
import { PDFDocument } from 'pdf-lib'
import { DEFAULT_SECTIONS, DEFAULT_SETTINGS, SECTION_LABELS } from '../config/itineraryDefaults.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS = path.resolve(__dirname, '../assets/pdf')
const nodeModule = (p) => path.resolve(__dirname, '../../node_modules', p)

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */
const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const nl2br = (v) => esc(v).replace(/\n/g, '<br>')
const pad2 = (n) => String(n).padStart(2, '0')
const money = (n, cur = 'INR') => {
  if (n == null || n === '' || Number.isNaN(Number(n))) return ''
  const sym = cur === 'INR' ? '₹' : cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur === 'THB' ? '฿' : cur + ' '
  return sym + Number(n).toLocaleString('en-IN')
}
const has = (v) => (Array.isArray(v) ? v.filter((x) => (typeof x === 'string' ? x.trim() : x)).length > 0 : v != null && String(v).trim() !== '')
const clean = (arr) => (arr || []).filter((x) => (typeof x === 'string' ? x.trim() : x))

const b64 = (file) => fs.readFileSync(file).toString('base64')
const dataUri = (file, mime) => `data:${mime};base64,${b64(file)}`

function fontFaces() {
  const mont = (w) =>
    `@font-face{font-family:'Montserrat';font-weight:${w};font-style:normal;src:url(data:font/woff2;base64,${b64(
      nodeModule(`@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff2`)
    )}) format('woff2');}`
  const fr = (style) =>
    `@font-face{font-family:'Fraunces';font-weight:100 900;font-style:${style};src:url(data:font/woff2;base64,${b64(
      nodeModule(`@fontsource-variable/fraunces/files/fraunces-latin-wght-${style}.woff2`)
    )}) format('woff2');}`
  return [400, 500, 600, 700].map(mont).join('') + fr('normal') + fr('italic')
}

// Turn a stored image path into something Chromium can load without a network hop.
function resolveImage(src) {
  if (!src) return ''
  if (/^data:/.test(src)) return src
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('/uploads/')) {
    const root = path.resolve(process.cwd(), 'uploads')
    const file = path.resolve(process.cwd(), src.replace(/^\//, ''))
    if (file.startsWith(root) && fs.existsSync(file)) {
      const ext = path.extname(file).slice(1).toLowerCase().replace('jpg', 'jpeg')
      return `data:image/${ext || 'jpeg'};base64,${b64(file)}`
    }
  }
  return ''
}

/* ------------------------------------------------------------------ */
/* themes                                                              */
/* ------------------------------------------------------------------ */
const THEMES = {
  teal: { deep: '#0D3B40', deep2: '#155560', accent: '#63D60A', accentDk: '#3f9a05', soft: '#E9FFC6', warm: '#F5F7F2', aqua: '#D6F9F3', bgFrom: '#0f4f58', bgTo: '#052a2f' },
  sand: { deep: '#33403A', deep2: '#4A5A4E', accent: '#C98A5B', accentDk: '#A8693D', soft: '#F6E7D8', warm: '#FAF6F0', aqua: '#E6ECE0', bgFrom: '#4A5A4E', bgTo: '#222B26' },
  midnight: { deep: '#14213D', deep2: '#23366B', accent: '#FCA311', accentDk: '#C77F00', soft: '#FFF0D2', warm: '#F4F6FA', aqua: '#E1E8F5', bgFrom: '#23366B', bgTo: '#0B1226' },
}
const themeCss = (t) =>
  `:root{--deep:${t.deep};--deep2:${t.deep2};--accent:${t.accent};--accent-dk:${t.accentDk};--soft:${t.soft};--warm:${t.warm};--aqua:${t.aqua};` +
  `--grey:#E6ECEF;--silver:#BFC5C9;--ink:#333;--muted:#6B7D83;--bg-from:${t.bgFrom};--bg-to:${t.bgTo};}`

/* ------------------------------------------------------------------ */
/* inline icons (stroke-based, match the website timeline)             */
/* ------------------------------------------------------------------ */
const ICONS = {
  breakfast: '<path d="M5 9h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z"/><path d="M16 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3c0 1.2 1 1.2 1 2.4M12 3c0 1.2 1 1.2 1 2.4"/>',
  lunch: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5"/><path d="M17 3c-2 1.5-3 4-3 7h3v11"/>',
  dinner: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  stay: '<path d="M3 19V6M3 12h18v7M21 12V9a2 2 0 0 0-2-2h-8v5"/><circle cx="7" cy="9" r="1.6"/>',
  transfer: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18M7 16v2M17 16v2"/><circle cx="8" cy="13" r=".6"/><circle cx="16" cy="13" r=".6"/>',
  flight: '<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z"/>',
  leisure: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  sightseeing: '<path d="m3 17 6-9 4 6 3-4 5 7H3Z"/><circle cx="17" cy="7" r="1.5"/>',
  check: '<path d="m5 13 4 4L19 7"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".6"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  ticket: '<path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3v3Z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z"/>',
}
const icon = (name, size = 14, extra = '') =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICONS[name] || ICONS.sightseeing}</svg>`

function activityKind(text = '') {
  const t = text.toLowerCase()
  if (/flight|fly|airline/.test(t)) return 'flight'
  if (/transfer|pick.?up|drop|drive|cab|coach|car\b|transport|bus|train|ferry|cruise|boat/.test(t)) return 'transfer'
  if (/check.?in|check.?out|hotel|resort|camp|stay/.test(t)) return 'stay'
  if (/leisure|free time|relax|rest/.test(t)) return 'leisure'
  return 'sightseeing'
}

const MEALS = ['breakfast', 'lunch', 'dinner']
const MEAL_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

function summarize(it) {
  const days = it.itinerary || []
  const stays = new Set(days.map((d) => (d.stay || '').trim().toLowerCase()).filter(Boolean))
  let meals = 0
  let acts = 0
  days.forEach((d) => {
    meals += (d.meals || []).filter((m) => MEALS.includes(m)).length
    acts += (d.activities || []).filter(Boolean).length
  })
  const nDays = days.length || it.days || 0
  return { days: nDays, nights: it.nights ?? Math.max(0, nDays - 1), stays: stays.size, meals, acts }
}

function travellersText(it) {
  const parts = []
  if (it.adults) parts.push(`${it.adults} Adult${it.adults > 1 ? 's' : ''}`)
  if (it.children) parts.push(`${it.children} Child${it.children > 1 ? 'ren' : ''}`)
  return parts.join(' + ') || '—'
}

/* ------------------------------------------------------------------ */
/* CSS                                                                 */
/* ------------------------------------------------------------------ */
const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Montserrat',sans-serif;color:var(--ink);font-size:9.2pt;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.ic{flex:0 0 auto;display:inline-block;vertical-align:middle}
`

const COVER_CSS = `
@page{size:210mm 297mm;margin:0}
.cover{position:relative;width:210mm;height:297mm;overflow:hidden;background:var(--deep);color:#fff}
.cover__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cover__shade{position:absolute;inset:0;background:
  linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 36%,rgba(0,0,0,.7) 72%,rgba(0,0,0,.92) 100%),
  linear-gradient(100deg,rgba(0,0,0,.35),rgba(0,0,0,0) 60%)}
.cover__tint{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,var(--deep) 100%);opacity:.75}
.cover__frame{position:absolute;inset:7mm;border:.3mm solid rgba(255,255,255,.4);border-radius:2mm;pointer-events:none}
.cover__stamp{position:absolute;right:15mm;top:40mm;width:34mm;height:34mm;opacity:.82;transform:rotate(-12deg)}
.cover__top{position:absolute;left:16mm;right:16mm;top:15mm;display:flex;justify-content:space-between;align-items:flex-start}
.cover__logo{width:46mm;height:auto;display:block}
.cover__ref{text-align:right;font-size:7.5pt;letter-spacing:.28em;text-transform:uppercase;line-height:1.9}
.cover__ref b{display:block;color:var(--accent);font-weight:600}
.cover__body{position:absolute;left:16mm;right:16mm;bottom:20mm}
.cover__eyebrow{display:flex;align-items:center;gap:4mm;font-size:8.5pt;font-weight:600;letter-spacing:.32em;text-transform:uppercase;color:var(--accent)}
.cover__eyebrow::before{content:'';width:12mm;height:.4mm;background:var(--accent)}
.cover__title{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:44pt;line-height:1.02;letter-spacing:-.02em;margin:5mm 0 3mm}
.cover__tag{font-family:'Fraunces',serif;font-size:13pt;font-weight:300;opacity:.92;margin-bottom:2mm}
.cover__dest{font-size:10.5pt;font-weight:500;letter-spacing:.18em;text-transform:uppercase;opacity:.9}
.cover__for{margin-top:9mm;display:inline-flex;align-items:center;gap:3mm;padding:2.6mm 6mm;border-radius:99mm;background:rgba(255,255,255,.12);border:.3mm solid rgba(255,255,255,.35);font-size:9pt}
.cover__for b{font-weight:600}
.cover__stats{margin-top:10mm;padding-top:6mm;border-top:.3mm solid rgba(255,255,255,.28);display:grid;grid-template-columns:repeat(4,1fr);gap:6mm}
.cover__stat small{display:block;font-size:6.6pt;letter-spacing:.26em;text-transform:uppercase;opacity:.65;margin-bottom:1.2mm}
.cover__stat strong{font-size:10.5pt;font-weight:600}
`

const BODY_CSS = `
@page{size:A4;margin:18mm 17mm 20mm}
:root{--paper:#FBF9F4}
html,body{background:var(--paper)}
.paper{position:fixed;z-index:-3;top:-18mm;bottom:-20mm;left:-17mm;right:-17mm;background:var(--paper)}
.deco{position:fixed;z-index:-1;pointer-events:none}
.deco--tr{top:-6mm;right:-8mm;width:78mm;opacity:.55}
.deco--bl{bottom:-4mm;left:-6mm;width:92mm;opacity:.7}
.divider{display:none;position:relative;height:5mm;margin:0 0 4mm;text-align:center;line-height:0;color:var(--accent-dk)}
.divider::before{content:'';position:absolute;left:0;right:0;top:2.5mm;border-top:.5mm dotted var(--silver)}
.divider .ic{position:relative;background:var(--paper);padding:0 3mm;box-sizing:content-box;transform:rotate(90deg)}
.has-div .sec-head .divider{display:block}
.sec-head{position:relative}
.sec-ic svg{width:100%;height:100%}
.sec-ic{position:absolute;right:0;top:-1mm;width:17mm;height:17mm;color:var(--deep);opacity:.1}
h2.sec{font-family:'Fraunces',serif;font-weight:400;font-size:21pt;line-height:1.15;color:var(--deep);letter-spacing:-.01em}
.eyebrow{display:flex;align-items:center;gap:3mm;font-size:7.4pt;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--accent-dk);margin-bottom:2.4mm}
.eyebrow::before{content:'';width:9mm;height:.35mm;background:var(--accent)}
.sec-head{margin-bottom:7mm;break-inside:avoid;break-after:avoid;page-break-after:avoid}
.section{margin-bottom:7mm}
.section.break{break-before:page}
.keep{break-inside:avoid;page-break-inside:avoid}
.lead{font-size:10pt;line-height:1.85;orphans:3;widows:3}
.sub{font-size:8pt;color:var(--muted)}
h4.mini{font-size:7.4pt;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--deep);margin-bottom:3mm}

/* welcome letter */
.welcome{display:grid;grid-template-columns:62mm 1fr;gap:10mm;align-items:start;padding:8mm;border-radius:5mm;background:var(--soft);margin-bottom:10mm}
.welcome__photo{width:62mm;height:78mm;object-fit:cover;border-radius:31mm 31mm 4mm 4mm;display:block;background:var(--aqua)}
.welcome h2{font-family:'Fraunces',serif;font-weight:400;font-size:20pt;line-height:1.15;color:var(--deep);margin:2mm 0 5mm}
.welcome p{font-size:9.4pt;line-height:1.85;margin-bottom:3mm}
.welcome .sign{font-family:'Fraunces',serif;font-style:italic;font-size:12pt;color:var(--deep);margin-top:5mm}
.welcome--nophoto{grid-template-columns:1fr}

/* contents */
.toc{columns:2;column-gap:12mm}
.toc li{list-style:none;display:flex;align-items:baseline;gap:3mm;padding:2.2mm 0;border-bottom:.25mm solid var(--grey);break-inside:avoid;font-size:9.6pt;font-weight:500;color:var(--deep)}
.toc li b{font-family:'Fraunces',serif;font-weight:400;font-size:13pt;color:var(--accent-dk);min-width:8mm}

/* stat tiles */
.tiles{display:grid;gap:3mm;margin:7mm 0}
.tile{background:linear-gradient(160deg,var(--deep),var(--deep2));color:#fff;border-radius:3mm;padding:4mm 4mm 3.4mm;position:relative;overflow:hidden}
.tile::after{content:'';position:absolute;right:-6mm;top:-6mm;width:16mm;height:16mm;border-radius:50%;background:radial-gradient(circle,var(--accent),transparent 70%);opacity:.5}
.tile strong{display:block;font-family:'Fraunces',serif;font-weight:300;font-size:22pt;line-height:1;color:var(--accent)}
.tile span{display:block;margin-top:1.4mm;font-size:6.4pt;font-weight:600;letter-spacing:.2em;text-transform:uppercase;opacity:.85}

/* key/value table (quote details) */
.kvt{width:100%;border-collapse:separate;border-spacing:0;border:.25mm solid var(--grey);border-radius:3mm;overflow:hidden}
.kvt td{padding:2.6mm 4mm;font-size:8.8pt;border-bottom:.25mm solid var(--grey);vertical-align:top}
.kvt tr:last-child td{border-bottom:0}
.kvt td:first-child{width:36mm;background:var(--warm);font-size:7pt;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--deep)}

/* boarding pass */
.pass{display:grid;grid-template-columns:1fr 47mm;border-radius:4mm;background:#fff;border:.3mm solid var(--grey);margin-top:7mm;break-inside:avoid;box-shadow:0 .6mm 2.4mm rgba(13,59,64,.08)}
.pass__main{padding:5.6mm 6.4mm;position:relative}
.pass__brand{display:flex;align-items:center;gap:2mm;font-size:6.6pt;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:var(--accent-dk)}
.pass__brand .ic{transform:rotate(45deg)}
.pass__dest{font-family:'Fraunces',serif;font-size:21pt;line-height:1.1;color:var(--deep);margin:2mm 0 .5mm}
.pass__sub{font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.pass__grid{display:grid;grid-template-columns:repeat(4,auto);justify-content:start;gap:2mm 7mm;margin-top:5mm;padding-top:4mm;border-top:.25mm dashed var(--silver)}
.pass__grid small,.pass__stub small{display:block;font-size:5.8pt;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}
.pass__grid b{font-size:9pt;font-weight:600;color:var(--deep)}
.pass__who{margin-top:3.6mm;font-size:8.4pt;color:var(--muted)}
.pass__who b{color:var(--deep)}
.pass__stub{position:relative;border-left:.4mm dashed var(--silver);padding:5.6mm 5mm;background:linear-gradient(180deg,var(--soft),#fff 70%);border-radius:0 4mm 4mm 0;display:grid;align-content:space-between;gap:2.4mm}
.pass__stub::before,.pass__stub::after{content:'';position:absolute;left:-3.1mm;width:6mm;height:6mm;border-radius:50%;background:var(--paper);border:.3mm solid var(--grey)}
.pass__stub::before{top:-3.4mm;clip-path:inset(50% 0 0 0)}
.pass__stub::after{bottom:-3.4mm;clip-path:inset(0 0 50% 0)}
.pass__stub b{display:block;font-size:8.6pt;font-weight:700;color:var(--deep);word-break:break-all}
.barcode{height:9mm;margin-top:1mm;background:repeating-linear-gradient(90deg,var(--deep) 0 .35mm,transparent .35mm .9mm,var(--deep) .9mm 1.6mm,transparent 1.6mm 2mm,var(--deep) 2mm 2.3mm,transparent 2.3mm 3.1mm);opacity:.85}

/* highlights */
.hl{display:grid;grid-template-columns:1fr 1fr;gap:2.6mm 8mm;margin-top:3mm}
.hl li{list-style:none;display:flex;gap:2.6mm;align-items:flex-start;font-weight:500;font-size:9pt;line-height:1.5}
.hl .tick{flex:0 0 auto;width:4.6mm;height:4.6mm;border-radius:50%;background:var(--soft);color:var(--deep);display:grid;place-items:center;margin-top:.3mm}

/* why us */
.why{break-inside:avoid;padding:7mm 8mm;border-radius:4mm;background:var(--warm);border:.25mm solid var(--grey);border-left:1.4mm solid var(--accent)}
.why p{font-size:9.6pt;line-height:1.85}

/* glance table + route */
.tbl{width:100%;border-collapse:separate;border-spacing:0;border:.25mm solid var(--grey);border-radius:3mm;overflow:hidden}
.tbl th{background:var(--deep);color:#fff;font-size:6.8pt;font-weight:600;letter-spacing:.2em;text-transform:uppercase;text-align:left;padding:2.8mm 4mm}
.tbl td{padding:2.8mm 4mm;font-size:8.6pt;border-bottom:.25mm solid var(--grey);vertical-align:top}
.tbl tr{break-inside:avoid}
.tbl tr:last-child td{border-bottom:0}
.tbl tr:nth-child(even) td{background:var(--warm)}
.tbl td.num{white-space:nowrap;font-family:'Fraunces',serif;font-size:11pt;color:var(--accent-dk);width:14mm}
.tbl td.r,.tbl th.r{text-align:right}
.tbl tr.total td{background:var(--deep);color:#fff;font-weight:700;font-size:10pt}
.route{break-inside:avoid;margin-top:7mm;padding:6mm 6mm 5mm;border-radius:3.5mm;background:var(--warm);border:.25mm solid var(--grey)}
.route__line{position:relative;display:flex;justify-content:space-between;margin-top:5mm}
.route__line::before{content:'';position:absolute;left:2mm;right:2mm;top:2.2mm;border-top:.45mm dashed var(--silver)}
.stop{position:relative;flex:1;text-align:center;min-width:0}
.stop i{display:block;width:4.4mm;height:4.4mm;margin:0 auto 2mm;border-radius:50%;background:#fff;border:.7mm solid var(--accent);position:relative;z-index:1}
.stop:first-child i,.stop:last-child i{background:var(--deep);border-color:var(--deep)}
.stop b{display:block;font-size:7.6pt;font-weight:600;color:var(--deep);line-height:1.3;padding:0 1mm}
.stop small{font-size:6.4pt;color:var(--muted);letter-spacing:.1em;text-transform:uppercase}

/* days */
.day{position:relative;padding-left:15mm;margin-bottom:5mm}
.day::before{content:'';position:absolute;left:5.4mm;top:12mm;bottom:-5mm;border-left:.5mm dashed var(--silver)}
.day:last-child::before{display:none}
.day__num{position:absolute;left:0;top:0;z-index:1;width:11mm;height:11mm;border-radius:50%;background:var(--deep);color:var(--accent);font-family:'Fraunces',serif;font-size:11pt;font-weight:500;display:grid;place-items:center;border:1mm solid var(--soft);background-clip:padding-box}
.day__card{border:.25mm solid var(--grey);border-radius:3.5mm;background:#fff;overflow:hidden;box-shadow:0 .5mm 2mm rgba(13,59,64,.06)}
.day__top{display:flex;align-items:center;justify-content:space-between;gap:3mm;padding:2.1mm 5mm;background:var(--warm);border-bottom:.25mm dashed var(--silver);break-inside:avoid;break-after:avoid}
.day__label{font-size:6.8pt;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--accent-dk)}
.day__loc{display:inline-flex;align-items:center;gap:1.4mm;font-size:7.4pt;font-weight:600;letter-spacing:.06em;color:var(--deep)}
.day__loc .ic{color:var(--accent-dk)}
.day__in{padding:3.6mm 5mm 3.2mm}
.day__in::after{content:'';display:block;clear:both}
.day__photo{float:right;width:46mm;height:33mm;object-fit:cover;margin:.6mm 0 2mm 4.5mm;border:1.1mm solid #fff;border-radius:.8mm;box-shadow:0 .4mm 2.2mm rgba(0,0,0,.28);transform:rotate(1.8deg)}
.day__title{font-family:'Fraunces',serif;font-weight:400;font-size:13pt;line-height:1.25;color:var(--deep);margin:0 0 1.8mm;break-after:avoid}
.day__desc,.part p{orphans:3;widows:3}
.day__desc{font-size:8.7pt;line-height:1.7}
.day__attr{margin-top:2mm;font-size:8.2pt}
.day__attr b{color:var(--deep);font-weight:700}
.day__note{margin-top:2.2mm;padding:2mm 3.2mm;border-radius:2mm;background:var(--soft);font-size:7.8pt;line-height:1.55;color:var(--deep);break-inside:avoid}
.part{margin-top:2.4mm;break-inside:avoid}
.part h5{font-family:'Fraunces',serif;font-weight:500;font-size:10pt;color:var(--deep);display:flex;align-items:center;gap:2mm;margin-bottom:.8mm}
.part h5::after{content:'';flex:1;border-top:.25mm solid var(--grey)}
.part p{font-size:8.6pt;line-height:1.7}
.acts{margin-top:2.4mm;display:grid;gap:1.3mm;clear:both}
.act{display:flex;gap:2.4mm;align-items:flex-start;font-size:8.2pt;font-weight:500;line-height:1.4;break-inside:avoid}
.act .b{flex:0 0 auto;width:5.2mm;height:5.2mm;border-radius:1.7mm;background:var(--aqua);color:var(--deep);display:grid;place-items:center}
.act--transfer .b{background:#E8EEF5}.act--flight .b{background:#E6F0FF}.act--stay .b{background:var(--soft)}.act--leisure .b{background:#FFF3DC}
.facts{margin-top:2.8mm;padding-top:2.4mm;border-top:.25mm dashed var(--grey);display:flex;align-items:center;flex-wrap:wrap;gap:1.6mm 2.4mm;break-inside:avoid;clear:both}
.meal{display:inline-flex;align-items:center;gap:1.2mm;padding:.9mm 2.2mm .9mm 1.9mm;border-radius:99mm;font-size:6.8pt;font-weight:600;border:.25mm dashed var(--silver);color:var(--silver);text-decoration:line-through;text-decoration-color:#0000001f}
.meal.on{background:var(--soft);border:.25mm solid var(--accent);color:var(--deep);text-decoration:none}
.overnight{display:flex;align-items:center;justify-content:center;gap:2.2mm;padding:2mm 4mm;background:var(--deep);color:#fff;font-size:7.8pt;letter-spacing:.04em;break-inside:avoid}
.overnight .ic{color:var(--accent)}
.overnight small{font-size:5.8pt;font-weight:600;letter-spacing:.22em;text-transform:uppercase;opacity:.7;margin-right:1mm}
.overnight b{font-weight:600}

/* hotels */
.hotels{display:grid;gap:6mm}
.hotel{border:.25mm solid var(--grey);border-radius:3.5mm;background:#fff;break-inside:avoid;overflow:hidden}
.mosaic{display:grid;gap:1mm;height:54mm}
.mosaic img{width:100%;height:100%;object-fit:cover;display:block;min-height:0}
.mosaic.n1{grid-template-columns:1fr}
.mosaic.n2{grid-template-columns:1fr 1fr}
.mosaic.n3{grid-template-columns:2fr 1fr;grid-template-rows:1fr 1fr}.mosaic.n3 img:first-child{grid-row:1/span 2}
.mosaic.n4{grid-template-columns:2fr 1fr 1fr;grid-template-rows:1fr 1fr}.mosaic.n4 img:first-child{grid-row:1/span 2}.mosaic.n4 img:nth-child(4){grid-column:2/span 2}
.mosaic.n5{grid-template-columns:2fr 1fr 1fr;grid-template-rows:1fr 1fr}.mosaic.n5 img:first-child{grid-row:1/span 2}
.hotel__in{padding:5mm 5.5mm}
.hotel__opt{font-size:6.6pt;font-weight:700;letter-spacing:.26em;text-transform:uppercase;color:var(--accent-dk)}
.hotel__name{font-family:'Fraunces',serif;font-size:14pt;color:var(--deep);line-height:1.25;margin:1mm 0}
.stars{color:#E8A317;letter-spacing:.5mm;font-size:9pt}
.rating{display:inline-block;margin-left:2mm;padding:.4mm 2mm;border-radius:1.4mm;background:var(--deep);color:#fff;font-size:7pt;font-weight:600;letter-spacing:.04em;vertical-align:middle}
.hotel__meta{display:flex;flex-wrap:wrap;gap:1.6mm 5mm;margin-top:2mm;font-size:8pt;color:var(--muted)}
.hotel__meta b{color:var(--ink);font-weight:600}
.hotel__desc{margin-top:2.4mm;font-size:8.4pt;line-height:1.7}
.chips{display:flex;flex-wrap:wrap;gap:1.4mm;margin-top:2.6mm}
.chips span{padding:.9mm 2.4mm;border-radius:99mm;background:var(--warm);border:.25mm solid var(--grey);font-size:7pt;font-weight:500;color:var(--deep)}
.hotel__note{margin-top:2mm;font-size:8pt;color:var(--muted);font-style:italic}
.hotel__price{text-align:right;align-self:start}
.hotel__price small{display:block;font-size:6.2pt;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
.hotel__price strong{font-family:'Fraunces',serif;font-weight:500;font-size:16pt;color:var(--deep)}

/* flights / vehicle */
.vehicle{margin-top:6mm;display:grid;grid-template-columns:auto 1fr 1fr;gap:5mm;align-items:center;padding:5mm 6mm;border-radius:3.5mm;background:var(--warm);border:.25mm solid var(--grey)}
.vehicle .b{width:11mm;height:11mm;border-radius:3mm;background:var(--deep);color:var(--accent);display:grid;place-items:center}
.kv small{display:block;font-size:6.2pt;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--muted)}
.kv b{font-size:9.2pt;font-weight:600;color:var(--deep)}

/* pricing */
.price{display:grid;grid-template-columns:1.25fr 1fr;margin:6mm 0 6mm;break-inside:avoid;border-radius:4mm;overflow:hidden;background:linear-gradient(150deg,var(--deep) 0%,var(--deep2) 100%);color:#fff;box-shadow:0 .8mm 3mm rgba(13,59,64,.18)}
.price__main{padding:7mm 7.5mm;position:relative}
.price__main::after{content:'';position:absolute;left:-10mm;bottom:-12mm;width:40mm;height:40mm;border-radius:50%;background:radial-gradient(circle,var(--accent),transparent 70%);opacity:.3}
.price__main small{display:block;font-size:6.8pt;font-weight:600;letter-spacing:.28em;text-transform:uppercase;opacity:.8}
.price__main strong{display:block;font-family:'Fraunces',serif;font-weight:300;font-size:30pt;line-height:1.1;color:var(--accent);margin:2mm 0 1mm}
.price__main em{font-style:normal;font-size:8pt;opacity:.82}
.price__side{position:relative;border-left:.4mm dashed rgba(255,255,255,.4);padding:6mm 6.5mm;display:grid;align-content:center;gap:3mm;background:rgba(255,255,255,.06)}
.price__side::before,.price__side::after{content:'';position:absolute;left:-3.2mm;width:6mm;height:6mm;border-radius:50%;background:var(--paper)}
.price__side::before{top:-3mm}.price__side::after{bottom:-3mm}
.price__side .kv small{color:#fff;opacity:.65}.price__side .kv b{color:#fff}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:6mm;margin-bottom:5mm}
.cols li{break-inside:avoid;list-style:none;display:flex;gap:2.2mm;font-size:8.4pt;line-height:1.5;margin-bottom:1.6mm;align-items:flex-start}
.cols li .ic{margin-top:.4mm}
.in li .ic{color:var(--accent-dk)}.ex li{color:var(--muted)}.ex li .ic{color:#C0584E}

/* dates / reviews / policies / booking / carry */
.dates{display:flex;flex-wrap:wrap;gap:3mm}
.date{padding:3mm 5mm;border-radius:3mm;background:var(--warm);border:.25mm solid var(--grey);min-width:34mm}
.date b{display:block;font-family:'Fraunces',serif;font-size:12pt;font-weight:500;color:var(--deep)}
.date span{font-size:7.6pt;color:var(--muted)}
.reviews{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.review{padding:5mm 5.5mm;border-radius:3.5mm;border:.25mm solid var(--grey);background:#fff;break-inside:avoid}
.review .stars{display:block;margin-bottom:1.6mm}
.review p{font-size:8.4pt;line-height:1.7;font-style:italic}
.review b{display:block;margin-top:2.4mm;font-size:7.6pt;letter-spacing:.14em;text-transform:uppercase;color:var(--deep)}
.box{padding:4.6mm 5.6mm;border-radius:3mm;background:var(--warm);border:.25mm solid var(--grey);break-inside:avoid;margin-bottom:5mm}
.box p,.box li{font-size:8.5pt;line-height:1.75}
.box ul{padding-left:4mm}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin-bottom:6mm}
.step{padding:5mm;border-radius:3.5mm;background:#fff;border:.25mm solid var(--grey);break-inside:avoid}
.step i{display:grid;place-items:center;width:8mm;height:8mm;border-radius:50%;background:var(--deep);color:var(--accent);font-family:'Fraunces',serif;font-style:normal;font-size:10pt;margin-bottom:2.4mm}
.step b{display:block;font-size:9pt;color:var(--deep);margin-bottom:1mm}
.step span{font-size:8pt;color:var(--muted);line-height:1.6}
.pay{display:grid;grid-template-columns:1fr auto;gap:8mm;align-items:center;padding:6mm 7mm;border-radius:4mm;background:linear-gradient(150deg,var(--deep),var(--deep2));color:#fff;break-inside:avoid}
.pay .kv small{color:#fff;opacity:.65}.pay .kv b{color:#fff;font-weight:500;font-size:9pt}
.pay .rows{display:grid;gap:2.6mm}
.pay img{width:32mm;height:32mm;border-radius:2.4mm;background:#fff;padding:2mm;display:block}
.pay .qrcap{font-size:6.4pt;letter-spacing:.2em;text-transform:uppercase;text-align:center;margin-top:1.6mm;opacity:.85}
.carry{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.carry .box{margin:0}
.carry h4{margin-bottom:2mm}
.carry li{list-style:none;display:flex;gap:2mm;align-items:flex-start}
.carry li::before{content:'';width:1.6mm;height:1.6mm;border-radius:50%;background:var(--accent);margin-top:2.2mm;flex:0 0 auto}
.valid{margin-top:6mm;font-size:8pt;color:var(--muted);text-align:center}
.signoff{margin-top:9mm;text-align:right;font-family:'Fraunces',serif;font-style:italic;font-size:11pt;color:var(--deep)}
.signoff small{display:block;font-family:'Montserrat',sans-serif;font-style:normal;font-size:7pt;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin-top:1mm}
`

const BACK_CSS = `
@page{size:210mm 297mm;margin:0}
.back{position:relative;width:210mm;height:297mm;overflow:hidden;color:#fff;background:radial-gradient(110% 80% at 50% 30%,var(--bg-from) 0%,var(--deep) 55%,var(--bg-to) 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24mm}
.back::before{content:'';position:absolute;width:190mm;height:190mm;border-radius:50%;left:50%;top:50%;margin:-105mm 0 0 -95mm;background:radial-gradient(circle,var(--accent),transparent 62%);opacity:.18}
.back > *{position:relative}
.back__logo{width:70mm;height:auto}
.back__thanks{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:30pt;line-height:1.1;margin:14mm 0 3mm}
.back__sub{font-size:9.5pt;opacity:.8;max-width:118mm;line-height:1.75}
.back__book{margin-top:8mm;display:inline-block;padding:2.6mm 7mm;border-radius:99mm;background:var(--accent);color:var(--deep);font-weight:700;font-size:9pt;letter-spacing:.06em}
.back__card{margin-top:13mm;display:grid;grid-template-columns:1fr auto;gap:10mm;align-items:center;text-align:left;padding:9mm 10mm;border-radius:5mm;background:rgba(255,255,255,.07);border:.3mm solid rgba(255,255,255,.18)}
.back__row{display:flex;gap:3.2mm;align-items:flex-start;font-size:9pt;line-height:1.55;margin-bottom:3.4mm}
.back__row:last-child{margin-bottom:0}
.back__row .ic{color:var(--accent);margin-top:.5mm}
.back__qr{text-align:center;font-size:6.6pt;letter-spacing:.2em;text-transform:uppercase;opacity:.9}
.back__qr img{display:block;width:34mm;height:34mm;border-radius:2.4mm;background:#fff;padding:2mm;margin-bottom:2.4mm}
.back__founder{margin-top:10mm;font-family:'Fraunces',serif;font-style:italic;font-size:11pt;opacity:.9}
.back__founder small{display:block;font-family:'Montserrat',sans-serif;font-style:normal;font-size:6.6pt;letter-spacing:.24em;text-transform:uppercase;opacity:.65}
.back__fine{position:absolute;bottom:14mm;left:0;right:0;font-size:7pt;opacity:.55;letter-spacing:.08em}
`

/* ------------------------------------------------------------------ */
/* resolve: itinerary + settings + defaults -> one data object         */
/* ------------------------------------------------------------------ */
function resolveData(raw, settings) {
  const S = settings || DEFAULT_SETTINGS
  const it = raw
  const sections = { ...DEFAULT_SECTIONS, ...(it.sections || {}) }
  const slabs = clean(it.cancellationSlabs).filter((s) => s.window || s.charge)
  return {
    it,
    S,
    sections,
    theme: THEMES[it.theme] || THEMES.teal,
    cur: it.currency || 'INR',
    paymentTerms: it.paymentTerms || S.paymentTerms,
    slabs: slabs.length ? slabs : it.cancellationPolicy ? [] : S.cancellationSlabs || [],
    cancellationText: it.cancellationPolicy || '',
    terms: it.terms || S.terms,
    reviews: clean(it.reviews).length ? it.reviews : S.reviews || [],
    carry: clean(it.thingsToCarry).length ? it.thingsToCarry : S.thingsToCarry || [],
    keepInMind: clean(it.keepInMind).length ? it.keepInMind : S.keepInMind || [],
    hotels: (it.hotelOptions || []).filter((h) => h.name),
    flights: (it.flights || []).filter((f) => f.sector || f.airline),
  }
}

/* ------------------------------------------------------------------ */
/* section builders: each returns an HTML string, or '' to skip         */
/* ------------------------------------------------------------------ */
const HEAD_ICONS = {
  'Your trip': 'compass', 'About us': 'star', Overview: 'pin', 'Day by day': 'sightseeing', Accommodation: 'stay',
  'Getting there': 'flight', 'On the ground': 'transfer', Investment: 'ticket', 'Make it yours': 'star',
  'The fine print, made clear': 'check', Departures: 'compass', 'Kind words': 'star', 'Good to know': 'ticket',
  'Ready when you are': 'ticket', 'Be prepared': 'sightseeing',
}
const head = (eyebrow, title) =>
  `<div class="sec-head"><div class="divider">${icon('flight', 14)}</div><div class="eyebrow">${esc(eyebrow)}</div><h2 class="sec">${esc(title)}</h2>${
    HEAD_ICONS[eyebrow] ? `<span class="sec-ic">${icon(HEAD_ICONS[eyebrow], 64)}</span>` : ''
  }</div>`

const SECTION_BUILDERS = {
  welcome(D) {
    const { it } = D
    const w = it.welcome || {}
    if (!has(w.body)) return ''
    const photo = resolveImage(it.consultant?.photo)
    const sign = w.signoff || it.consultant?.name
    return `<section class="section">
      <div class="welcome ${photo ? '' : 'welcome--nophoto'}">
        ${photo ? `<img class="welcome__photo" src="${photo}">` : ''}
        <div>
          <div class="eyebrow">A note for you</div>
          <h2>${esc(w.heading || `Welcome${it.customer?.name ? ', ' + it.customer.name.split(' ')[0] : ''}`)}</h2>
          ${esc(w.body).split(/\n{2,}/).map((p) => `<p>${nl2br(p)}</p>`).join('')}
          ${sign ? `<div class="sign">${esc(sign)}</div>` : ''}
        </div>
      </div>
    </section>`
  },

  snapshot(D) {
    const { it, cur } = D
    const s = summarize(it)
    const tiles = [
      [s.days, s.days === 1 ? 'Day' : 'Days'],
      [s.nights, s.nights === 1 ? 'Night' : 'Nights'],
      [s.stays, s.stays === 1 ? 'Stay' : 'Stays'],
      [s.meals, 'Meals'],
      [s.acts, 'Experiences'],
    ].filter(([n]) => n > 0)
    const gridItems = [
      ['Travel dates', it.travelDate],
      ['Travellers', travellersText(it)],
      ['Rooms', it.rooms],
      ['Duration', s.days ? `${s.nights}N / ${s.days}D` : ''],
    ].filter(([, v]) => has(v))
    const pass = `<div class="pass">
      <div class="pass__main">
        <div class="pass__brand">${icon('flight', 11)} Boarding pass · ${esc(D.S.company?.name || '')}</div>
        <div class="pass__dest">${esc(it.destination || it.title)}</div>
        <div class="pass__sub">${esc([it.country, s.days ? `${s.nights} Nights / ${s.days} Days` : ''].filter(Boolean).join(' · '))}</div>
        ${gridItems.length ? `<div class="pass__grid">${gridItems.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>` : ''}
        ${it.customer?.name || it.consultant?.name ? `<div class="pass__who">${it.customer?.name ? `Passenger <b>${esc(it.customer.name)}</b>` : ''}${it.customer?.name && it.consultant?.name ? ' &nbsp;·&nbsp; ' : ''}${it.consultant?.name ? `Your consultant <b>${esc(it.consultant.name)}</b>${it.consultant.phone ? ' · ' + esc(it.consultant.phone) : ''}` : ''}</div>` : ''}
      </div>
      <div class="pass__stub">
        <div><small>Reference</small><b>${esc(it.ref || '')}</b></div>
        ${it.validUntil ? `<div><small>Valid until</small><b>${esc(it.validUntil)}</b></div>` : ''}
        ${it.bookBy ? `<div><small>Book by</small><b>${esc(it.bookBy)}</b></div>` : ''}
        <div class="barcode"></div>
      </div>
    </div>`
    return `<section class="section">
      ${head('Your trip', it.title)}
      ${it.overview ? `<p class="lead">${nl2br(it.overview)}</p>` : ''}
      ${tiles.length ? `<div class="tiles" style="grid-template-columns:repeat(${tiles.length},1fr)">${tiles
        .map(([n, l]) => `<div class="tile"><strong>${pad2(n)}</strong><span>${l}</span></div>`).join('')}</div>` : ''}
      ${clean(it.highlights).length ? `<div class="eyebrow" style="margin-top:7mm">Highlights</div>
        <ul class="hl">${clean(it.highlights).map((h) => `<li><span class="tick">${icon('check', 9, 'stroke-width="2.6"')}</span><span>${esc(h)}</span></li>`).join('')}</ul>` : ''}
      ${pass}
    </section>`
  },

  whyUs(D) {
    const text = D.S.whyUs
    if (!has(text)) return ''
    return `<section class="section">
      ${head('About us', `Why travel with ${D.S.company?.name || 'us'}`)}
      <div class="why"><p>${nl2br(text)}</p></div>
    </section>`
  },

  glance(D) {
    const { it } = D
    const days = it.itinerary || []
    if (!days.length) return ''
    const stops = []
    days.forEach((d) => {
      String(d.location || '').split(/→|->|–|—| to /i).map((x) => x.trim()).filter(Boolean).forEach((x) => {
        const prev = stops[stops.length - 1]
        if (prev && prev.toLowerCase().includes(x.toLowerCase())) return
        if (prev && x.toLowerCase().includes(prev.toLowerCase())) { stops[stops.length - 1] = x; return }
        stops.push(x)
      })
    })
    const shown = stops.length > 7 ? [...stops.slice(0, 3), '…', ...stops.slice(-3)] : stops
    return `<section class="section">
      ${head('Overview', 'Itinerary at a glance')}
      <table class="tbl">
        <tr><th>Day</th><th>Stay</th><th>Plan</th></tr>
        ${days.map((d, i) => `<tr><td class="num">${pad2(d.day ?? i + 1)}</td><td>${esc(d.stay || d.location || '—')}</td><td>${esc(d.title)}</td></tr>`).join('')}
      </table>
      ${shown.length >= 2 ? `<div class="route"><div class="eyebrow">Your route</div><div class="route__line">${shown
        .map((s, i) => `<div class="stop"><i></i><b>${esc(s)}</b>${i === 0 ? '<small>Start</small>' : i === shown.length - 1 ? '<small>End</small>' : ''}</div>`).join('')}</div></div>` : ''}
    </section>`
  },

  days(D) {
    const days = D.it.itinerary || []
    if (!days.length) return ''
    const dayHtml = (d, i) => {
      const n = d.day ?? i + 1
      const photo = resolveImage(d.image)
      const meals = (d.meals || []).filter((m) => MEALS.includes(m))
      const hasMealData = Array.isArray(d.meals)
      const acts = clean(d.activities)
      const parts = [['Morning', d.morning], ['Afternoon', d.afternoon], ['Evening', d.evening]].filter(([, t]) => has(t))
      return `<div class="day">
        <div class="day__num">${pad2(n)}</div>
        <div class="day__card">
          <div class="day__top"><span class="day__label">Day ${pad2(n)}</span>${d.location ? `<span class="day__loc">${icon('pin', 10)} ${esc(d.location)}</span>` : ''}</div>
          <div class="day__in">
            ${photo ? `<img class="day__photo" src="${photo}">` : ''}
            <div class="day__title">${esc(d.title)}</div>
            ${parts.length
              ? (d.description ? `<p class="day__desc">${nl2br(d.description)}</p>` : '') +
                parts.map(([l, t]) => `<div class="part"><h5>${l}</h5><p>${nl2br(t)}</p></div>`).join('')
              : d.description ? `<p class="day__desc">${nl2br(d.description)}</p>` : ''}
            ${has(d.attractions) ? `<p class="day__attr"><b>Major attractions:</b> ${esc(d.attractions)}</p>` : ''}
            ${acts.length ? `<div class="acts">${acts.map((a) => `<div class="act act--${activityKind(a)}"><span class="b">${icon(activityKind(a), 10)}</span><span>${esc(a)}</span></div>`).join('')}</div>` : ''}
            ${has(d.note) ? `<div class="day__note"><b>Note:</b> ${esc(d.note)}</div>` : ''}
            ${hasMealData ? `<div class="facts">${MEALS.map((m) => `<span class="meal ${meals.includes(m) ? 'on' : ''}">${icon(m, 9)}${MEAL_LABEL[m]}</span>`).join('')}</div>` : ''}
          </div>
          ${d.stay ? `<div class="overnight">${icon('stay', 12)}<small>Overnight in</small><b>${esc(d.stay)}</b></div>` : ''}
        </div>
      </div>`
    }
    return `<section class="section">
      <div class="keep">${head('Day by day', 'Your journey, unfolded')}${dayHtml(days[0], 0)}</div>
      ${days.slice(1).map((d, i) => dayHtml(d, i + 1)).join('')}
    </section>`
  },

  hotels(D) {
    if (!D.hotels.length) return ''
    const { cur } = D
    return `<section class="section">
      <div class="keep sec-head"><div class="divider">${icon('flight', 14)}</div><div class="eyebrow">Accommodation</div><h2 class="sec">Where you’ll stay</h2><span class="sec-ic">${icon('stay', 64)}</span></div>
      <div class="hotels">${D.hotels.map((h, i) => {
        const imgs = clean(h.images).map(resolveImage).filter(Boolean).slice(0, 5)
        return `<div class="hotel">
          ${imgs.length ? `<div class="mosaic n${imgs.length}">${imgs.map((s) => `<img src="${s}">`).join('')}</div>` : ''}
          <div class="hotel__in">
            <div>
              ${D.hotels.length > 1 ? `<div class="hotel__opt">Option ${i + 1}</div>` : ''}
              <div class="hotel__name">${esc(h.name)}</div>
              ${h.stars ? `<span class="stars">${'★'.repeat(Math.min(5, h.stars))}${'☆'.repeat(Math.max(0, 5 - h.stars))}</span>` : ''}${h.rating ? `<span class="rating">${esc(h.rating)}</span>` : ''}
              <div class="hotel__meta">
                ${h.location ? `<span>${icon('pin', 10)} <b>${esc(h.location)}</b></span>` : ''}
                ${h.roomType ? `<span>Room · <b>${esc(h.roomType)}</b></span>` : ''}
                ${h.mealPlan ? `<span>Meals · <b>${esc(h.mealPlan)}</b></span>` : ''}
                ${h.nights ? `<span>Stay · <b>${h.nights} night${h.nights > 1 ? 's' : ''}</b></span>` : ''}
              </div>
              ${h.description ? `<p class="hotel__desc">${nl2br(h.description)}</p>` : ''}
              ${clean(h.facilities).length ? `<div class="chips">${clean(h.facilities).map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
              ${h.notes ? `<div class="hotel__note">${esc(h.notes)}</div>` : ''}
            </div>
          </div>
        </div>`
      }).join('')}</div>
    </section>`
  },

  flights(D) {
    if (!D.flights.length) return ''
    return `<section class="section">
      ${head('Getting there', 'Flights')}
      <table class="tbl">
        <tr><th>Sector</th><th>Airline</th><th>Departs</th><th>Arrives</th><th>Baggage</th></tr>
        ${D.flights.map((f) => `<tr><td><b>${esc(f.sector)}</b></td><td>${esc(f.airline)}${f.flightNo ? `<br><span class="sub">${esc(f.flightNo)}</span>` : ''}</td><td>${esc(f.depart)}</td><td>${esc(f.arrive)}</td><td>${esc(f.baggage)}${f.note ? `<br><span class="sub">${esc(f.note)}</span>` : ''}</td></tr>`).join('')}
      </table>
    </section>`
  },

  vehicle(D) {
    const v = D.it.vehicle || {}
    if (!has(v.kind) && !has(v.pickup) && !has(v.drop)) return ''
    return `<section class="section">
      ${head('On the ground', 'Transport')}
      <div class="vehicle" style="margin-top:0">
        <div class="b">${icon('transfer', 18)}</div>
        <div class="kv"><small>Vehicle</small><b>${esc(v.kind || 'Private vehicle')}</b></div>
        <div class="kv"><small>Pick-up → Drop</small><b>${esc([v.pickup, v.drop].filter(Boolean).join(' → ') || '—')}</b></div>
      </div>
      ${has(v.notes) ? `<p class="sub" style="margin-top:3mm">${esc(v.notes)}</p>` : ''}
    </section>`
  },

  pricing(D) {
    const { it, cur } = D
    const lines = clean(it.priceLines).filter((l) => l.label)
    const total = it.totalPrice || it.perPerson
    if (!lines.length && !total) return ''
    return `<section class="section">
      ${head('Investment', 'Pricing')}
      ${lines.length ? `<table class="tbl keep">
        <tr><th>Item</th><th class="r">Amount</th></tr>
        ${lines.map((l) => `<tr><td>${esc(l.label)}</td><td class="r">${money(l.amount, cur)}</td></tr>`).join('')}
        ${it.totalPrice ? `<tr class="total"><td>Total</td><td class="r">${money(it.totalPrice, cur)}</td></tr>` : ''}
      </table>` : ''}
      ${total ? `<div class="price">
        <div class="price__main">
          <small>${it.totalPrice ? 'Total package price' : 'Price per person'}</small>
          <strong>${money(total, cur)}</strong>
          <em>${esc(it.priceNote || `for ${travellersText(it)}`)}</em>
        </div>
        <div class="price__side">
          ${it.totalPrice && it.perPerson ? `<div class="kv"><small>Per person</small><b>${money(it.perPerson, cur)}</b></div>` : ''}
          <div class="kv"><small>Travellers</small><b>${esc(travellersText(it))}</b></div>
          ${it.travelDate ? `<div class="kv"><small>Travel date</small><b>${esc(it.travelDate)}</b></div>` : ''}
        </div>
      </div>` : ''}
      ${it.validUntil ? `<p class="valid">This quotation is valid until <b>${esc(it.validUntil)}</b>. Rates and availability are subject to change until booking is confirmed.</p>` : ''}
    </section>`
  },

  addons(D) {
    const list = clean(D.it.addons).filter((a) => a.name)
    if (!list.length) return ''
    return `<section class="section">
      ${head('Make it yours', 'Optional add-ons')}
      <table class="tbl">
        <tr><th>Add-on</th><th>Details</th><th class="r">Price</th></tr>
        ${list.map((a) => `<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.description)}</td><td class="r">${a.price ? money(a.price, D.cur) : '—'}</td></tr>`).join('')}
      </table>
    </section>`
  },

  inclusions(D) {
    const inc = clean(D.it.inclusions)
    const exc = clean(D.it.exclusions)
    if (!inc.length && !exc.length) return ''
    return `<section class="section">
      ${head('The fine print, made clear', 'What’s included')}
      <div class="cols">
        ${inc.length ? `<div class="in"><h4 class="mini">Included</h4><ul>${inc.map((x) => `<li>${icon('check', 11, 'stroke-width="2.4"')}<span>${esc(x)}</span></li>`).join('')}</ul></div>` : '<div></div>'}
        ${exc.length ? `<div class="ex"><h4 class="mini">Not included</h4><ul>${exc.map((x) => `<li>${icon('cross', 11, 'stroke-width="2.2"')}<span>${esc(x)}</span></li>`).join('')}</ul></div>` : '<div></div>'}
      </div>
    </section>`
  },

  dates(D) {
    const list = clean(D.it.batches).filter((b) => b.label)
    if (!list.length) return ''
    return `<section class="section">
      ${head('Departures', 'Travel dates')}
      <div class="dates">${list.map((b) => `<div class="date"><b>${esc(b.label)}</b><span>${esc(b.note)}</span></div>`).join('')}</div>
    </section>`
  },

  reviews(D) {
    const list = clean(D.reviews).filter((r) => r.text)
    if (!list.length) return ''
    return `<section class="section">
      ${head('Kind words', 'What travellers say')}
      <div class="reviews">${list.map((r) => `<div class="review"><span class="stars">${'★'.repeat(Math.min(5, r.rating || 5))}</span><p>“${esc(r.text)}”</p><b>${esc(r.name)}</b></div>`).join('')}</div>
    </section>`
  },

  policies(D) {
    const hasAny = D.paymentTerms || D.slabs.length || D.cancellationText || D.terms
    if (!hasAny) return ''
    return `<section class="section">
      ${head('Good to know', 'Payment & cancellation')}
      ${D.paymentTerms ? `<div class="box"><h4 class="mini">Payment policy</h4><p>${nl2br(D.paymentTerms)}</p></div>` : ''}
      ${D.slabs.length ? `<div class="keep" style="margin-bottom:5mm"><h4 class="mini">Cancellation &amp; refund</h4><table class="tbl"><tr><th>When you cancel</th><th>What you get back</th></tr>
        ${D.slabs.map((s) => `<tr><td>${esc(s.window)}</td><td><b>${esc(s.charge)}</b></td></tr>`).join('')}</table></div>` : ''}
      ${D.cancellationText ? `<div class="box"><h4 class="mini">Cancellation policy</h4><p>${nl2br(D.cancellationText)}</p></div>` : ''}
      ${D.terms ? `<div class="box"><h4 class="mini">Terms &amp; conditions</h4><ul>${String(D.terms).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>` : ''}
      ${has(D.it.notes) ? `<div class="box"><h4 class="mini">Notes</h4><p>${nl2br(D.it.notes)}</p></div>` : ''}
    </section>`
  },

  booking: null, // async, see buildBooking()

  carry(D) {
    const groups = clean(D.carry).filter((g) => g.group || clean(g.items).length)
    const kim = clean(D.keepInMind)
    if (!groups.length && !kim.length) return ''
    return `<section class="section">
      ${head('Be prepared', 'Things to carry')}
      ${groups.length ? `<div class="carry">${groups.map((g) => `<div class="box"><h4 class="mini">${esc(g.group)}</h4><ul>${clean(g.items).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
      ${kim.length ? `<div class="box" style="margin-top:5mm"><h4 class="mini">Please keep in mind</h4><ul>${kim.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    </section>`
  },
}

async function buildBooking(D) {
  const { it, S } = D
  const bank = S.bank || {}
  const rows = [
    ['Account name', bank.accountName],
    ['Account number', bank.accountNumber],
    ['IFSC', bank.ifsc],
    ['Bank', bank.bankName],
    ['Account type', bank.accountType],
    ['UPI', bank.upiId],
  ].filter(([, v]) => has(v))
  const hasBank = rows.length > 1 || has(bank.upiId) || has(bank.accountNumber)
  let qr = ''
  if (has(bank.upiId)) {
    const link = `upi://pay?pa=${encodeURIComponent(bank.upiId)}&pn=${encodeURIComponent(bank.accountName || S.company?.name || '')}&cu=INR`
    qr = await QRCode.toDataURL(link, { margin: 0, width: 360, color: { dark: '#0D3B40', light: '#FFFFFF' } })
  }
  const contact = it.consultant?.phone || S.company?.phone
  return `<section class="section">
    ${head('Ready when you are', 'How to book')}
    <div class="steps">
      <div class="step"><i>1</i><b>Confirm</b><span>Tell us you’d like to go ahead${D.it.bookBy ? ` by <b>${esc(D.it.bookBy)}</b>` : ''}.</span></div>
      <div class="step"><i>2</i><b>Pay the advance</b><span>${esc(D.paymentTerms ? D.paymentTerms.split(/(?<=\.)\s/)[0] : 'Pay the booking amount to lock your dates.')}</span></div>
      <div class="step"><i>3</i><b>Get your vouchers</b><span>We share tickets, vouchers and trip-captain details before you travel.</span></div>
    </div>
    ${hasBank ? `<div class="pay">
      <div class="rows">${rows.map(([k, v]) => `<div class="kv"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
      ${qr ? `<div><img src="${qr}"><div class="qrcap">Scan to pay</div></div>` : ''}
    </div>` : `<div class="box"><p>For payment details, please contact ${esc(it.consultant?.name || 'your consultant')}${contact ? ` on <b>${esc(contact)}</b>` : ''}.</p></div>`}
  </section>`
}

/* ------------------------------------------------------------------ */
/* document builders                                                   */
/* ------------------------------------------------------------------ */
const docShell = (D, css, body) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaces()}${themeCss(D.theme)}${BASE_CSS}${css}${process.env.PDF_EXTRA_CSS || ''}</style></head><body>${body}</body></html>`

function coverHtml(D) {
  const { it, S } = D
  const s = summarize(it)
  const img = resolveImage(it.coverImage)
  const logo = dataUri(path.join(ASSETS, 'logo-white.png'), 'image/png')
  const meta = [s.nights || s.days ? `${s.nights}N / ${s.days}D` : '', it.country || ''].filter(Boolean).join(' · ')
  return docShell(D, COVER_CSS, `<section class="cover">
      ${img ? `<img class="cover__img" src="${img}">` : ''}
      <div class="cover__shade"></div><div class="cover__tint"></div><div class="cover__frame"></div>
      <svg class="cover__stamp" viewBox="0 0 120 120" fill="none">
        <defs><path id="pm" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs>
        <circle cx="60" cy="60" r="57" stroke="#fff" stroke-width="1.6"/><circle cx="60" cy="60" r="32" stroke="#fff" stroke-width="1"/>
        <text font-size="8.6" letter-spacing="2.6" fill="#fff" font-family="Montserrat" font-weight="600"><textPath href="#pm">CARVAAN HOLIDAYS · BON VOYAGE · TRAVEL ITINERARY ·</textPath></text>
        <text x="60" y="61" text-anchor="middle" font-size="16" fill="#fff" font-family="Fraunces" font-style="italic">${s.nights}N/${s.days}D</text>
        <text x="60" y="74" text-anchor="middle" font-size="6" letter-spacing="2" fill="#fff" font-family="Montserrat" font-weight="600">DEPARTURE</text>
      </svg>
      <div class="cover__top">
        <img class="cover__logo" src="${logo}">
        <div class="cover__ref">Travel Itinerary<b>${esc(it.ref || '')}</b></div>
      </div>
      <div class="cover__body">
        <div class="cover__eyebrow">${esc(meta || 'Your journey')}</div>
        <h1 class="cover__title">${esc(it.title)}</h1>
        ${it.tagline ? `<div class="cover__tag">${esc(it.tagline)}</div>` : ''}
        ${it.destination ? `<div class="cover__dest">${esc(it.destination)}</div>` : ''}
        ${it.customer?.name ? `<div class="cover__for">Prepared exclusively for <b>${esc(it.customer.name)}</b></div>` : ''}
        <div class="cover__stats">
          <div class="cover__stat"><small>Travel date</small><strong>${esc(it.travelDate || 'To be confirmed')}</strong></div>
          <div class="cover__stat"><small>Duration</small><strong>${s.nights} Nights / ${s.days} Days</strong></div>
          <div class="cover__stat"><small>Travellers</small><strong>${esc(travellersText(it))}</strong></div>
          <div class="cover__stat"><small>Rooms</small><strong>${esc(it.rooms || 1)}</strong></div>
        </div>
      </div>
    </section>`)
}

const DECO = `
  <div class="paper"></div>
  <svg class="deco deco--tr" viewBox="0 0 200 160" fill="none" stroke="var(--accent)" stroke-width="0.9">
    <path d="M200 -8 C 140 -12,92 20,88 62 S 120 140,200 148"/><path d="M200 10 C 160 5,120 30,118 62 S 140 120,200 128"/>
    <path d="M200 26 C 170 24,140 42,138 64 S 156 108,200 112"/><path d="M200 42 C 182 41,160 52,158 66 S 172 94,200 96"/>
  </svg>
  <svg class="deco deco--bl" viewBox="0 0 240 60" fill="none">
    <path d="M0 54 C 60 -4,150 -4,228 38" stroke="var(--deep)" stroke-width="1" stroke-dasharray="1.5 4" stroke-linecap="round"/>
    <g transform="translate(232 40) rotate(38) scale(.75) translate(-12 -12)" fill="var(--accent-dk)"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z"/></g>
  </svg>`

async function bodyHtml(D) {
  const order = ['welcome', 'contents', 'whyUs', 'snapshot', 'glance', 'days', 'hotels', 'flights', 'vehicle',
    'pricing', 'addons', 'inclusions', 'dates', 'reviews', 'policies', 'booking', 'carry']
  const built = []
  for (const key of order) {
    if (key === 'contents') { built.push({ key, html: '__TOC__' }); continue }
    if (!D.sections[key]) continue
    const html = key === 'booking' ? await buildBooking(D) : SECTION_BUILDERS[key](D)
    if (html) built.push({ key, html })
  }
  const toc = built
    .filter((b) => b.key !== 'contents' && b.key !== 'welcome')
    .map((b) => ({ key: b.key, label: SECTION_LABELS[b.key] }))
  const tocHtml = D.sections.contents && toc.length
    ? `<section class="section">${head('Inside this itinerary', 'Contents')}<ul class="toc">${toc
        .map((t, i) => `<li><b>${pad2(i + 1)}</b>${esc(t.label)}</li>`).join('')}</ul></section>`
    : ''
  let body = ''
  built.forEach((b, i) => {
    const html = b.key === 'contents' ? tocHtml : b.html
    if (!html) return
    const flagged = body && built[i - 1]?.key !== 'welcome'
      ? html.replace('<section class="section"', '<section class="section has-div"')
      : html
    body += flagged
  })
  return docShell(D, BODY_CSS, DECO + body)
}

async function backHtml(D) {
  const { it, S } = D
  const c = S.company || {}
  const logo = dataUri(path.join(ASSETS, 'logo-white.png'), 'image/png')
  const qrTarget = c.website ? (/^https?:/.test(c.website) ? c.website : `https://${c.website}`) : 'https://www.carvaanholidays.com'
  const qr = await QRCode.toDataURL(qrTarget, { margin: 0, width: 360, color: { dark: '#0D3B40', light: '#FFFFFF' } })
  const rows = [
    [it.consultant?.phone || c.phone, 'phone'],
    [c.email, 'mail'],
    [c.website, 'web'],
    [c.instagram, 'insta'],
    [c.address, 'pin'],
  ].filter(([v]) => has(v))
  return docShell(D, BACK_CSS, `<section class="back">
      <img class="back__logo" src="${logo}">
      <div class="back__thanks">${esc(S.closingTitle || 'Your story starts here.')}</div>
      <p class="back__sub">${esc(S.closingMessage || '')}</p>
      ${it.bookBy ? `<div class="back__book">Book by ${esc(it.bookBy)}</div>` : ''}
      <div class="back__card">
        <div>${rows.map(([v, ic]) => `<div class="back__row">${icon(ic, 15)}<span>${esc(v)}</span></div>`).join('')}</div>
        <div class="back__qr"><img src="${qr}"><div>Scan to explore more</div></div>
      </div>
      ${c.founderName ? `<div class="back__founder">${esc(c.founderName)}<small>${esc(c.founderTitle || '')}</small></div>` : ''}
      <div class="back__fine">${esc(it.ref || '')} &nbsp;·&nbsp; ${esc(c.name || '')} &nbsp;·&nbsp; ${esc(c.tagline || '')}</div>
    </section>`)
}

/* ------------------------------------------------------------------ */
/* render                                                              */
/* ------------------------------------------------------------------ */
const footerTemplate = (ref, name) => `
  <div style="width:100%;padding:0 17mm;font-family:Helvetica,Arial,sans-serif;font-size:7px;color:#6B7D83;display:flex;justify-content:space-between;align-items:center;letter-spacing:.12em;text-transform:uppercase;">
    <span><b style="color:#0D3B40">${esc(name || 'Carvaan Holidays')}</b> &nbsp;·&nbsp; ${esc(ref || '')}</span>
    <span>Page <span class="pageNumber"></span></span>
  </div>`

async function pdfFrom(browser, html, opts = {}) {
  const page = await browser.newPage()
  try {
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 45000 })
    await page.evaluate(() => document.fonts.ready)
    return await page.pdf({ printBackground: true, preferCSSPageSize: true, ...opts })
  } finally {
    await page.close()
  }
}

export async function renderItineraryPdf(it, settings = DEFAULT_SETTINGS) {
  const raw = typeof it.toObject === 'function' ? it.toObject() : it
  const D = resolveData(raw, settings)
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })
  try {
    const [coverDoc, bodyDoc, backDoc] = await Promise.all([coverHtml(D), bodyHtml(D), backHtml(D)])
    const [cover, body, back] = await Promise.all([
      pdfFrom(browser, coverDoc),
      pdfFrom(browser, bodyDoc, {
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: footerTemplate(raw.ref, D.S.company?.name),
      }),
      pdfFrom(browser, backDoc),
    ])
    const out = await PDFDocument.create()
    for (const buf of [cover, body, back]) {
      const src = await PDFDocument.load(buf)
      const pages = await out.copyPages(src, src.getPageIndices())
      pages.forEach((p) => out.addPage(p))
    }
    out.setTitle(`${raw.title} — Itinerary`)
    out.setAuthor(D.S.company?.name || 'Carvaan Holidays')
    out.setSubject(raw.ref || 'Itinerary')
    return Buffer.from(await out.save())
  } finally {
    await browser.close()
  }
}
