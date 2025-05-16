import apiClient from './api';

/**
 * Service for handling user assessment-related API requests
 */
class UserAssessmentService {
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
   * @returns {Promise<Array>} - List of user assessments
   */
  async getUserAssessmentsByUser(userId) {
    try {
      const response = await apiClient.get(`/userassessment/getUserAssessmentsByUser/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user assessments for user ID ${userId}`);
      throw error;
    }
  }

  /**
   * Get user assessments by assessment ID
   * @param {number} assessmentId - The assessment ID
   * @returns {Promise<Array>} - List of user assessments
   */
  async getUserAssessmentsByAssessment(assessmentId) {
    try {
      const response = await apiClient.get(`/userassessment/getUserAssessmentsByAssessment/${assessmentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user assessments for assessment ID ${assessmentId}`);
      throw error;
    }
  }

  /**
   * Save assessment progress
   * @param {Object} progressData - Progress data to save
   * @returns {Promise<Object>} - Saved progress response
   */
  async saveProgress(progressData) {
    try {
      const response = await apiClient.post('/assessment-progress/save', progressData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Saving assessment progress');
      throw error;
    }
  }

  /**
   * Get in-progress assessments for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - List of in-progress assessments
   */
  async getInProgressAssessments(userId) {
    try {
      const response = await apiClient.get(`/assessment-progress/in-progress/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching in-progress assessments');
      throw error;
    }
  }

  /**
   * Create a new user assessment
   * @param {Object} userAssessment - The user assessment to create
   * @returns {Promise<Object>} - Created user assessment data
   */
  async createUserAssessment(userAssessment) {
    try {
      const response = await apiClient.post('/userassessment/postUserAssessmentRecord', userAssessment);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating user assessment');
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
  }
}

export default new UserAssessmentService();
