import { API_BASE_URL, WS_BASE_URL } from '../lib/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
const BASE_URL = import.meta.env.VITE_API_URL || API_BASE_URL + '/api/v1';

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
};

export const advisorApi = {
  getDashboardStats: async () => {
    return apiFetch('/advisor/dashboard/');
  },
  
  getActiveServiceOrders: async () => {
    return apiFetch('/advisor/service-orders/active/');
  },
  
  getServiceHistory: async () => {
    return apiFetch('/advisor/service-orders/');
  },
  
  createServiceOrder: async (data: any) => {
    return apiFetch('/advisor/service-orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getServiceOrder: async (id: string) => {
    return apiFetch(`/advisor/service-orders/${id}/`);
  },
  
  updateServiceOrder: async (id: string, data: any) => {
    return apiFetch(`/advisor/service-orders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  
  getAppointments: async () => {
    return apiFetch('/advisor/appointments/');
  },
  
  getInvoices: async () => {
    // For now we might not have a dedicated backend route, but we set it up anyway.
    return apiFetch('/advisor/invoices/').catch(() => []); // Fallback to empty array if backend not implemented yet
  },
  
  processPayment: async (invoiceId: string, amount: number, method: string) => {
    return apiFetch(`/advisor/invoices/${invoiceId}/pay/`, {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    });
  },
  
  getEstimates: async () => {
    return apiFetch('/advisor/estimates/');
  },
  
  sendEstimate: async (id: string) => {
    return apiFetch(`/advisor/estimates/${id}/send/`, {
      method: 'POST',
    });
  },
  
  getTechnicians: async () => {
    return apiFetch(`/advisor/technicians/`);
  },
  
  getCustomers: async () => {
    return apiFetch(`/advisor/customers/`);
  },
  
  getVehicles: async () => {
    return apiFetch(`/advisor/vehicles/`);
  },
  
  getConversations: async () => {
    return apiFetch(`/advisor/conversations/`);
  },
  
  createConversation: async (customerId: string) => {
    return apiFetch(`/advisor/conversations/`, {
      method: 'POST',
      body: JSON.stringify({ customer: customerId })
    });
  },
  
  getMessages: async (conversationId: string) => {
    return apiFetch(`/advisor/messages/?conversation=${conversationId}`);
  },
  
  sendMessage: async (conversationId: string, content: string) => {
    return apiFetch(`/advisor/messages/`, {
      method: 'POST',
      body: JSON.stringify({ conversation: conversationId, content })
    });
  },
  
  markMessagesRead: async (conversationId: string) => {
    return apiFetch(`/advisor/messages/mark_read/`, {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId })
    });
  },

  getNotifications: async () => {
    return apiFetch(`/advisor/notifications/`);
  },

  markNotificationsRead: async () => {
    return apiFetch(`/advisor/notifications/mark_all_read/`, { method: 'POST' });
  }
};

