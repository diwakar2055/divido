import axios from 'axios';

// Use VITE_API_URL in production, fallback to '/api' (proxy) locally.
// If VITE_API_URL is provided without '/api' at the end, append it.
let API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
if (API_BASE_URL !== '/api' && !API_BASE_URL.endsWith('/api')) {
  API_BASE_URL += '/api';
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Auth API
export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  loginWithGoogle: (data: { token: string }) =>
    api.post('/auth/google', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Groups API
export const groupsAPI = {
  createGroup: (data: { name: string; description?: string }) =>
    api.post('/groups', data),
  getGroups: () => api.get('/groups'),
  getGroup: (groupId: string) => api.get(`/groups/${groupId}`),
  updateGroup: (groupId: string, data: { name?: string; description?: string }) =>
    api.put(`/groups/${groupId}`, data),
  deleteGroup: (groupId: string) => api.delete(`/groups/${groupId}`),
  addMember: (groupId: string, userId: string) =>
    api.post(`/groups/${groupId}/members`, { userId }),
  inviteUser: (groupId: string, email: string) =>
    api.post(`/groups/${groupId}/invite`, { email }),
  searchUsers: (email: string) => api.get('/groups/search/users', { params: { email } }),
  removeMember: (groupId: string, userId: string) =>
    api.delete(`/groups/${groupId}/members`, { data: { userId } }),
  acceptInvitation: (token: string) =>
    api.post(`/groups/invitations/${token}/accept`),
  getPendingInvitations: () =>
    api.get('/groups/invitations/pending'),
};

// Expenses API
export const expensesAPI = {
  createExpense: (data: {
    title: string;
    amount: number;
    groupId: string;
    participants: string[];
    excludedMembers?: string[];
  }) => api.post('/expenses', data),
  getExpenses: (groupId: string) => api.get(`/expenses/${groupId}`),
  updateExpense: (
    expenseId: string,
    data: {
      title?: string;
      amount?: number;
      participants?: string[];
      excludedMembers?: string[];
    }
  ) => api.put(`/expenses/${expenseId}`, data),
  deleteExpense: (expenseId: string) => api.delete(`/expenses/${expenseId}`),
  getBalances: (groupId: string) => api.get(`/expenses/${groupId}/balances`),
};

export default api;
