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

// API Configuration
const apiConfig = {
  // Backend server URL - change this if your backend runs on a different port
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com/api'  // Replace with your production API URL
    : 'http://localhost:8080/api',          // Development API URL
  
  // Request timeout in milliseconds
  timeout: 30000,
  
  // Always send cookies for authentication
  withCredentials: true,
  
  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export default apiConfig;
