import axios from 'axios'

const TOKEN_KEY = 'ch_admin_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t)
  else localStorage.removeItem(TOKEN_KEY)
}
export const clearToken = () => setToken(null)

const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

// Routes that involve uploading a file/blob (multipart) deserve a much
// longer ceiling than the chatty JSON default — 80MB videos over a flaky
// mobile connection can easily take a couple of minutes.
const UPLOAD_PATHS = ['/admin/upload', '/admin/media', '/admin/hero-upload']

api.interceptors.request.use((config) => {
  const t = getToken()
  if (t) config.headers.Authorization = `Bearer ${t}`
  const url = config.url || ''
  if (UPLOAD_PATHS.some((p) => url.includes(p))) {
    config.timeout = 5 * 60 * 1000 // 5 minutes for media uploads
  }
  return config
})

export const fetchPackages = (params = {}) =>
  api.get('/packages', { params }).then(r => r.data)

export const fetchPackage = (slug) =>
  api.get(`/packages/${slug}`).then(r => r.data)

export const fetchCities = () =>
  api.get('/cities').then(r => r.data)

export const fetchCity = (city) =>
  api.get(`/cities/${city}`).then(r => r.data)

export const createBooking = (payload) =>
  api.post('/bookings', payload).then(r => r.data)

export const sendContact = (payload) =>
  api.post('/contact', payload).then(r => r.data)

export const submitEnquiry = (payload) =>
  api.post('/enquiries', payload).then(r => r.data)

// ---------- Admin ----------
export const adminLogin = (email, password) =>
  api.post('/admin/login', { email, password }).then(r => r.data)

export const adminMe = () => api.get('/admin/me').then(r => r.data)

export const adminListPackages = () =>
  api.get('/admin/packages').then(r => r.data)

export const adminCreatePackage = (data) =>
  api.post('/admin/packages', data).then(r => r.data)

export const adminUpdatePackage = (slug, data) =>
  api.put(`/admin/packages/${slug}`, data).then(r => r.data)

export const adminDeletePackage = (slug, hard = false) =>
  api.delete(`/admin/packages/${slug}`, { params: hard ? { hard: 'true' } : {} }).then(r => r.data)

export const adminListEnquiries = (params = {}) =>
  api.get('/admin/enquiries', { params }).then(r => r.data)

export const adminUpdateEnquiry = (id, data) =>
  api.patch(`/admin/enquiries/${id}`, data).then(r => r.data)

export const adminDeleteEnquiry = (id) =>
  api.delete(`/admin/enquiries/${id}`).then(r => r.data)

