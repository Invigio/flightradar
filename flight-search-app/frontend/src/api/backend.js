/**
 * Backend API Client
 * Komunikacja z własnym backendem (baza danych)
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Axios instance z automatycznym tokenem
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatycznie dodaj token do każdego requesta
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Search History
export const searchHistory = {
  save: (data) => api.post('/search-history', data),
  getAll: (params) => api.get('/search-history', { params }),
  delete: (id) => api.delete(`/search-history/${id}`)
};

// Price Alerts
export const priceAlerts = {
  create: (data) => api.post('/price-alerts', data),
  getAll: (activeOnly = true) => api.get('/price-alerts', { params: { active_only: activeOnly } }),
  deactivate: (id) => api.patch(`/price-alerts/${id}/deactivate`),
  delete: (id) => api.delete(`/price-alerts/${id}`)
};

// Favorites
export const favorites = {
  add: (data) => api.post('/favorites', data),
  getAll: () => api.get('/favorites'),
  delete: (id) => api.delete(`/favorites/${id}`)
};

export default api;
