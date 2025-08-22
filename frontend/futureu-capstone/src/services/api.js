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

// Request interceptor - cookies are sent automatically, no need to add Authorization header
apiClient.interceptors.request.use(
  (config) => {
    // HTTPOnly cookies are sent automatically by the browser
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
