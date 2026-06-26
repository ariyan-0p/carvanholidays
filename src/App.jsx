import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import SubNav from './components/SubNav'
import AnnouncementBar from './components/AnnouncementBar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ScrollProgress'
import Preloader from './components/Preloader'
import FloatingContact from './components/FloatingContact'
import PopupEnquiry from './components/PopupEnquiry'
import Home from './pages/Home'
import PackagesPage from './pages/PackagesPage'
import PackageDetail from './pages/PackageDetail'
import CitiesPage from './pages/CitiesPage'
import CityDetailPage from './pages/CityDetailPage'
import About from './pages/About'
import Contact from './pages/Contact'
import Booking from './pages/Booking'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'
import CarRentals from './pages/CarRentals'
import NotFound from './pages/NotFound'
import { AdminAuthProvider, RequireAdmin } from './admin/AdminAuth'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'
import AdminPackagesList from './admin/AdminPackagesList'
import AdminPackageForm from './admin/AdminPackageForm'
import AdminEnquiriesList from './admin/AdminEnquiriesList'
import AdminTestimonialsList from './admin/AdminTestimonialsList'
import AdminTestimonialForm from './admin/AdminTestimonialForm'
import AdminAnnouncementsList from './admin/AdminAnnouncementsList'
import AdminAnnouncementForm from './admin/AdminAnnouncementForm'
import AdminInstaList from './admin/AdminInstaList'
import AdminInstaForm from './admin/AdminInstaForm'
import AdminPartnersList from './admin/AdminPartnersList'
import AdminPartnerForm from './admin/AdminPartnerForm'
import AdminBlogsList from './admin/AdminBlogsList'
import AdminBlogForm from './admin/AdminBlogForm'
import AdminHomepageLayout from './admin/AdminHomepageLayout'
import AdminPopupConfig from './admin/AdminPopupConfig'
import AdminSearchSection from './admin/AdminSearchSection'
import AdminHeroList from './admin/AdminHeroList'
import AdminHeroForm from './admin/AdminHeroForm'
import AdminBannersList from './admin/AdminBannersList'
import AdminBannerForm from './admin/AdminBannerForm'
import './App.css'

function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  const isHome = pathname === '/'

  return (
    <AdminAuthProvider>
      <div className="app">
        {!isAdmin && <Preloader />}
        <ScrollToTop />
        {!isAdmin && <AnnouncementBar />}
        {!isAdmin && <ScrollProgress />}
        {!isAdmin && <Navbar />}
        {!isAdmin && !isHome && <SubNav />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:slug" element={<PackageDetail />} />
          <Route path="/cities" element={<CitiesPage />} />
          <Route path="/cities/:city" element={<CityDetailPage />} />
          <Route path="/book/:slug" element={<Booking />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blogs />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/car-rentals" element={<CarRentals />} />

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
            <Route path="announcements" element={<AdminAnnouncementsList />} />
            <Route path="announcements/new" element={<AdminAnnouncementForm />} />
            <Route path="announcements/:id/edit" element={<AdminAnnouncementForm />} />
            <Route path="insta" element={<AdminInstaList />} />
            <Route path="insta/new" element={<AdminInstaForm />} />
            <Route path="insta/:id/edit" element={<AdminInstaForm />} />
            <Route path="partners" element={<AdminPartnersList />} />
            <Route path="partners/new" element={<AdminPartnerForm />} />
            <Route path="partners/:id/edit" element={<AdminPartnerForm />} />
            <Route path="blogs" element={<AdminBlogsList />} />
            <Route path="blogs/new" element={<AdminBlogForm />} />
            <Route path="blogs/:id/edit" element={<AdminBlogForm />} />
            <Route path="homepage" element={<AdminHomepageLayout />} />
            <Route path="popup" element={<AdminPopupConfig />} />
            <Route path="search-section" element={<AdminSearchSection />} />
            <Route path="hero" element={<AdminHeroList />} />
            <Route path="hero/new" element={<AdminHeroForm />} />
            <Route path="hero/:id/edit" element={<AdminHeroForm />} />
            <Route path="banners" element={<AdminBannersList />} />
            <Route path="banners/new" element={<AdminBannerForm />} />
            <Route path="banners/:id/edit" element={<AdminBannerForm />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAdmin && <Footer />}
        {!isAdmin && <PopupEnquiry />}
        {!isAdmin && <FloatingContact />}
      </div>
    </AdminAuthProvider>
  )
}

export default App
