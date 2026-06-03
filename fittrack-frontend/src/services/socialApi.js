import { API_BASE } from '../config/apiBase';
import { getAuthToken } from './authToken';

async function apiFetch(path, { method = 'GET', body, signal } = {}) {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.message || 'Error interno del servidor';
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export const searchUsers = async ({ q = '', limit = 20 } = {}, { signal } = {}) =>
  apiFetch(`/users/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(String(limit))}`, { signal });

export const getPublicProfile = async (userId, { signal } = {}) =>
  apiFetch(`/users/${encodeURIComponent(userId)}/public`, { signal });

export const followUser = async (userId) =>
  apiFetch(`/users/${encodeURIComponent(userId)}/follow`, { method: 'POST' });

export const unfollowUser = async (userId) =>
  apiFetch(`/users/${encodeURIComponent(userId)}/follow`, { method: 'DELETE' });

export const listFollowing = async (userId, { limit = 100, signal } = {}) =>
  apiFetch(`/users/${encodeURIComponent(userId)}/following?limit=${encodeURIComponent(String(limit))}`, { signal });
