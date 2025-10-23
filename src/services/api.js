import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to headers
// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ===== USER API =====
export const userAPI = {
  login: (email) => api.post('/auth/login', { email }), // Add login endpoint
  getMe: () => api.get('/users/me'),
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (data) => api.put('/users/me', data),
  deleteAccount: () => api.delete('/users/me'),
};

// ===== SKILLS API =====
export const skillAPI = {
  listSkills: (query = '', limit = 50) =>
    api.get('/skills', { params: { q: query, limit } }),
  getSkill: (skillId) => api.get(`/skills/${skillId}`),
  createSkill: (data) => api.post('/skills', data),
  updateSkill: (skillId, data) => api.put(`/skills/${skillId}`, data),
  deleteSkill: (skillId) => api.delete(`/skills/${skillId}`),
};

// ===== CONNECTIONS API =====
export const connectionAPI = {
  listConnections: () => api.get('/connections'),
  getConnection: (connectionId) => api.get(`/connections/${connectionId}`),
  createConnection: (data) => api.post('/connections', data),
  updateConnection: (connectionId, data) =>
    api.put(`/connections/${connectionId}`, data),
  cancelConnection: (connectionId) => api.delete(`/connections/${connectionId}`),
};

// ===== CREDITS API =====
export const creditAPI = {
  getBalance: () => api.get('/credits/balance'),
  purchaseCredits: (amount, meta = {}) =>
    api.post('/credits/purchase', { amount, meta }),
  spendCredits: (amount, reason = '') =>
    api.post('/credits/spend', { amount, reason }),
  getTransactions: () => api.get('/credits/transactions'),
};

// ===== MATCHMAKING API =====
export const matchmakingAPI = {
  getMatches: (skillId, limit = 10) =>
    api.get(`/matchmaking/for-skill/${skillId}`, { params: { limit } }),
  searchSkills: (query, limit = 30) =>
    api.post('/matchmaking/search', { query, candidatesLimit: limit }),
};

export default api;
