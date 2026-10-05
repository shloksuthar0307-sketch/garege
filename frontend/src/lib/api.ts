import { API_BASE_URL, WS_BASE_URL } from '../lib/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
export const API_URL = `${API_BASE_URL}/api/v1`;

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Optionally handle 401 refresh here
    throw new Error(`API Error: ${response.statusText}`);
  }

  return { data: await response.json() };
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, data: any) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  upload: async (endpoint: string, formData: FormData) => {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
    return { data: await response.json() };
  },
  patch: (endpoint: string, data: any) => request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
};

