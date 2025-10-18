/**
 * API Configuration
 * 
 * This file contains all API-related configuration settings.
 * Centralizing these values makes it easier to change endpoints
 * when moving between environments (development, testing, production).
 * 
 * For Vercel deployment:
 * - Set VITE_API_URL environment variable to your EC2 backend URL
 * - Example: VITE_API_URL = http://ec2-18-139-117-208.ap-southeast-1.compute.amazonaws.com:8080/api
 */

// Development API URL (used when not using the proxy)
const DEV_API_URL = 'http://localhost:8080';

// Production API URL (will be overridden by VITE_API_URL environment variable)
const PROD_API_URL = 'https://api.yourproductiondomain.com';

// Determine which base URL to use based on environment
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API_URL : '/api');

// API Configuration
const apiConfig = {
  // Backend server URL - uses environment variables for production, localhost for development
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  
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
