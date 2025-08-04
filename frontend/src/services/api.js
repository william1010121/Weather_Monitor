import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  loginWithGoogle: () => api.get('/auth/google'),
  verifyGoogleToken: (tokenData) => api.post('/auth/google/verify', tokenData),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  logout: () => api.post('/auth/logout'),
};

// User API
export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  updateUserSettings: (settingsData) => api.put('/users/me/settings', settingsData),
  getUsers: () => api.get('/users/'),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deactivateUser: (userId) => api.delete(`/users/${userId}`),
  activateUser: (userId) => api.post(`/users/${userId}/activate`),
  makeAdmin: (userId) => api.post(`/users/${userId}/make-admin`),
  removeAdmin: (userId) => api.delete(`/users/${userId}/remove-admin`),
};

// Observations API
export const observationsAPI = {
  getObservations: (params) => api.get('/observations/', { params }),
  getObservation: (observationId) => api.get(`/observations/${observationId}`),
  createObservation: (observationData) => api.post('/observations/', observationData),
  updateObservation: (observationId, observationData) => 
    api.put(`/observations/${observationId}`, observationData),
  deleteObservation: (observationId) => api.delete(`/observations/${observationId}`),
  getDashboardData: () => api.get('/observations/dashboard'),
  getUserObservations: (userId, params) => 
    api.get(`/observations/user/${userId}`, { params }),
  exportCSV: (params) => 
    api.get('/observations/export/csv', { 
      params,
      responseType: 'blob' // Important for file downloads
    }),
};

export default api;