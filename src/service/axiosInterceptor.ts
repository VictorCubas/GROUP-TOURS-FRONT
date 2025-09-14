import axios from 'axios';
import { API_BASE_URL } from './api';
import { useSessionStore, type SessionDataStore } from '@/store/sessionStore';
import { showToastOutsider } from '@/helper/toastService';
import { useNavigationStore } from '@/store/navigationStore';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json', // default
  },
});

// -------------------- INTERCEPTOR DE REQUEST --------------------
axiosInstance.interceptors.request.use(
  (config) => {
    // Normalizar URL: asegurar que termine con "/"
    if (config.url && !config.url.includes('?') && !config.url.endsWith('/')) {
      config.url = `${config.url}/`;
    }

    // Adjuntar token si no es login
    const isLoginRequest = config.url?.includes('login/');
    if (!isLoginRequest) {
      const sessionStorage = localStorage.getItem('session');
      if (sessionStorage) {
        const sessionParsed: SessionDataStore = JSON.parse(sessionStorage);
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${sessionParsed.token}`;
      }
    }

    // --- Ajustar Content-Type solo para el endpoint exacto ---
    console.log(config.url)
    const isPaqueteViajesEndpoint = config.url?.includes('paquete');
    console.log('isPaqueteViajesEndpoint: ', isPaqueteViajesEndpoint)
    if (
      isPaqueteViajesEndpoint &&
      (config.method?.toLowerCase() === 'post'  ||
        config.method?.toLowerCase() === 'put' ||
        config.method?.toLowerCase() === 'patch')
    ) {
      console.log('isPaqueteViajesEndpoint: ', isPaqueteViajesEndpoint) 
      if (config.data instanceof FormData) {
        // Axios detecta FormData y establece multipart/form-data automáticamente

        console.log('isPaqueteViajesEndpoint: ', isPaqueteViajesEndpoint)
        delete config.headers['Content-Type'];
      }
    } else {
      // Default para JSON

      console.log('isPaqueteViajesEndpoint: ', isPaqueteViajesEndpoint)
      config.headers['Content-Type'] = 'application/json'; 
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------- INTERCEPTOR DE RESPONSE --------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error interceptor: ', error);

    if (error.response?.status === 401) {
      const { logout } = useSessionStore.getState();
      const { setRedirect } = useNavigationStore.getState();
      logout();

      showToastOutsider('Sesión expirada. Inicia sesión nuevamente.', 'error');
      setTimeout(() => {
        setRedirect('/login');
      }, 2500);
    } else {
      if (error.response) {
        const backendErrors = error.response.data;
        console.log('Backend Errors: ', backendErrors);

        if (typeof backendErrors === 'string') {
          showToastOutsider(backendErrors, 'error');
        } else if (typeof backendErrors === 'object') {
          const messages = Object.values(backendErrors)
            .flat(Infinity)
            .join('\n');
          showToastOutsider(messages, 'error');
        }
      } else {
        showToastOutsider(error?.message ?? 'Ocurrió algo inesperado', 'error');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
