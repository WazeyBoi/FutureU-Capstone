import axios from 'axios';
import apiConfig from '../config/apiConfig';

/**
 * Base API client instance configured with our API settings
 * This provides consistent configuration for all API requests
 */
const apiClient = axios.create({
  baseURL: apiConfig.baseURL, // Should be 'http://localhost:8080/api'
  timeout: apiConfig.timeout,
  withCredentials: true, // Always send cookies for authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - no longer needed for token management since we use HTTP-only cookies
// Cookies are automatically sent with requests when withCredentials: true
apiClient.interceptors.request.use(
  (config) => {
    // Debug: Log the full URL being called
    console.log('API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(`${apiConfig.baseURL}/auth/refresh`, {}, {
          withCredentials: true
        });
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed
        console.error('Token refresh failed:', refreshError);

        // Determine if current page is public. If it is, do NOT hard-redirect.
        // This prevents public pages (like landing) from bouncing to /login
        try {
          const currentPath = window.location?.pathname || '/';
          const publicPaths = ['/', '/about-us'];
          const isPublic = publicPaths.some(p => currentPath === p || currentPath.startsWith(p));
          if (!isPublic) {
            window.location.href = '/login';
          }
        } catch (_) {
          // In non-browser contexts, just ignore
        }

        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
