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
    try {
      await apiClient.post('/auth/signout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Signout error:', error.response ? error.response.data : error.message);
      // Continue with logout even if server request fails
    }
    
    // Clear any remaining client-side data
    this.clearClientData();
    
    // Redirect to login page
    window.location.href = '/login';
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