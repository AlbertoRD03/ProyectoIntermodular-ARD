import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { API_BASE } from '../config/apiBase';
import { getAuthToken } from '../services/authToken';

const PUBLIC_PREFIXES = [
  '/login',
  '/register',
  '/password-recovery',
  '/reset-password',
  '/terms',
  '/privacy',
];

const isPublicPath = (pathname) =>
  PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

const readStoredUser = () => {
  try {
    const raw = window.localStorage.getItem('fittrack_user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const isOnboardingCompleted = (user) => {
  if (!user) return false;
  return Boolean(
    user?.onboarding_completado ||
      user?.onboardingCompleted ||
      user?.onboardingCompletado ||
      user?.onboarding_completed
  );
};

export default function OnboardingEnforcer() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastCheckedPathRef = useRef('');
  const inFlightRef = useRef(false);

  useEffect(() => {
    const pathname = location?.pathname || '';
    const token = getAuthToken();

    if (!token) return;
    if (!pathname) return;
    if (pathname === '/physical-data') return;
    if (isPublicPath(pathname)) return;

    const storedUser = readStoredUser();
    if (isOnboardingCompleted(storedUser)) return;

    if (inFlightRef.current) return;
    if (lastCheckedPathRef.current === pathname) return;

    lastCheckedPathRef.current = pathname;
    inFlightRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 401) {
            window.localStorage.removeItem('fittrack_token');
            window.localStorage.removeItem('authToken');
            window.localStorage.removeItem('fittrack_user');
            navigate('/login', { replace: true });
            return;
          }
          // In doubt, don't hard-block the user if the profile check fails.
          return;
        }

        const user = data?.user || data?.data?.user || null;
        if (user) window.localStorage.setItem('fittrack_user', JSON.stringify(user));

        if (!isOnboardingCompleted(user)) {
          navigate('/physical-data', { replace: true, state: { from: pathname } });
        }
      } finally {
        inFlightRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location?.pathname, navigate]);

  return null;
}

