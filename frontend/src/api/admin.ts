import { api as client } from '../lib/api';

export const adminApi = {
  getUsers: async () => {
    const response = await client.get('/admin/users/');
    return response.data;
  },
  
  getUserStats: async () => {
    const response = await client.get('/admin/users/stats/');
    return response.data;
  },
  
  inviteUser: async (email: string) => {
    const response = await client.post('/admin/users/invite/', { email });
    return response.data;
  },
  
  getAnalyticsDashboard: async () => {
    const response = await client.get('/admin/analytics/dashboard/');
    return response.data;
  }
};
