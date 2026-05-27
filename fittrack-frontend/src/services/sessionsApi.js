import { API_BASE } from '../config/apiBase';
import { getAuthToken } from './authToken';

async function fetchJson(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function createSession(payload) {
  return fetchJson('/sesiones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listSessionHistory() {
  return fetchJson('/sesiones/historial', { method: 'GET' });
}

