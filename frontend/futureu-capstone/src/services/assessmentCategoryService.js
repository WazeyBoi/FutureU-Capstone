import apiClient from './api';

/**
 * Service for handling assessment category-related API requests
 */
class AssessmentCategoryService {
  /**
   * Test if the assessment category API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/assessmentcategory/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Create a new assessment category
   * @param {Object} category - The assessment category object to create
   * @returns {Promise<Object>} - Created assessment category data
   */
  async createAssessmentCategory(category) {
    try {
      const response = await apiClient.post('/assessmentcategory/postAssessmentCategory', category);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating assessment category');
      throw error;
    }
  }

  /**
   * Get all assessment categories
   * @returns {Promise<Array>} - List of all assessment categories
   */
  async getAllAssessmentCategories() {
    try {
      const response = await apiClient.get('/assessmentcategory/getAllAssessmentCategories');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all assessment categories');
      throw error;
    }
  }

  /**
   * Get assessment category by ID
   * @param {number} id - The assessment category ID
   * @returns {Promise<Object>} - The assessment category data
   */
  async getAssessmentCategoryById(id) {
    try {
      const response = await apiClient.get(`/assessmentcategory/getAssessmentCategory/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching assessment category with ID ${id}`);
      throw error;
    }
  }

  /**
   * Update an assessment category
   * @param {number} id - The ID of the assessment category to update
   * @param {Object} categoryDetails - The new assessment category details
   * @returns {Promise<Object>} - Updated assessment category data
   */
  async updateAssessmentCategory(id, categoryDetails) {
    try {
      const response = await apiClient.put('/assessmentcategory/putAssessmentCategory', categoryDetails, {
        params: { id }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating assessment category');
      throw error;
    }
  }

  /**
   * Delete an assessment category
   * @param {number} id - The ID of the assessment category to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteAssessmentCategory(id) {
    try {
      const response = await apiClient.delete(`/assessmentcategory/deleteAssessmentCategory/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting assessment category with ID ${id}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Assessment category service error${context ? ' - ' + context : ''}:`, error);
    // You could add additional error handling here (e.g., notifications, logging)
  }
}

export default new AssessmentCategoryService();
