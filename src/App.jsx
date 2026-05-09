import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import PopupEnquiry from './components/PopupEnquiry'
import Home from './pages/Home'
import PackagesPage from './pages/PackagesPage'
import PackageDetail from './pages/PackageDetail'
import CitiesPage from './pages/CitiesPage'
import CityDetailPage from './pages/CityDetailPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Booking from './pages/Booking'
import NotFound from './pages/NotFound'
import { AdminAuthProvider, RequireAdmin } from './admin/AdminAuth'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminPackagesList from './admin/AdminPackagesList'
import AdminPackageForm from './admin/AdminPackageForm'
import AdminEnquiriesList from './admin/AdminEnquiriesList'
import AdminTestimonialsList from './admin/AdminTestimonialsList'
import AdminTestimonialForm from './admin/AdminTestimonialForm'
import './App.css'

function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <AdminAuthProvider>
      <div className="app">
        <ScrollToTop />
        {!isAdmin && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:slug" element={<PackageDetail />} />
          <Route path="/cities" element={<CitiesPage />} />
          <Route path="/cities/:city" element={<CityDetailPage />} />
          <Route path="/book/:slug" element={<Booking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminPackagesList />} />
            <Route path="packages" element={<AdminPackagesList />} />
            <Route path="packages/new" element={<AdminPackageForm />} />
            <Route path="packages/:slug/edit" element={<AdminPackageForm />} />
            <Route path="enquiries" element={<AdminEnquiriesList />} />
            <Route path="testimonials" element={<AdminTestimonialsList />} />
            <Route path="testimonials/new" element={<AdminTestimonialForm />} />
            <Route path="testimonials/:id/edit" element={<AdminTestimonialForm />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAdmin && <Footer />}
        {!isAdmin && <PopupEnquiry />}
      </div>
    </AdminAuthProvider>
  )
}

export default App
