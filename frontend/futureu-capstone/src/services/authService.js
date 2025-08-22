import apiClient from './api';
 
const USER_KEY = 'futureu_user';
const TOKEN_KEY = 'futureu_token';
 
class AuthService {
  async signin(email, password) {
    try {
      const response = await apiClient.post('/auth/signin', { email, password });
      if (response.data.token) {
        // Store user data only (not the token, as it's now in HttpOnly cookie)
        const userData = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role,
          firstName: response.data.firstName || 'Admin'
        };
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
      console.error('Signin error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
 
  async signup(signupData) {
    try {
      const response = await apiClient.post('/auth/signup', signupData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }


  /**
   * Clear all user-related data from local storage
   * This is critical for security, especially for assessment progress
   */

  signout() {
    // Clean up all user-specific data from local storage
    localStorage.removeItem(USER_KEY);
    
    // Remove any other user-specific data that might be in localStorage
    // This is essential to prevent one user from accessing another's assessment progress
    localStorage.removeItem('current_assessment');
    localStorage.removeItem('assessment_progress');
    
    // Call backend signout to clear HttpOnly cookie
    apiClient.post('/auth/signout').then(() => {
      // Redirect to login page
      window.location.href = '/login';
    }).catch((error) => {
      console.error('Signout error:', error);
      // Even if the request fails, still redirect to login
      window.location.href = '/login';
    });
  }
 
  getCurrentUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
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

  getToken() {
    // Tokens are now stored in HttpOnly cookies, not accessible to JavaScript
    // This method is kept for backward compatibility but returns null
    return null;
  }
 
  isAuthenticated() {
    // Since JWT is now in HttpOnly cookie, we need to check authentication status via API
    // For now, check if user data exists as a basic indicator
    // This should be enhanced with a server-side check
    return !!this.getCurrentUser();
  }

  /**
   * Check authentication status with the server
   * @returns {Promise<boolean>} - True if authenticated, false otherwise
   */
  async checkAuthenticationStatus() {
    try {
      const response = await apiClient.get('/auth/status');
      return response.status === 200;
    } catch {
      // Error indicates not authenticated
      return false;
    }
  }
 
  getUserRole() {
    const user = this.getCurrentUser();
    const role = user ? user.role : null;
    return role;
  }
}
 
export default new AuthService();