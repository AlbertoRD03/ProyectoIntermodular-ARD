const STORAGE_KEY = 'fittrack_privacy_settings_v1';

export function readPrivacySettings() {
  if (typeof window === 'undefined') {
    return { hideWeight: false, hidePhysicalProfile: false, analyticsOptOut: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      hideWeight: Boolean(parsed?.hideWeight),
      hidePhysicalProfile: Boolean(parsed?.hidePhysicalProfile),
      analyticsOptOut: Boolean(parsed?.analyticsOptOut),
    };
  } catch {
    return { hideWeight: false, hidePhysicalProfile: false, analyticsOptOut: false };
  }
}

export function subscribePrivacySettings(onChange) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => {
    if (e?.key && e.key !== STORAGE_KEY) return;
    onChange(readPrivacySettings());
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

