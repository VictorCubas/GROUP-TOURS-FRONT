import axios from 'axios';
import { API_BASE_URL } from './api';
import type { SessionDataStore } from '@/store/sessionStore';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adjuntar token
axiosInstance.interceptors.request.use(
  (config) => {
    const sessionStorage = localStorage.getItem('session');
    if (sessionStorage) {
      const sessionParsed: SessionDataStore = JSON.parse(sessionStorage);
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${sessionParsed.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para errores (como 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('error: ', error);
    if (error.response?.status === 401) {
      // window.location.href = '/login'; // Redirección al login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
