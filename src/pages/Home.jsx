import Hero from '../components/Hero'
import TrustStrip from '../components/TrustStrip'
import SearchBar from '../components/SearchBar'
import FeaturedDestinations from '../components/FeaturedDestinations'
import Packages from '../components/Packages'
import FeaturedCities from '../components/FeaturedCities'
import WhyUs from '../components/WhyUs'
import Offers from '../components/Offers'
import Testimonials from '../components/Testimonials'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <SearchBar />
      <FeaturedDestinations />
      <Packages />
      <FeaturedCities />
      <WhyUs />
      <Offers />
      <Testimonials />
    </>
  )
}
