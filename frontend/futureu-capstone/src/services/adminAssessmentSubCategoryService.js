import apiClient from './api';

/**
 * Service for handling assessment sub-category related API requests for admin use
 */
class AdminAssessmentSubCategoryService {
  /**
   * Test if the assessment sub-category API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/assessmentsubcategory/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Get all assessment sub-categories
   * @returns {Promise<Array>} - List of all sub-categories
   */
  async getAllAssessmentSubCategories() {
    try {
      const response = await apiClient.get('/assessmentsubcategory/getAllAssessmentSubCategories');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all assessment sub-categories');
      throw error;
    }
  }

  /**
   * Get assessment sub-category by ID
   * @param {number} id - The sub-category ID
   * @returns {Promise<Object>} - The sub-category data
   */
  async getAssessmentSubCategoryById(id) {
    try {
      const response = await apiClient.get(`/assessmentsubcategory/getAssessmentSubCategory/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching assessment sub-category with ID ${id}`);
      throw error;
    }
  }

  /**
   * Get sub-categories by category ID
   * @param {number} categoryId - The parent category ID
   * @returns {Promise<Array>} - List of sub-categories
   */
  async getAssessmentSubCategoriesByCategory(categoryId) {
    try {
      const response = await apiClient.get(`/assessmentsubcategory/getAssessmentSubCategoriesByCategory/${categoryId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching sub-categories for category ID ${categoryId}`);
      throw error;
    }
  }

  /**
   * Create a new assessment sub-category
   * @param {Object} subCategoryData - The sub-category data to create
   * @returns {Promise<Object>} - Created sub-category data
   */
  async createAssessmentSubCategory(subCategoryData) {
    try {
      const response = await apiClient.post('/assessmentsubcategory/postAssessmentSubCategory', subCategoryData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating assessment sub-category');
      throw error;
    }
  }

  /**
   * Update an existing assessment sub-category
   * @param {number} id - The ID of the sub-category to update
   * @param {Object} subCategoryData - The updated sub-category data
   * @returns {Promise<Object>} - Updated sub-category data
   */
  async updateAssessmentSubCategory(id, subCategoryData) {
    try {
      const response = await apiClient.put(`/assessmentsubcategory/putAssessmentSubCategory?id=${id}`, subCategoryData);
      return response.data;
    } catch (error) {
      this.handleError(error, `Updating assessment sub-category with ID ${id}`);
      throw error;
    }
  }

  /**
   * Delete an assessment sub-category
   * @param {number} id - The ID of the sub-category to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteAssessmentSubCategory(id) {
    try {
      const response = await apiClient.delete(`/assessmentsubcategory/deleteAssessmentSubCategory/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting assessment sub-category with ID ${id}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Assessment sub-category service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminAssessmentSubCategoryService();