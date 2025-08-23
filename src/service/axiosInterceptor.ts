import axios from 'axios';
import { API_BASE_URL } from './api';
import { useSessionStore, type SessionDataStore } from '@/store/sessionStore';
import { showToastOutsider } from '@/helper/toastService';
import { useNavigationStore } from '@/store/navigationStore';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adjuntar token
axiosInstance.interceptors.request.use(
  (config) => {
    // Normalizar URL: asegurar que termine con /
    if (config.url && !config.url.includes('?') && !config.url.endsWith("/")) {
      config.url = `${config.url}/`;
    }

    // No agregar token si es login
    const isLoginRequest = config.url?.includes("login/");
    if (!isLoginRequest) {
      const sessionStorage = localStorage.getItem('session');
      if (sessionStorage) {
        const sessionParsed: SessionDataStore = JSON.parse(sessionStorage);
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${sessionParsed.token}`;
      }
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
      if (error.response) {
        // Accedemos a lo que devuelve el backend
        const backendErrors = error.response.data;
        console.log('backendErrors: ', backendErrors);

        if (typeof backendErrors === 'string') {
          // Si es solo un string, lo mostramos directo
          showToastOutsider(backendErrors, 'error');
        } else if (typeof backendErrors === 'object') {
          // Si es un objeto con campos y mensajes
          console.log('mostrando errores....')

          const messages = Object.values(backendErrors)
            .flat() // aplanar en caso de arrays
            .join('\n'); // unir con saltos de línea

            console.log(messages)
          showToastOutsider(messages, 'error');
        }
      } else {
        // Si no hay respuesta del servidor
        showToastOutsider(error?.message ?? 'Ocurrió algo inesperado', 'error');
      }
      // showToastOutsider(error?.message ?? 'Ocurrió algo inesperado', 'error');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
