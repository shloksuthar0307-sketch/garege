import { API_BASE_URL, getAuthHeaders } from './client';

export const customerApi = {
  getAppointments: async () => {
    const response = await fetch(`${API_BASE_URL}/appointments/`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return response.json();
  },
  
  createAppointment: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/appointments/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create appointment');
    return response.json();
  },

  getServiceHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/service-orders/`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch service history');
    return response.json();
  },

  getVehicles: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles/`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch vehicles');
    return response.json();
  },

  getInvoices: async () => {
    const response = await fetch(`${API_BASE_URL}/customer/invoices/`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  },

  getNotifications: async () => {
    const response = await fetch(`${API_BASE_URL}/customer/notifications/`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },

  markNotificationRead: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/customer/notifications/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_read: true }),
    });
    if (!response.ok) throw new Error('Failed to mark notification as read');
    return response.json();
  },

  markAllNotificationsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/customer/notifications/mark_all_read/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to mark all notifications as read');
    return response.json();
  },

  getEstimates: async () => {
    const response = await fetch(`${API_BASE_URL}/customer/estimates/`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch estimates');
    return response.json();
  },

  approveEstimate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/customer/estimates/${id}/approve/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to approve estimate');
    return response.json();
  },

  declineEstimate: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/customer/estimates/${id}/decline/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to decline estimate');
    return response.json();
  }
};
