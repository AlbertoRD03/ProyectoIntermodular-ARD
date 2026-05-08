const STORAGE_KEY = 'fittrack_sessions_v1';

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getDateKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getSessions() {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const data = raw ? safeJsonParse(raw, []) : [];
  return Array.isArray(data) ? data : [];
}

export function saveSessions(next) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(next) ? next : []));
}

export function upsertSession(session) {
  const sessions = getSessions();
  const id = String(session?.id || '');
  if (!id) return sessions;
  const next = sessions.some((s) => String(s?.id) === id)
    ? sessions.map((s) => (String(s?.id) === id ? { ...s, ...session } : s))
    : [session, ...sessions];
  saveSessions(next);
  return next;
}

export function getSessionById(id) {
  const sessions = getSessions();
  return sessions.find((s) => String(s?.id) === String(id)) || null;
}

export function getSessionForDate(dateKey) {
  const sessions = getSessions();
  return sessions.find((s) => String(s?.dateKey) === String(dateKey)) || null;
}

export function getSessionsForDate(dateKey) {
  const sessions = getSessions();
  return sessions
    .filter((s) => String(s?.dateKey) === String(dateKey))
    .sort((a, b) => {
      const ta = Number(a?.createdAt) || 0;
      const tb = Number(b?.createdAt) || 0;
      return tb - ta;
    });
}
