import apiClient from './api';
 
const USER_KEY = 'futureu_user';
// Remove TOKEN_KEY as we're no longer storing tokens in localStorage
 
class AuthService {
  async signin(email, password) {
    try {
      const response = await apiClient.post('/auth/signin', { email, password });
      // Store user data but not the token (token is now in HTTPOnly cookie)
      if (response.data) {
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
   * Clear all user-related data and logout via backend
   * This is critical for security, especially for assessment progress
   */
  async signout() {
    try {
      // Call backend to clear HTTPOnly cookie
      await apiClient.post('/auth/signout');
    } catch (error) {
      console.error('Signout error:', error);
      // Continue with cleanup even if backend call fails
    }
    
    // Clean up all user-specific data to prevent access by next user
    localStorage.removeItem(USER_KEY);
    
    // Remove any other user-specific data that might be in localStorage
    // This is essential to prevent one user from accessing another's assessment progress
    localStorage.removeItem('current_assessment');
    localStorage.removeItem('assessment_progress');
    
    // Redirect to login page
    window.location.href = '/login';
  }
 
  async getCurrentUser() {
    // First try to get from localStorage for performance
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
    
    // If not in localStorage, try to fetch from backend
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data;
      // Store in localStorage for future use
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
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

  // No longer needed as token is in HTTPOnly cookie
  getToken() {
    return null; // Tokens are now in HTTPOnly cookies, not accessible via JS
  }
 
  async isAuthenticated() {
    try {
      // Check if we can get current user info from backend
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
 
  async getUserRole() {
    const user = await this.getCurrentUser();
    const role = user ? user.role : null;
    return role;
  }
}
 
export default new AuthService();