import apiClient from './api';
 
class AuthService {
  async signin(email, password) {
    try {
      const response = await apiClient.post('/auth/signin', { email, password }, {
        withCredentials: true // Enable cookies
      });
      
      // Cookies are automatically set by the server, no need to manually store tokens
      // User info is available in the response for immediate use
      return response.data;
    } catch (error) {
      console.error('Signin error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
 
  async signup(signupData) {
    try {
      const response = await apiClient.post('/auth/signup', signupData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token from cookie
   */
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh', {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  /**
   * Sign out user and clear all cookies
   */
  async signout() {
    // Pre-clear to avoid race with components writing on unmount
    this.clearClientData();

    try {
      await apiClient.post('/auth/signout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Signout error:', error.response ? error.response.data : error.message);
      // Continue with logout even if server request fails
    }
    
    // Post-clear to ensure nothing was re-written by teardown effects
    this.clearClientData();
    
    // Redirect to login page
    window.location.replace('/login');
  }

  /**
   * Clear all client-side data (fallback for any remaining localStorage items)
   */
  clearClientData() {
    // Remove any remaining user-specific data from localStorage
    localStorage.removeItem('current_assessment');
    localStorage.removeItem('assessment_progress');
    localStorage.removeItem('assessment_answers');
    localStorage.removeItem('user_preferences');

    // Remove cached profile data stored per-user
    try {
      const prefixesToClear = [
        'futureu_profile_',
        'futureu_profile_picture_',
        'futureu_profile_picture_blob_',
        'futureu_profile_timestamp_',
        // assessment related
        'assessment_start_time_',
        // recommendations related
        'futureu_recommendations_',
        'futureu_program_recommendations_',
        'futureu_comprehensive_recommendations_'
      ];

      const exactKeysToClear = [
        'admin_dashboard_data',
        'futureu_pending_deletion',
        'futureu_refresh_testimonials',
        'academicExplorerWelcomeSeen',
        'mapbox.eventData.uuid:'
      ];

      // Clear exact keys if present
      exactKeysToClear.forEach((key) => {
        try { localStorage.removeItem(key); } catch {}
      });

      // Clear keys by prefix
      Object.keys(localStorage).forEach((key) => {
        if (prefixesToClear.some((prefix) => key.startsWith(prefix))) {
          try { localStorage.removeItem(key); } catch {}
        }
      });
    } catch (e) {
      console.error('Error clearing localStorage caches:', e);
    }

    // Clear any session-scoped hints/prompts
    try {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('futureu_profile_prompt_shown_')) {
          try { sessionStorage.removeItem(key); } catch {}
        }
      });
    } catch (e) {
      console.error('Error clearing sessionStorage caches:', e);
    }
  }

  /**
   * Get current user info from cookie (non-sensitive data only)
   * This reads from the user info cookie that's accessible to JavaScript
   */
  getCurrentUser() {
    try {
      const userInfoCookie = this.getCookie('futureu_user_info');
      if (userInfoCookie) {
        return JSON.parse(decodeURIComponent(userInfoCookie));
      }
    } catch (error) {
      console.error('Error parsing user info cookie:', error);
    }
    return null;
  }

  /**
   * Get the current user's ID
   * @returns {number|null} - The current user's ID or null if not logged in
   */
  getCurrentUserId() {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * Check if user is authenticated by checking for user info cookie
   * Note: This is not 100% secure as cookies can be manipulated client-side
   * The real authentication check happens server-side with HTTP-only cookies
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }
 
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Get cookie value by name
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value or null if not found
   */
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  /**
   * Set up automatic token refresh
   * This will attempt to refresh the token before it expires
   */
  setupTokenRefresh() {
    // Refresh token every 2.5 hours (before 3-hour expiry)
    const refreshInterval = 2.5 * 60 * 60 * 1000; // 2.5 hours in milliseconds
    
    setInterval(async () => {
      if (this.isAuthenticated()) {
        try {
          await this.refreshToken();
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, user needs to log in again
          this.signout();
        }
      }
    }, refreshInterval);
  }
}
 
export default new AuthService();