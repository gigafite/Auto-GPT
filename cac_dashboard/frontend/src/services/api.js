/**
 * API service for CAC Dashboard
 */
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expense API
export const expenseAPI = {
  create: (data) => api.post('/api/expenses', data),
  getAll: (params = {}) => api.get('/api/expenses', { params }),
  getById: (id) => api.get(`/api/expenses/${id}`),
  update: (id, data) => api.put(`/api/expenses/${id}`, data),
  delete: (id) => api.delete(`/api/expenses/${id}`),
};

// Deal API
export const dealAPI = {
  create: (data) => api.post('/api/deals', data),
  getAll: (params = {}) => api.get('/api/deals', { params }),
  getById: (id) => api.get(`/api/deals/${id}`),
  update: (id, data) => api.put(`/api/deals/${id}`, data),
  delete: (id) => api.delete(`/api/deals/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getCurrentCAC: (periodType = 'monthly') =>
    api.get('/api/analytics/cac/current', { params: { period_type: periodType } }),

  getDashboardSummary: (periodType = 'monthly') =>
    api.get('/api/analytics/cac/dashboard', { params: { period_type: periodType } }),

  getCACHistory: (periodType = 'monthly', numPeriods = 12) =>
    api.get('/api/analytics/cac/history', {
      params: { period_type: periodType, num_periods: numPeriods }
    }),

  calculateAndSaveCAC: (periodType = 'monthly', referenceDate = null) =>
    api.post('/api/analytics/cac/calculate', null, {
      params: { period_type: periodType, reference_date: referenceDate }
    }),

  getExpenseBreakdown: (periodType = 'monthly') =>
    api.get('/api/analytics/expenses/breakdown', { params: { period_type: periodType } }),

  getTrends: (periodType = 'monthly', numPeriods = 12) =>
    api.get('/api/analytics/trends', {
      params: { period_type: periodType, num_periods: numPeriods }
    }),
};

export default api;
