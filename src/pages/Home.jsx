import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import AsFeaturedIn from '../components/AsFeaturedIn'
import SearchBar from '../components/SearchBar'
import FeaturedDestinations from '../components/FeaturedDestinations'
import PackageShelf from '../components/PackageShelf'
import RegionExplorer from '../components/RegionExplorer'
import WhyUs from '../components/WhyUs'
import Testimonials from '../components/Testimonials'
import InstaShowcase from '../components/InstaShowcase'
import OfficialPartners from '../components/OfficialPartners'
import { HOME_SECTIONS } from '../config/homeSections'
import { fetchHomeSections } from '../api/client'

// Merge an admin override on top of the default section config.
// Empty string fields fall back to the default so an admin can clear a field
// to "use default" simply by deleting the value.
const merge = (def, override) => {
  if (!override) return def
  const pick = (k) => (override[k] != null && override[k] !== '' ? override[k] : def[k])
  return {
    ...def,
    tag: pick('tag'),
    title: pick('title'),
    subtitle: pick('subtitle'),
    visible: override.visible !== false,
  }
}

export default function Home() {
  const [overrides, setOverrides] = useState({})

  useEffect(() => {
    fetchHomeSections()
      .then((data) => setOverrides(data || {}))
      .catch(() => setOverrides({}))
  }, [])

  const sec = (key) => merge(HOME_SECTIONS.find(s => s.key === key), overrides[key])

  const featured = sec('featured')
  const topPicks = sec('top-picks')
  const trending = sec('trending')
  const weekend  = sec('weekend')
  const offers   = sec('offers')

  const renderShelf = (s) => s.visible === false
    ? null
    : <PackageShelf key={s.key} section={s.key} tag={s.tag} title={s.title} subtitle={s.subtitle} />

  return (
    <>
      <Hero />
      <TrustStrip />
      <SearchBar />
      <AsFeaturedIn />
      <FeaturedDestinations />
      {renderShelf(featured)}
      {renderShelf(topPicks)}
      <RegionExplorer />
      <WhyUs />
      {renderShelf(trending)}
      {renderShelf(weekend)}
      {renderShelf(offers)}
      <Testimonials />
      <InstaShowcase />
      <OfficialPartners />
    </>
  )
}
