import { API_BASE_URL, WS_BASE_URL } from '../lib/config';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../lib/auth';
export const API_URL = `${API_BASE_URL}/api/v1`;

export function getAuthHeaders() {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function fetchVehicles() {
  const response = await fetch(`${API_URL}/vehicles/`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
}

export async function fetchVehicle(id: string) {
  const response = await fetch(`${API_URL}/vehicles/${id}/`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch vehicle');
  return response.json();
}

export async function updateVehicle(id: string, data: any) {
  const response = await fetch(`${API_URL}/vehicles/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update vehicle');
  return response.json();
}

export async function fetchServiceHistory(id: string, search: string, type: string) {
  const url = new URL(`${API_URL}/vehicles/${id}/service_history/`);
  if (search) url.searchParams.append('search', search);
  if (type && type !== 'All') url.searchParams.append('type', type);
  
  const response = await fetch(url.toString(), { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch service history');
  return response.json();
}

