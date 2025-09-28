import apiClient from './api';

/**
 * Service for handling career interest profile API requests
 */
class CareerInterestProfileService {
  
  /**
   * Test if the career interest profile API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/career-interest-profile/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing Career Interest Profile API');
      throw error;
    }
  }

  /**
   * Create a new career interest profile for a user
   * @param {number} userId - The user ID
   * @param {Object} profileData - The profile data
   * @returns {Promise<Object>} - Created profile data
   */
  async createProfile(userId, profileData) {
    try {
      const response = await apiClient.post(`/career-interest-profile/create/${userId}`, profileData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating career interest profile');
      throw error;
    }
  }

  /**
   * Get all profiles
   * @returns {Promise<Array>} - List of all profiles
   */
  async getAllProfiles() {
    try {
      const response = await apiClient.get('/career-interest-profile/getAll');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all profiles');
      throw error;
    }
  }

  /**
   * Get profile by ID
   * @param {number} profileId - The profile ID
   * @returns {Promise<Object>} - The profile data
   */
  async getProfileById(profileId) {
    try {
      const response = await apiClient.get(`/career-interest-profile/get/${profileId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching profile by ID');
      throw error;
    }
  }

  /**
   * Get profiles by user ID
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - User's profiles
   */
  async getProfilesByUser(userId) {
    try {
      const response = await apiClient.get(`/career-interest-profile/user/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching profiles by user');
      throw error;
    }
  }

  /**
   * Get active profiles by user ID
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - User's active profiles
   */
  async getActiveProfilesByUser(userId) {
    try {
      const response = await apiClient.get(`/career-interest-profile/user/${userId}/active`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching active profiles by user');
      throw error;
    }
  }

  /**
   * Get most recent active profile by user ID
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} - User's most recent active profile
   */
  async getMostRecentProfile(userId) {
    try {
      const response = await apiClient.get(`/career-interest-profile/user/${userId}/latest`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching most recent profile');
      throw error;
    }
  }

  /**
   * Update an existing profile
   * @param {Object} profileData - The updated profile data
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await apiClient.put('/career-interest-profile/update', profileData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating profile');
      throw error;
    }
  }

  /**
   * Deactivate a profile (soft delete)
   * @param {number} profileId - The profile ID
   * @returns {Promise<Object>} - Response message
   */
  async deactivateProfile(profileId) {
    try {
      const response = await apiClient.put(`/career-interest-profile/deactivate/${profileId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Deactivating profile');
      throw error;
    }
  }

  /**
   * Delete a profile permanently (hard delete)
   * @param {number} profileId - The profile ID
   * @returns {Promise<Object>} - Response message
   */
  async deleteProfile(profileId) {
    try {
      const response = await apiClient.delete(`/career-interest-profile/delete/${profileId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Deleting profile');
      throw error;
    }
  }

  /**
   * Search profiles by dream career
   * @param {string} keyword - The search keyword
   * @returns {Promise<Array>} - Matching profiles
   */
  async searchByDreamCareer(keyword) {
    try {
      const response = await apiClient.get(`/career-interest-profile/search/dream-career?keyword=${keyword}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching by dream career');
      throw error;
    }
  }

  /**
   * Search profiles by interests
   * @param {string} keyword - The search keyword
   * @returns {Promise<Array>} - Matching profiles
   */
  async searchByInterests(keyword) {
    try {
      const response = await apiClient.get(`/career-interest-profile/search/interests?keyword=${keyword}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching by interests');
      throw error;
    }
  }

  /**
   * Get total active profiles statistics
   * @returns {Promise<Object>} - Statistics data
   */
  async getTotalActiveProfiles() {
    try {
      const response = await apiClient.get('/career-interest-profile/stats/total-active');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching total active profiles');
      throw error;
    }
  }

  /**
   * Get total profiles by user statistics
   * @param {number} userId - The user ID
   * @returns {Promise<Object>} - Statistics data
   */
  async getTotalProfilesByUser(userId) {
    try {
      const response = await apiClient.get(`/career-interest-profile/stats/user/${userId}/total`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching total profiles by user');
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - The error object
   * @param {string} operation - The operation being performed
   */
  handleError(error, operation) {
    console.error(`Error during ${operation}:`, error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

export default new CareerInterestProfileService();