import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bloodbank_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('bloodbank_token');
        localStorage.removeItem('bloodbank_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const inventoryAPI = {
  getInventory: () => api.get('/inventory'),
  getCompatibility: () => api.get('/inventory/compatibility'),
  updateStock: (bloodGroup, data) => api.put(`/inventory/${encodeURIComponent(bloodGroup)}`, data),
};

export const donorAPI = {
  getDonors: (params) => api.get('/donors', { params }),
  getDonorById: (id) => api.get(`/donors/${id}`),
  createDonor: (data) => api.post('/donors', data),
  recordDonation: (donorId, data) => api.post(`/donors/${donorId}/donate`, data),
  getAllDonations: () => api.get('/donors/donations/all'),
};

export const requestAPI = {
  getRequests: (params) => api.get('/requests', { params }),
  createRequest: (data) => api.post('/requests', data),
  updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
};

export const analyticsAPI = {
  getDashboardMetrics: () => api.get('/analytics/dashboard'),
};

export default api;
