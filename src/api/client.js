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

api.interceptors.request.use((config) => {
  const t = getToken()
  if (t) config.headers.Authorization = `Bearer ${t}`
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

export const adminUploadImages = (files) => {
  const fd = new FormData()
  for (const f of files) fd.append('files', f)
  return api.post('/admin/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export default api
