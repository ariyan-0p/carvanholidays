import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import PackagesPage from './pages/PackagesPage'
import PackageDetail from './pages/PackageDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Booking from './pages/Booking'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:slug" element={<PackageDetail />} />
        <Route path="/book/:slug" element={<Booking />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
