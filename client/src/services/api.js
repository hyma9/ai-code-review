import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api' || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Submissions API
export const submissionsAPI = {
  create: (data) => api.post('/submissions', data),
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.language && filters.language !== 'all') {
      params.append('language', filters.language);
    }
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    return api.get(`/submissions?${params.toString()}`);
  },
  getById: (id) => api.get(`/submissions/${id}`),
  getUserSubmissions: (userId) => api.get(`/submissions/user/${userId}`),
  update: (id, data) => api.put(`/submissions/${id}`, data),
  delete: (id) => api.delete(`/submissions/${id}`)
};

// Reviews API
export const reviewsAPI = {
  create: (data) => api.post('/reviews', data),
  getBySubmission: (submissionId) => api.get(`/reviews/submission/${submissionId}`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`)
};

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  getStats: (userId) => api.get(`/users/${userId}/stats`)
};

export default api;