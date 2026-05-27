const inferLocalApiBase = () => {
  if (typeof window === 'undefined') return null;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3001/api';
  return null;
};

export const API_BASE =
  process.env.REACT_APP_API_BASE ||
  inferLocalApiBase() ||
  'https://proyectointermodular-ard-1.onrender.com/api';

console.log('API_BASE:', API_BASE);
