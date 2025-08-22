import apiClient from './api';

class AuthService {
  async signin(email, password) {
    try {
      const response = await apiClient.post('/auth/signin', { email, password });
      // Token is now stored in HTTPOnly cookie, no need to store in localStorage
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
   * Sign out user by calling backend to clear HTTPOnly cookies
   * This also clears any remaining localStorage data for cleanup
   */
  async signout() {
    try {
      // Call backend to clear HTTPOnly cookies
      await apiClient.post('/auth/signout');
    } catch (error) {
      console.warn('Signout API call failed:', error.message);
      // Continue with cleanup even if API call fails
    }
    
    // Clean up any remaining localStorage data for legacy support
    localStorage.removeItem('futureu_token');
    localStorage.removeItem('futureu_user');
    localStorage.removeItem('current_assessment');
    localStorage.removeItem('assessment_progress');
    
    // Redirect to login page
    window.location.href = '/login';
  }

  /**
   * Get current user data from server instead of localStorage
   */
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      // User is not authenticated or session expired
      return null;
    }
  }

  /**
   * Get the current user's ID
   * @returns {number|null} - The current user's ID or null if not logged in
   */
  async getCurrentUserId() {
    const user = await this.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * Check if user is authenticated by calling server
   * Since tokens are in HTTPOnly cookies, we can't check locally
   */
  async isAuthenticated() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user role from server
   */
  async getUserRole() {
    const user = await this.getCurrentUser();
    return user ? user.role : null;
  }

  // Legacy methods for backward compatibility during transition
  // These will be removed after all components are updated
  getToken() {
    console.warn('getToken() is deprecated - tokens are now in HTTPOnly cookies');
    return null;
  }
}
 
export default new AuthService();