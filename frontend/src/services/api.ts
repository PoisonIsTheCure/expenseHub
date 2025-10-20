import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role?: string) =>
    api.post('/auth/register', { name, email, password, role }),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Household API
export const householdAPI = {
  getAll: () => api.get('/households'),
  getById: (id: string) => api.get(`/households/${id}`),
  create: (name: string) => api.post('/households', { name }),
  update: (id: string, name: string) => api.put(`/households/${id}`, { name }),
  delete: (id: string) => api.delete(`/households/${id}`),
  join: (id: string) => api.post(`/households/${id}/join`),
  leave: (id: string) => api.post(`/households/${id}/leave`),
};

// Expense API
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id: string) => api.get(`/expenses/${id}`),
  getByHousehold: (householdId: string) =>
    api.get(`/expenses/household/${householdId}`),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

