const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
    if (config.body instanceof FormData) delete config.headers['Content-Type'];
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.error || 'Request failed', res.status);
  }

  return data;
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body }),
  getMe: () => request('/auth/me'),
  changePassword: (body) => request('/auth/change-password', { method: 'PUT', body }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Notifications
  getNotifications: () => request('/notifications'),

  // Reports
  getMonthlyRevenue: (months) => request(`/reports/monthly-revenue?months=${months || 12}`),
  getLeadFunnel: () => request('/reports/lead-funnel'),
  getAgentLeaderboard: () => request('/reports/agent-leaderboard'),
  getPropertyPerformance: () => request('/reports/property-performance'),

  // Leads
  getLeads: (params) => request(`/leads${params ? '?' + new URLSearchParams(params) : ''}`),
  getLead: (id) => request(`/leads/${id}`),
  createLead: (body) => request('/leads', { method: 'POST', body }),
  updateLead: (id, body) => request(`/leads/${id}`, { method: 'PUT', body }),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
  addLeadNote: (id, body) => request(`/leads/${id}/notes`, { method: 'POST', body }),
  bulkAssignLeads: (body) => request('/leads/bulk-assign', { method: 'POST', body }),
  getFollowUps: () => request('/leads/followups'),

  // Sources
  getSources: () => request('/sources'),

  // Properties
  getProperties: (params) => request(`/properties${params ? '?' + new URLSearchParams(params) : ''}`),
  getProperty: (id) => request(`/properties/${id}`),
  createProperty: (body) => request('/properties', { method: 'POST', body }),
  updateProperty: (id, body) => request(`/properties/${id}`, { method: 'PUT', body }),
  deleteProperty: (id) => request(`/properties/${id}`, { method: 'DELETE' }),

  // Deals
  getDeals: (params) => request(`/deals${params ? '?' + new URLSearchParams(params) : ''}`),
  getDeal: (id) => request(`/deals/${id}`),
  createDeal: (body) => request('/deals', { method: 'POST', body }),
  updateDeal: (id, body) => request(`/deals/${id}`, { method: 'PUT', body }),
  deleteDeal: (id) => request(`/deals/${id}`, { method: 'DELETE' }),

  // Payments
  getPayments: (params) => request(`/payments${params ? '?' + new URLSearchParams(params) : ''}`),
  getPayment: (id) => request(`/payments/${id}`),
  createPayment: (body) => request('/payments', { method: 'POST', body }),
  deletePayment: (id) => request(`/payments/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: (params) => request(`/documents${params ? '?' + new URLSearchParams(params) : ''}`),
  getDocument: (id) => request(`/documents/${id}`),
  createDocument: (body) => request('/documents', { method: 'POST', body }),
  updateDocument: (id, body) => request(`/documents/${id}`, { method: 'PUT', body }),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),

  // Users
  getUsers: () => request('/users'),
  getUser: (id) => request(`/users/${id}`),
  createUser: (body) => request('/users', { method: 'POST', body }),
  updateUser: (id, body) => request(`/users/${id}`, { method: 'PUT', body }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  getAgents: () => request('/users/agents'),
};
