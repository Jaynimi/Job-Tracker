// lib/api.ts
import { useAuth } from '@clerk/nextjs';

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const { getToken } = useAuth();
  const token = await getToken();
  
  const response = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}