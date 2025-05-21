import apiClient from './api';

/**
 * Service for handling user-related API requests for admin use
 */
class AdminUserService {
  /**
   * Test if the user API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/user/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - The user data to create
   * @returns {Promise<Object>} - Created user data
   */
  async createUser(userData) {
    try {
      const response = await apiClient.post('/user/postUserRecord', userData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating user');
      throw error;
    }
  }

  /**
   * Get all users
   * @returns {Promise<Array>} - List of all users
   */
  async getAllUsers() {
    try {
      const response = await apiClient.get('/user/getAllUsers');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all users');
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} - The user data
   */
  async getUserById(userId) {
    try {
      const response = await apiClient.get(`/user/getUser/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user with ID ${userId}`);
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - The user email
   * @returns {Promise<Object>} - The user data
   */
  async getUserByEmail(email) {
    try {
      const response = await apiClient.get('/user/getUserByEmail', {
        params: { email }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user with email ${email}`);
      throw error;
    }
  }

  /**
   * Update an existing user
   * @param {number} userId - The ID of the user to update
   * @param {Object} userData - The updated user data
   * @returns {Promise<Object>} - Updated user data
   */
  async updateUser(userId, userData) {
    try {
      const response = await apiClient.put('/user/putUserDetails', userData, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating user');
      throw error;
    }
  }

  /**
   * Delete a user
   * @param {number} userId - The ID of the user to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteUser(userId) {
    try {
      const response = await apiClient.delete(`/user/deleteUserDetails/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting user with ID ${userId}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`User service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminUserService();