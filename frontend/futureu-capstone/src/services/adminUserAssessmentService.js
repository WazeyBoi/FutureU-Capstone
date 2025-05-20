import apiClient from './api';

/**
 * Service for handling user assessment-related API requests for admin use
 */
class AdminUserAssessmentService {
  /**
   * Test if the user assessment API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/userassessment/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Get all user assessments
   * @returns {Promise<Array>} - List of all user assessments
   */
  async getAllUserAssessments() {
    try {
      const response = await apiClient.get('/userassessment/getAllUserAssessments');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all user assessments');
      throw error;
    }
  }

  /**
   * Get user assessment by ID
   * @param {number} id - The user assessment ID
   * @returns {Promise<Object>} - The user assessment data
   */
  async getUserAssessmentById(id) {
    try {
      const response = await apiClient.get(`/userassessment/getUserAssessment/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user assessment with ID ${id}`);
      throw error;
    }
  }

  /**
   * Get user assessments by user ID
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - List of user assessments for the user
   */
  async getUserAssessmentsByUser(userId) {
    try {
      const response = await apiClient.get(`/userassessment/getUserAssessmentsByUser/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user assessments for user ${userId}`);
      throw error;
    }
  }

  /**
   * Get user assessments by assessment ID
   * @param {number} assessmentId - The assessment ID
   * @returns {Promise<Array>} - List of user assessments for the assessment
   */
  async getUserAssessmentsByAssessment(assessmentId) {
    try {
      const response = await apiClient.get(`/userassessment/getUserAssessmentsByAssessment/${assessmentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user assessments for assessment ${assessmentId}`);
      throw error;
    }
  }

  /**
   * Create a new user assessment
   * @param {Object} userAssessmentData - The user assessment data to create
   * @returns {Promise<Object>} - Created user assessment data
   */
  async createUserAssessment(userAssessmentData) {
    try {
      const response = await apiClient.post('/userassessment/postUserAssessmentRecord', userAssessmentData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating user assessment');
      throw error;
    }
  }

  /**
   * Update an existing user assessment
   * @param {number} id - The ID of the user assessment to update
   * @param {Object} userAssessmentData - The updated user assessment data
   * @returns {Promise<Object>} - Updated user assessment data
   */
  async updateUserAssessment(id, userAssessmentData) {
    try {
      const response = await apiClient.put(`/userassessment/putUserAssessmentDetails?id=${id}`, userAssessmentData);
      return response.data;
    } catch (error) {
      this.handleError(error, `Updating user assessment with ID ${id}`);
      throw error;
    }
  }

  /**
   * Delete a user assessment
   * @param {number} id - The ID of the user assessment to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteUserAssessment(id) {
    try {
      const response = await apiClient.delete(`/userassessment/deleteUserAssessment/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting user assessment with ID ${id}`);
      throw error;
    }
  }

  /**
   * Submit a completed assessment
   * @param {Object} submissionData - The completed assessment data
   * @returns {Promise<Object>} - Submission result
   */
  async submitCompletedAssessment(submissionData) {
    try {
      const response = await apiClient.post('/userassessment/submit-completed', submissionData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Submitting completed assessment');
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`User assessment service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminUserAssessmentService();