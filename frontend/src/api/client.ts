export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function fetchVehicles() {
  const response = await fetch(`${API_BASE_URL}/vehicles/`);
  if (!response.ok) throw new Error('Failed to fetch vehicles');
  return response.json();
}

export async function fetchVehicle(id: string) {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}/`);
  if (!response.ok) throw new Error('Failed to fetch vehicle');
  return response.json();
}

export async function updateVehicle(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/vehicles/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update vehicle');
  return response.json();
}

export async function fetchServiceHistory(id: string, search: string, type: string) {
  const url = new URL(`${API_BASE_URL}/vehicles/${id}/service_history/`);
  if (search) url.searchParams.append('search', search);
  if (type && type !== 'All') url.searchParams.append('type', type);
  
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error('Failed to fetch service history');
  return response.json();
}

