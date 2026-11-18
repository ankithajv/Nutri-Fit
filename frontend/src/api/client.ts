import axios from 'axios';

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('nutriai_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // If unauthorized and we're not on login/register page, clear token
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register' || window.location.pathname === '/';
      if (!isAuthPage) {
        localStorage.removeItem('nutriai_token');
        localStorage.removeItem('nutriai_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
