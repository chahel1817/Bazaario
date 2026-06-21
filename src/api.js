import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8081' : ''),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const hadAuthHeader = !!error.config?.headers?.Authorization;
    const isProtectedAuthFailure = status === 401 || (status === 403 && url.startsWith('/api/cart'));

    if (hadAuthHeader && isProtectedAuthFailure) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('bazaario:auth-expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
