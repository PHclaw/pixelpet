import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().token
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const petApi = {
  get: () => api.get('/pets/'),
  adopt: (data: { name: string; pet_type: string }) =>
    api.post('/pets/adopt', data),
  feed: (itemId: number) => api.post('/pets/feed', { item_id: itemId }),
  play: () => api.post('/pets/play'),
}

export const shopApi = {
  items: () => api.get('/shop/items'),
  buy: (itemId: number) => api.post(`/shop/buy/${itemId}`),
  inventory: () => api.get('/shop/inventory'),
}

export const socialApi = {
  leaderboard: () => api.get('/social/leaderboard'),
  follow: (userId: number) => api.post(`/social/follow/${userId}`),
  unfollow: (userId: number) => api.delete(`/social/follow/${userId}`),
  following: () => api.get('/social/following'),
  achievements: () => api.get('/social/achievements'),
}

export const taskApi = {
  list: () => api.get('/tasks/'),
  complete: (taskId: number) => api.post(`/tasks/${taskId}/complete`),
}

export default api
