import { API_BASE } from '../config/apiBase';
import { getAuthToken } from './authToken';

async function fetchJson(path) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function listZones() {
  return fetchJson('/catalog/zones');
}

export function listWorkoutTypes() {
  return fetchJson('/catalog/types');
}

export function searchCatalogExercises({ search = '', zoneKey = '', typeKey = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (zoneKey) params.set('zoneKey', zoneKey);
  if (typeKey) params.set('typeKey', typeKey);
  const qs = params.toString();
  return fetchJson(`/catalog/exercises${qs ? `?${qs}` : ''}`);
}

