import axios from 'axios';
import { API_BASE_URL } from './api';
import { useSessionStore, type SessionDataStore } from '@/store/sessionStore';
import { showToastOutsider } from '@/helper/toastService';
import { useNavigationStore } from '@/store/navigationStore';

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

// const navigate = useNavigate();
// Interceptor para errores (como 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('error interceptor: ', error);
    if (error.response?.status === 401) {
       const { logout } = useSessionStore.getState();
       const { setRedirect } = useNavigationStore.getState();
      logout();

      showToastOutsider('Sesión expirada. Inicia sesión nuevamente.', 'error');
      setTimeout(() => {
        setRedirect('/login');
      }, 2500);
    }
    else{
      showToastOutsider(error?.message ?? 'Ocurrió algo inesperado', 'error');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
