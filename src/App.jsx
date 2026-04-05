import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SearchBar from './components/SearchBar'
import FeaturedDestinations from './components/FeaturedDestinations'
import Packages from './components/Packages'
import WhyUs from './components/WhyUs'
import Offers from './components/Offers'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <SearchBar />
      <FeaturedDestinations />
      <Packages />
      <WhyUs />
      <Offers />
      <Testimonials />
      <Footer />
    </div>
  )
}

export default App
