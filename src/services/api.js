import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Supabase config (for auth only, not for login)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;

let _supabase = null;
export function getSupabase() {
  if (_supabase) return _supabase;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
  }
  _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _supabase;
}

// Create Axios instance for backend calls
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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API (Supabase) =====
export const authAPI = {
  signUp: async (email, password, full_name = null) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Supabase not configured.');
    }

    try {
      // Step 1: Sign up in Supabase Auth
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: full_name ? { full_name } : undefined,
          emailRedirectTo: process.env.REACT_APP_EMAIL_REDIRECT || `${window?.location?.origin}/auth/callback`,
        },
      });
      if (error) throw error;

      // Step 2: Register user in backend (in development, auto-confirms email)
      try {
        console.log('Registering user in backend...');
        const backendResponse = await api.post('/auth/register', {
          email,
          password,
          full_name: full_name || '',
        });
        console.log('Backend registration response:', backendResponse);
      } catch (backendError) {
        console.warn('Backend registration warning:', backendError);
        // Don't throw - Supabase signup was successful, backend might sync later
      }

      return data;
    } catch (err) {
      console.error('Sign up error:', err);
      throw new Error(err.message || 'Failed to create account');
    }
  },

  signOut: async () => getSupabase().auth.signOut(),

  getUser: async () => {
    const { data, error } = await getSupabase().auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Send password reset email via BACKEND
   */
  resetPassword: async (email, options = {}) => {
    try {
      const response = await api.post('/auth/reset-password', { email, ...options });
      return response;
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to send reset email');
    }
  },

  /**
   * Send magic link (passwordless sign-in) via BACKEND
   */
  sendMagicLink: async (email, options = {}) => {
    try {
      const response = await api.post('/auth/send-magic-link', { email, ...options });
      return response;
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || 'Failed to send magic link');
    }
  },

  /**
   * Verify OTP token (after user clicks magic link)
   */
  verifyOtp: async (email, token, type = 'magiclink') => {
    try {
      const { data, error } = await getSupabase().auth.verifyOtp({
        email,
        token,
        type,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err.message || 'Failed to verify OTP');
    }
  },
};

// ===== USER API =====
export const userAPI = {
  /**
   * Login via BACKEND endpoint
   * Backend validates against its own user database
   */
  login: async (email, password) => {
    try {
      console.log('Calling backend login endpoint for:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response);

      // Response structure from backend: { access_token, user, ... }
      if (!response || !response.access_token) {
        throw new Error('Invalid login response - no access token');
      }

      return {
        token: response.access_token,
        user: response.user || { email },
        session: response.session || response,
      };
    } catch (err) {
      console.error('Login API error:', err);

      // Provide clearer error messages
      if (err.response?.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }
      if (err.response?.status === 404) {
        throw new Error('User account not found. Please sign up first.');
      }

      const errorMsg = err.response?.data?.error || err.message || 'Login failed';
      throw new Error(errorMsg);
    }
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

  // Admin Endpoints
  getPendingSkills: () => api.get('/skills/pending'),
  approveSkill: (skillId) => api.put(`/skills/${skillId}/approve`),
  rejectSkill: (skillId) => api.delete(`/skills/${skillId}/reject`),
  listAllSkills: () => api.get('/skills/admin/list'),
};

// ===== ADMIN API =====
export const adminAPI = {
  listUsers: () => api.get('/users/admin/list'),
  listTeachingRequests: () => api.get('/users/admin/teaching-requests'),
  updateTeachingStatus: (userId, status) => api.put(`/users/admin/${userId}/teaching-status`, { status }),
  listAllTransactions: () => api.get('/credits/admin/transactions'),
  listAllConnections: () => api.get('/connections/admin/list'),
  validateConnection: (connectionId) => api.put(`/connections/admin/${connectionId}/validate`),
};

// ===== CONNECTIONS API =====
export const connectionAPI = {
  listConnections: () => api.get('/connections'),
  getConnection: (connectionId) => api.get(`/connections/${connectionId}`),
  createConnection: (data) => api.post('/connections', data),
  updateConnection: (connectionId, data) => api.put(`/connections/${connectionId}`, data),
  cancelConnection: (connectionId) => api.delete(`/connections/${connectionId}`),
  submitCompletion: (connectionId) => api.put(`/connections/${connectionId}/complete`),
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
  findMatches: (skillConfig) => api.post('/matchmaking/find', { skillConfig }),
};

// ===== MESSAGES API =====
export const messageAPI = {
  sendMessage: (recipientId, text) => api.post('/messages', { recipient_id: recipientId, text }),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId) => api.get(`/messages/${conversationId}`),
};

// ===== ASSESSMENT API =====
export const assessmentAPI = {
  getQuestions: (skillId) => api.get(`/assessments/${skillId}/questions`),
  submitAssessment: (data) => api.post('/assessments/submit', data),
  getResult: (connectionId) => api.get(`/assessments/result/${connectionId}`),
};

export default api;
