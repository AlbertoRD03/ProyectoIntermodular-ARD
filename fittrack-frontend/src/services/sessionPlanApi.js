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
    const err = new Error(data?.message || data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function getSessionPlan() {
  return fetchJson('/session-plan');
}

export function saveSessionPlan(payload) {
  return fetchJson('/session-plan', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getSessionPlanPreset(days) {
  return fetchJson(`/session-plan/preset?days=${encodeURIComponent(days)}`);
}
