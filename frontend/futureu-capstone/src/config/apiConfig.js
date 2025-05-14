/**
 * API Configuration
 * 
 * This file contains all API-related configuration settings.
 * Centralizing these values makes it easier to change endpoints
 * when moving between environments (development, testing, production).
 */

// Development API URL (used when not using the proxy)
const DEV_API_URL = 'http://localhost:8080';

// Production API URL (change this when deploying to production)
const PROD_API_URL = 'https://api.yourproductiondomain.com';

// Determine which base URL to use based on environment
const baseURL = import.meta.env.PROD ? PROD_API_URL : '/api';

export default {
  baseURL,
  timeout: 30000, // Request timeout in milliseconds
  withCredentials: true, // Whether to send cookies with requests
};
