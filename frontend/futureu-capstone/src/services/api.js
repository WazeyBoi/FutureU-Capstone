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

export default apiClient;
