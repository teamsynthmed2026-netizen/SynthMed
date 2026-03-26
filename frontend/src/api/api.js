// api.js - Centralized API calls using Axios
// All backend API calls are made from here
import axios from 'axios';

// Base URL - uses Vite proxy in dev (configured in vite.config.js)
const API_BASE = '/api';

// Create axios instance with default settings
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor: Automatically add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cureconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Authentication API ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
};

// ---- Symptoms API ----
export const symptomsAPI = {
  // data = { symptoms: string[], prompt: string }
  check: (data) => api.post('/symptoms/check', data),
  getHistory: () => api.get('/symptoms/history'),
};


// ---- First Aid API ----
export const firstAidAPI = {
  getAll: () => api.get('/firstaid'),
  getByCondition: (condition) => api.get(`/firstaid/${condition}`),
};

// ---- Doctors API ----
export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
};

// ---- Appointments API ----
export const appointmentsAPI = {
  book: (data) => api.post('/appointments', data),
  getMy: () => api.get('/appointments/my'),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
};

export default api;
