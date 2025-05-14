import apiClient from './api';

/**
 * Service for handling assessment-related API requests
 */
class AssessmentService {
  /**
   * Test if the assessment API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/assessment/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Create a new assessment
   * @param {Object} assessment - The assessment object to create
   * @returns {Promise<Object>} - Created assessment data
   */
  async createAssessment(assessment) {
    try {
      const response = await apiClient.post('/assessment/postAssessmentRecord', assessment);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating assessment');
      throw error;
    }
  }

  /**
   * Get all assessments
   * @returns {Promise<Array>} - List of all assessments
   */
  async getAllAssessments() {
    try {
      const response = await apiClient.get('/assessment/getAllAssessments');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all assessments');
      throw error;
    }
  }

  /**
   * Get assessment by ID
   * @param {number} id - The assessment ID
   * @returns {Promise<Object>} - The assessment data
   */
  async getAssessmentById(id) {
    try {
      const response = await apiClient.get(`/assessment/getAssessment/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching assessment with ID ${id}`);
      throw error;
    }
  }

  /**
   * Search assessments by title
   * @param {string} title - The title to search for
   * @returns {Promise<Array>} - List of matching assessments
   */
  async searchAssessments(title) {
    try {
      const response = await apiClient.get('/assessment/searchAssessments', { params: { title } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching assessments');
      throw error;
    }
  }

  /**
   * Filter assessments by type
   * @param {string} type - The type to filter by
   * @returns {Promise<Array>} - List of filtered assessments
   */
  async filterByType(type) {
    try {
      const response = await apiClient.get('/assessment/filterByType', { params: { type } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering assessments by type');
      throw error;
    }
  }

  /**
   * Filter assessments by status
   * @param {string} status - The status to filter by
   * @returns {Promise<Array>} - List of filtered assessments
   */
  async filterByStatus(status) {
    try {
      const response = await apiClient.get('/assessment/filterByStatus', { params: { status } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering assessments by status');
      throw error;
    }
  }

  /**
   * Update an assessment
   * @param {number} assessmentId - The ID of the assessment to update
   * @param {Object} assessmentDetails - The new assessment details
   * @returns {Promise<Object>} - Updated assessment data
   */
  async updateAssessment(assessmentId, assessmentDetails) {
    try {
      const response = await apiClient.put('/assessment/putAssessmentDetails', assessmentDetails, {
        params: { assessmentId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating assessment');
      throw error;
    }
  }

  /**
   * Delete an assessment
   * @param {number} id - The ID of the assessment to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteAssessment(id) {
    try {
      const response = await apiClient.delete(`/assessment/deleteAssessment/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting assessment with ID ${id}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Assessment service error${context ? ' - ' + context : ''}:`, error);
    // You could add additional error handling here (e.g., notifications, logging)
  }
}

export default new AssessmentService();
