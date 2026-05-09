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

const sectionMap = Object.fromEntries(HOME_SECTIONS.map(s => [s.key, s]))

export default function Home() {
  const featured = sectionMap['featured']
  const topPicks = sectionMap['top-picks']
  const trending = sectionMap['trending']
  const weekend  = sectionMap['weekend']
  const offers   = sectionMap['offers']

  return (
    <>
      <Hero />
      <TrustStrip />
      <SearchBar />
      <AsFeaturedIn />
      <FeaturedDestinations />
      <PackageShelf section="featured"   tag={featured.tag} title={featured.title} subtitle={featured.subtitle} />
      <PackageShelf section="top-picks"  tag={topPicks.tag} title={topPicks.title} subtitle={topPicks.subtitle} />
      <RegionExplorer />
      <WhyUs />
      <PackageShelf section="trending"   tag={trending.tag} title={trending.title} subtitle={trending.subtitle} />
      <PackageShelf section="weekend"    tag={weekend.tag}  title={weekend.title}  subtitle={weekend.subtitle} />
      <PackageShelf section="offers"     tag={offers.tag}   title={offers.title}   subtitle={offers.subtitle} />
      <Testimonials />
      <InstaShowcase />
      <OfficialPartners />
    </>
  )
}