export const adminUploadImages = (files) => {
  const fd = new FormData()
  for (const f of files) fd.append('files', f)
  return api.post('/admin/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const adminUploadMedia = (files) => {
  const fd = new FormData()
  for (const f of files) fd.append('files', f)
  return api.post('/admin/media', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const fetchTestimonials = () =>
  api.get('/testimonials').then(r => r.data)

export const adminListTestimonials = () =>
  api.get('/admin/testimonials').then(r => r.data)

export const adminCreateTestimonial = (data) =>
  api.post('/admin/testimonials', data).then(r => r.data)

export const adminUpdateTestimonial = (id, data) =>
  api.put(`/admin/testimonials/${id}`, data).then(r => r.data)

export const adminDeleteTestimonial = (id) =>
  api.delete(`/admin/testimonials/${id}`).then(r => r.data)

export const fetchAnnouncements = () =>
  api.get('/announcements').then(r => r.data)

export const adminListAnnouncements = () =>
  api.get('/admin/announcements').then(r => r.data)

export const adminCreateAnnouncement = (data) =>
  api.post('/admin/announcements', data).then(r => r.data)

export const adminUpdateAnnouncement = (id, data) =>
  api.put(`/admin/announcements/${id}`, data).then(r => r.data)

export const adminDeleteAnnouncement = (id) =>
  api.delete(`/admin/announcements/${id}`).then(r => r.data)

export const fetchInsta = () =>
  api.get('/insta').then(r => r.data)

export const adminListInsta = () =>
  api.get('/admin/insta').then(r => r.data)

export const adminCreateInsta = (data) =>
  api.post('/admin/insta', data).then(r => r.data)

export const adminUpdateInsta = (id, data) =>
  api.put(`/admin/insta/${id}`, data).then(r => r.data)

export const adminDeleteInsta = (id) =>
  api.delete(`/admin/insta/${id}`).then(r => r.data)

export const fetchPartners = () =>
  api.get('/partners').then(r => r.data)

export const adminListPartners = () =>
  api.get('/admin/partners').then(r => r.data)

export const adminCreatePartner = (data) =>
  api.post('/admin/partners', data).then(r => r.data)

export const adminUpdatePartner = (id, data) =>
  api.put(`/admin/partners/${id}`, data).then(r => r.data)

export const adminDeletePartner = (id) =>
  api.delete(`/admin/partners/${id}`).then(r => r.data)

export const fetchBlogs = () =>
  api.get('/blogs').then(r => r.data)

export const fetchBlog = (slug) =>
  api.get(`/blogs/${slug}`).then(r => r.data)

export const adminListBlogs = () =>
  api.get('/admin/blogs').then(r => r.data)

export const adminGetBlog = (id) =>
  api.get(`/admin/blogs/${id}`).then(r => r.data)

export const adminCreateBlog = (data) =>
  api.post('/admin/blogs', data).then(r => r.data)

export const adminUpdateBlog = (id, data) =>
  api.put(`/admin/blogs/${id}`, data).then(r => r.data)

export const adminDeleteBlog = (id) =>
  api.delete(`/admin/blogs/${id}`).then(r => r.data)

export const fetchHomeSections = () =>
  api.get('/home-sections').then(r => r.data)

export const adminListHomeSections = () =>
  api.get('/admin/home-sections').then(r => r.data)

export const adminUpdateHomeSection = (key, data) =>
  api.put(`/admin/home-sections/${key}`, data).then(r => r.data)

// ---------- Hero slides ----------
export const fetchHeroSlides = () =>
  api.get('/hero').then(r => r.data)

export const adminListHeroSlides = () =>
  api.get('/admin/hero').then(r => r.data)

export const adminCreateHeroSlide = (data) =>
  api.post('/admin/hero', data).then(r => r.data)

export const adminUpdateHeroSlide = (id, data) =>
  api.put(`/admin/hero/${id}`, data).then(r => r.data)

export const adminDeleteHeroSlide = (id) =>
  api.delete(`/admin/hero/${id}`).then(r => r.data)

export const adminUploadHeroMedia = (files, onProgress) => {
  const fd = new FormData()
  for (const f of files) fd.append('files', f)
  return api.post('/admin/hero-upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  }).then(r => r.data)
}

// ---------- Promo banners ----------
export const fetchBanners = (slot) =>
  api.get('/banners', { params: slot ? { slot } : {} }).then(r => r.data)

export const adminListBanners = () =>
  api.get('/admin/banners').then(r => r.data)

export const adminCreateBanner = (data) =>
  api.post('/admin/banners', data).then(r => r.data)

export const adminUpdateBanner = (id, data) =>
  api.put(`/admin/banners/${id}`, data).then(r => r.data)

export const adminDeleteBanner = (id) =>
  api.delete(`/admin/banners/${id}`).then(r => r.data)

export const fetchPopupConfig = () =>
  api.get('/popup-config').then(r => r.data)

export const adminGetPopupConfig = () =>
  api.get('/admin/popup-config').then(r => r.data)

export const adminUpdatePopupConfig = (data) =>
  api.put('/admin/popup-config', data).then(r => r.data)

export const fetchSearchSection = () =>
  api.get('/search-section').then(r => r.data)

export const adminGetSearchSection = () =>
  api.get('/admin/search-section').then(r => r.data)

export const adminUpdateSearchSection = (data) =>
  api.put('/admin/search-section', data).then(r => r.data)

export default api
