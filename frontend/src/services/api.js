import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (zustand persist)
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        const { accessToken } = state;
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;
    
    // Handle network errors
    if (!response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    // Handle specific error status codes
    switch (response.status) {
      case 401:{
        // Token expired or invalid
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          try {
            const { state } = JSON.parse(authStorage);
            const { refreshToken } = state;
            
            if (refreshToken && !error.config._retry) {
              error.config._retry = true;
              
              try {
                // Try to refresh token
                const refreshResponse = await axios.post(
                  `${api.defaults.baseURL}/auth/refresh`,
                  { refresh_token: refreshToken }
                );
                
                const { access_token, refresh_token } = refreshResponse.data;
                
                // Update storage
                const newAuthData = {
                  ...state,
                  accessToken: access_token,
                  refreshToken: refresh_token,
                };
                localStorage.setItem('auth-storage', JSON.stringify({ state: newAuthData }));
                
                // Retry original request with new token
                error.config.headers.Authorization = `Bearer ${access_token}`;
                return api.request(error.config);
                
              } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
                toast.error('Session expired. Please login again.');
                return Promise.reject(refreshError);
              }
            } else {
              // No refresh token or retry already attempted
              localStorage.removeItem('auth-storage');
              window.location.href = '/login';
              toast.error('Session expired. Please login again.');
            }
          } catch (parseError) {
            console.error('Error parsing auth storage:', parseError);
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
          }
        }
        break
    }
        
      case 403:
        toast.error('Access denied. You don\'t have permission for this action.');
        break;
        
      case 404:
        toast.error('Resource not found.');
        break;
        
      case 422:{
        // Validation errors
        const validationErrors = response.data?.detail || 'Validation failed';
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach(err => {
            toast.error(`${err.loc?.join(' ')}: ${err.msg}`);
          });
        } else {
          toast.error(validationErrors);
        }
        break;
        }
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
        
      case 500:
        toast.error('Server error. Please try again later.');
        break;
        
      case 503:
        toast.error('Service temporarily unavailable. Please try again later.');
        break;
        
      default:{
        const errorMessage = response.data?.detail || 'An unexpected error occurred';
        toast.error(errorMessage)
    }
    }
    
    return Promise.reject(error);
  }
);

export default api;