import apiClient from './api';
 
const USER_KEY = 'futureu_user';
const TOKEN_KEY = 'futureu_token';
 
class AuthService {
  async signin(email, password) {
    try {
      const response = await apiClient.post('/auth/signin', { email, password });
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        const userData = {
          id: response.data.id,
          email: response.data.email,
          role: response.data.role,
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
    // Clean up all user-specific data to prevent access by next user
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Remove any other user-specific data that might be in localStorage
    // This is essential to prevent one user from accessing another's assessment progress
    localStorage.removeItem('current_assessment');
    localStorage.removeItem('assessment_progress');
    
    // Redirect to login page
    window.location.href = '/login';
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
    return localStorage.getItem(TOKEN_KEY);
  }
 
  isAuthenticated() {
    return !!this.getToken();
  }
 
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }
}
 
export default new AuthService();