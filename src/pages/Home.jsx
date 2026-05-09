import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import AsFeaturedIn from '../components/AsFeaturedIn'
import SearchBar from '../components/SearchBar'
import FeaturedDestinations from '../components/FeaturedDestinations'
import Packages from '../components/Packages'
import RegionExplorer from '../components/RegionExplorer'
import WhyUs from '../components/WhyUs'
import Offers from '../components/Offers'
import Testimonials from '../components/Testimonials'
import InstaShowcase from '../components/InstaShowcase'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <SearchBar />
      <AsFeaturedIn />
      <FeaturedDestinations />
      <Packages />
      <RegionExplorer />
      <WhyUs />
      <Offers />
      <Testimonials />
      <InstaShowcase />
    </>
  )
}
