import apiClient from './api';

/**
 * Service for handling testimony-related API requests for admin use
 */
class AdminTestimonyService {
  /**
   * Test if the testimony API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/testimony/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Create a new testimony
   * @param {Object} testimonyData - The testimony data to create
   * @returns {Promise<Object>} - Created testimony data
   */
  async createTestimony(testimonyData) {
    try {
      const response = await apiClient.post('/testimony/postTestimonyRecord', testimonyData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating testimony');
      throw error;
    }
  }

  /**
   * Get all testimonies
   * @returns {Promise<Array>} - List of all testimonies
   */
  async getAllTestimonies() {
    try {
      const response = await apiClient.get('/testimony/getAllTestimonies');
      return response;
    } catch (error) {
      this.handleError(error, 'Fetching all testimonies');
      throw error;
    }
  }

  /**
   * Get testimony by ID
   * @param {number} testimonyId - The testimony ID
   * @returns {Promise<Object>} - The testimony data
   */
  async getTestimonyById(testimonyId) {
    try {
      const response = await apiClient.get(`/testimony/getTestimony/${testimonyId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching testimony with ID ${testimonyId}`);
      throw error;
    }
  }

  /**
   * Get testimonies by school ID
   * @param {number} schoolId - The school ID
   * @returns {Promise<Array>} - List of testimonies for the school
   */
  async getTestimoniesBySchool(schoolId) {
    try {
      const response = await apiClient.get(`/testimony/getTestimoniesBySchool/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching testimonies for school ID ${schoolId}`);
      throw error;
    }
  }

  /**
   * Get testimonies by student ID
   * @param {number} userId - The student ID
   * @returns {Promise<Array>} - List of testimonies for the student
   */
  async getTestimoniesByStudent(userId) {
    try {
      const response = await apiClient.get(`/testimony/getTestimoniesByStudent/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching testimonies for student ID ${userId}`);
      throw error;
    }
  }

  /**
   * Get average rating for a school
   * @param {number} schoolId - The school ID
   * @returns {Promise<Object>} - Average rating data
   */
  async getSchoolAverageRating(schoolId) {
    try {
      const response = await apiClient.get(`/testimony/getSchoolAverageRating/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching average rating for school ID ${schoolId}`);
      throw error;
    }
  }

  /**
   * Get all school ratings
   * @returns {Promise<Object>} - Map of school IDs to rating data
   */
  async getAllSchoolRatings() {
    try {
      const response = await apiClient.get('/testimony/getAllSchoolRatings');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all school ratings');
      throw error;
    }
  }

  /**
   * Update an existing testimony
   * @param {number} testimonyId - The ID of the testimony to update
   * @param {Object} testimonyData - The updated testimony data
   * @returns {Promise<Object>} - Updated testimony data
   */
  async updateTestimony(testimonyId, testimonyData) {
    try {
      const token = localStorage.getItem('authToken'); // Retrieve token from localStorage or another source
      const response = await apiClient.put(
        `/testimony/putTestimonyDetails?testimonyId=${testimonyId}`,
        testimonyData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Use the retrieved token
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `Updating testimony with ID ${testimonyId}`);
      throw error;
    }
  }

  /**
   * Delete a testimony
   * @param {number} testimonyId - The ID of the testimony to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteTestimony(testimonyId) {
    try {
      const response = await apiClient.delete(`/testimony/deleteTestimonyDetails/${testimonyId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting testimony with ID ${testimonyId}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Testimony service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminTestimonyService();