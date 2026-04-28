import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

export const fetchPackages = (params = {}) =>
  api.get('/packages', { params }).then(r => r.data)

export const fetchPackage = (slug) =>
  api.get(`/packages/${slug}`).then(r => r.data)

export const createBooking = (payload) =>
  api.post('/bookings', payload).then(r => r.data)

export const sendContact = (payload) =>
  api.post('/contact', payload).then(r => r.data)

export default api
