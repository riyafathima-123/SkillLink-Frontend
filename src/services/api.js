import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://rxwdrchsncgobmgeonyn.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4d2RyY2hzbmNnb2JtZ2VvbnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDk0MDg4OCwiZXhwIjoyMDc2NTE2ODg4fQ.wzScgmbgVdz_U_u-Ubu52w4zz61jJnKy4aHrlx5s3O4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to headers
api.interceptors.request.use((config) => {
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

// ===== AUTH (Supabase) =====
export const authAPI = {
  signIn: async (email, password) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },
  signUp: async (email, password, name = null) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
    }
    // Pass user metadata (e.g., full name) via the second `options` parameter
    const credentials = { email, password };
    const options = name ? { data: { name } } : undefined;
    const { data, error } = await supabase.auth.signUp(credentials, options);
    if (error) throw error;
    return data;
  },
  signOut: async () => supabase.auth.signOut(),
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
  // Send password reset email (Supabase will send a reset link)
  resetPassword: async (email, options = {}) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase not configured.');
    }
    // v2 API: resetPasswordForEmail
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, options);
    if (error) throw error;
    return data;
  },
  // Send magic link (passwordless) for sign-in
  sendMagicLink: async (email, options = {}) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase not configured.');
    }
    const { data, error } = await supabase.auth.signInWithOtp({ email, options });
    if (error) throw error;
    return data;
  },
};

// ===== USER API =====
export const userAPI = {
  // use Supabase auth for login; returns { token, user }
  login: async (email, password) => {
    const data = await authAPI.signIn(email, password);
    return { token: data.session?.access_token, user: data.user };
  },
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
  updateConnection: (connectionId, data) => api.put(`/connections/${connectionId}`, data),
  cancelConnection: (connectionId) => api.delete(`/connections/${connectionId}`),
};

// ===== CREDITS API =====
export const creditAPI = {
  getBalance: () => api.get('/credits/balance'),
  purchaseCredits: (amount, meta = {}) => api.post('/credits/purchase', { amount, meta }),
  spendCredits: (amount, reason = '') => api.post('/credits/spend', { amount, reason }),
  getTransactions: () => api.get('/credits/transactions'),
};

// ===== MATCHMAKING API =====
export const matchmakingAPI = {
  getMatches: (skillId, limit = 10) => api.get(`/matchmaking/for-skill/${skillId}`, { params: { limit } }),
  searchSkills: (query, limit = 30) => api.post('/matchmaking/search', { query, candidatesLimit: limit }),
};

export default api;
