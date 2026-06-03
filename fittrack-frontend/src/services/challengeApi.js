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
    const err = new Error(data?.message || 'Error interno del servidor');
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

export const listChallenges = ({ status } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const qs = params.toString();
  return apiFetch(`/challenges${qs ? `?${qs}` : ''}`);
};

export const createChallenge = (payload) =>
  apiFetch('/challenges', { method: 'POST', body: payload });

export const updateChallengeStatus = (challengeId, status) =>
  apiFetch(`/challenges/${encodeURIComponent(challengeId)}/status`, { method: 'PATCH', body: { status } });
