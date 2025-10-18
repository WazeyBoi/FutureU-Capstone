/**
 * API Configuration
 *
 * This file contains all API-related configuration settings.
 * Centralizing these values makes it easier to change endpoints
 * when moving between environments (development, testing, production).
 */
//  test UYYYYY
// Development API URL (local development)
const DEV_API_URL = 'http://localhost:8080';
 
// Production API URL (deployed backend on AWS EC2)
const PROD_API_URL = 'http://ec2-18-139-117-208.ap-southeast-1.compute.amazonaws.com:8080';
 
// Determine which base URL to use based on environment
const baseURL = import.meta.env.PROD ? PROD_API_URL : DEV_API_URL;
 
// API Configuration
const apiConfig = {
  // Backend server URL - automatically switches between dev and production
  baseURL: process.env.NODE_ENV === 'production'
    ? `${PROD_API_URL}/api`  // Production: AWS EC2 backend
    : `${DEV_API_URL}/api`,  // Development: Local backend
 
  // Request timeout in milliseconds (increased for RDS queries)
  timeout: 120000, // 2 minutes timeout for slower RDS queries
 
  // Always send cookies for authentication
  withCredentials: true,
 
  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
 
export default apiConfig;