import axios from 'axios';
import apiConfig from '../config/apiConfig';

/**
 * Base API client instance configured with our API settings
 * This provides consistent configuration for all API requests
 */
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - cookies will be sent automatically, no need to add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    // No need to manually add Authorization header for cookie-based auth
    // Cookies are sent automatically by the browser
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
