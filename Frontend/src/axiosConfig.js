import axios from 'axios';

// Configurar base URL según el entorno
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // En Vercel, las funciones están en /api
  : 'http://localhost:5000';  // En desarrollo local

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Axios Request:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: !!token
      });
    }
    
    const protectedRoutes = [
      '/propiedades',
      '/api/auth/register',
      '/api/auth/me',
      '/api/auth/logout'
    ];
    if (token && config.url) {
      const requiresAuth = protectedRoutes.some(route => 
        config.url.includes(route) && 
        (config.method?.toUpperCase() !== 'GET' || config.url.includes('/api/auth/'))
      );
      
      if (requiresAuth) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Token agregado a petición');
        }
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de petición:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Respuesta exitosa:', {
        url: response.config.url,
        status: response.status
      });
    }
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          console.warn('⚠️ Token expirado o inválido');
          localStorage.removeItem('token');
          if (!window.location.pathname.includes('/login')) {
            window.location.reload();
          }
          break;
          
        case 403:
          console.error('❌ Acceso denegado');
          break;
          
        case 404:
          console.error('❌ Recurso no encontrado');
          break;
          
        case 500:
          console.error('❌ Error interno del servidor');
          break;
          
        default:
          console.error(`❌ Error HTTP ${response.status}:`, response.data?.message || error.message);
      }
    } else if (error.request) {
      console.error('❌ Error de red:', error.message);
    } else {
      console.error('❌ Error de configuración:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export const apiRequest = async (config) => {
  try {
    const response = await axios(config);
    return { data: response.data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error.response?.data?.message || error.message 
    };
  }
};

export default axios;
