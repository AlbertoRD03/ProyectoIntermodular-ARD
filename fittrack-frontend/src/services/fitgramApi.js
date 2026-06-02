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

export const getFeed = async ({ limit = 60 } = {}) =>
  apiFetch(`/fitgram/feed?limit=${encodeURIComponent(String(limit))}`);

export const getExplore = async ({ limit = 60 } = {}) =>
  apiFetch(`/fitgram/explore?limit=${encodeURIComponent(String(limit))}`);

export const getUserPosts = async (userId, { limit = 60, signal } = {}) =>
  apiFetch(`/fitgram/users/${encodeURIComponent(userId)}/posts?limit=${encodeURIComponent(String(limit))}`, { signal });

export const createPost = async ({ image_url, caption, tags, type, workoutSnapshot }) =>
  apiFetch('/fitgram/posts', { method: 'POST', body: { image_url, caption, tags, type, workoutSnapshot } });

export const updatePost = async (postId, { caption, tags }) =>
  apiFetch(`/fitgram/posts/${encodeURIComponent(postId)}`, { method: 'PATCH', body: { caption, tags } });

export const deletePost = async (postId) =>
  apiFetch(`/fitgram/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' });

export const addComment = async (postId, { text }) =>
  apiFetch(`/fitgram/posts/${encodeURIComponent(postId)}/comments`, { method: 'POST', body: { text } });

export const copyWorkoutPost = async (postId) =>
  apiFetch(`/fitgram/posts/${encodeURIComponent(postId)}/copy-workout`, { method: 'POST' });
