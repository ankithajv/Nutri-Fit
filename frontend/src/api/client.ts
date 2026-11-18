import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
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
