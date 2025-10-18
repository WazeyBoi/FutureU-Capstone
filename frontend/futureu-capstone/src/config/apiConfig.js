/**
 * API Configuration
 *
 * Centralize API settings so we can safely switch environments and
 * avoid browser mixed-content issues in production.
 *
 * Key design:
 * - Use a relative base path ("/api") by default so both Vite dev and Vercel prod
 *   can proxy requests server-side. This keeps the browser on HTTPS and prevents
 *   mixed-content blocks.
 * - Allow override via Vite env var VITE_API_BASE when needed (e.g., local direct target).
 */

// Prefer Vite env override, otherwise default to relative "/api"
// Examples:
//   VITE_API_BASE=/api                    -> use proxy in dev/prod
//   VITE_API_BASE=https://api.example.com -> direct HTTPS origin
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : '/api';

const apiConfig = {
  // Backend server URL used by axios. Keep it relative to leverage proxy/rewrites.
  baseURL: API_BASE,

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