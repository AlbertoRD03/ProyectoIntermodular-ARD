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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.message || 'Error interno del servidor');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const listNotifications = ({ limit = 50, unread = false } = {}, options = {}) => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (unread) params.set('unread', 'true');
  return apiFetch(`/notifications?${params.toString()}`, options);
};

export const markNotificationRead = (notificationId) =>
  apiFetch(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = () =>
  apiFetch('/notifications/read-all', { method: 'PATCH' });
