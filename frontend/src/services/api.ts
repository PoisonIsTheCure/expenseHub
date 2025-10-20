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
  addMember: (id: string, email: string) => api.post(`/households/${id}/members`, { email }),
  removeMember: (id: string, memberId: string) => api.delete(`/households/${id}/members/${memberId}`),
  addContribution: (id: string, amount: number) => api.post(`/households/${id}/contributions`, { amount }),
  getContributionStats: (id: string) => api.get(`/households/${id}/contributions/stats`),
  updateBudget: (id: string, data: { monthlyLimit?: number; currency?: string }) => 
    api.put(`/households/${id}/budget`, data),
};

// Expense API
export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id: string) => api.get(`/expenses/${id}`),
  getByHousehold: (householdId: string) =>
    api.get(`/expenses/household/${householdId}`),
  create: (data: any) => {
    // Check if data is FormData (for file uploads)
    if (data instanceof FormData) {
      return api.post('/expenses', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/expenses', data);
  },
  update: (id: string, data: any) => {
    // Check if data is FormData (for file uploads)
    if (data instanceof FormData) {
      return api.put(`/expenses/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/expenses/${id}`, data);
  },
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

// Budget API
export const budgetAPI = {
  getPersonal: () => api.get('/budgets/personal'),
  updatePersonal: (data: any) => api.put('/budgets/personal', data),
  getHousehold: (householdId: string) => api.get(`/budgets/household/${householdId}`),
  updateHousehold: (householdId: string, data: any) => 
    api.put(`/budgets/household/${householdId}`, data),
  addHouseholdContribution: (householdId: string, amount: number) =>
    api.post(`/budgets/household/${householdId}/contribution`, { amount }),
};

// Settlement API
export const settlementAPI = {
  getBalances: (householdId: string) => 
    api.get(`/settlements/households/${householdId}/balances`),
  getHouseholdSettlements: (householdId: string) => 
    api.get(`/settlements/households/${householdId}`),
  getUserSettlements: () => api.get('/settlements/user'),
  create: (data: any) => {
    if (data instanceof FormData) {
      return api.post('/settlements', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.post('/settlements', data);
  },
  updateStatus: (id: string, status: string) => 
    api.patch(`/settlements/${id}/status`, { status }),
};

// Recurring Expense API
export const recurringExpenseAPI = {
  getAll: () => api.get('/recurring-expenses'),
  getById: (id: string) => api.get(`/recurring-expenses/${id}`),
  create: (data: any) => api.post('/recurring-expenses', data),
  update: (id: string, data: any) => api.put(`/recurring-expenses/${id}`, data),
  delete: (id: string) => api.delete(`/recurring-expenses/${id}`),
  process: () => api.post('/recurring-expenses/process'),
};

// Analytics API
export const analyticsAPI = {
  getPersonal: (params?: { startDate?: string; endDate?: string }) => 
    api.get('/analytics/personal', { params }),
  getHousehold: (householdId: string, params?: { startDate?: string; endDate?: string }) => 
    api.get(`/analytics/household/${householdId}`, { params }),
  compareMonths: (householdId?: string) => 
    api.get('/analytics/compare-months', { params: { householdId } }),
  getCategoryTrends: (params?: { householdId?: string; months?: number }) => 
    api.get('/analytics/trends', { params }),
};

