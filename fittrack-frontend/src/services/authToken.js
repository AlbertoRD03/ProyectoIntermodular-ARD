export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return (
    window.localStorage.getItem('fittrack_token') ||
    window.localStorage.getItem('authToken') ||
    ''
  );
}

