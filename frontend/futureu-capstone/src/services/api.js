import axios from 'axios';
import apiConfig from '../config/apiConfig';

/**
 * Base API client instance configured with our API settings
 * This provides consistent configuration for all API requests
 */
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
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
    // No need to manually add tokens - they're in HTTP-only cookies
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
        // Refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
