import apiClient from './api';

/**
 * Service for handling assessment category-related API requests for admin use
 */
class AdminAssessmentCategoryService {
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
   * Create a new assessment category
   * @param {Object} categoryData - The assessment category data to create
   * @returns {Promise<Object>} - Created assessment category data
   */
  async createAssessmentCategory(categoryData) {
    try {
      const response = await apiClient.post('/assessmentcategory/postAssessmentCategory', categoryData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating assessment category');
      throw error;
    }
  }

  /**
   * Update an existing assessment category
   * @param {number} categoryId - The ID of the assessment category to update
   * @param {Object} categoryData - The updated assessment category data
   * @returns {Promise<Object>} - Updated assessment category data
   */
  async updateAssessmentCategory(categoryId, categoryData) {
    try {
      const response = await apiClient.put(`/assessmentcategory/putAssessmentCategory?id=${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      this.handleError(error, `Updating assessment category with ID ${categoryId}`);
      throw error;
    }
  }

  /**
   * Delete an assessment category
   * @param {number} categoryId - The ID of the assessment category to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteAssessmentCategory(categoryId) {
    try {
      const response = await apiClient.delete(`/assessmentcategory/deleteAssessmentCategory/${categoryId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting assessment category with ID ${categoryId}`);
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
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminAssessmentCategoryService();