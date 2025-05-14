import apiClient from './api';

/**
 * Service for handling quiz sub-category-category related API requests
 */
class QuizSubCategoryCategoryService {
  /**
   * Test if the quiz sub-category-category API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/quizSubCategoryCategory/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Get all quiz sub-categories
   * @returns {Promise<Array>} - List of all quiz sub-categories
   */
  async getAllQuizSubCategories() {
    try {
      const response = await apiClient.get('/quizSubCategoryCategory/getAllQuizSubCategories');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all quiz sub-categories');
      throw error;
    }
  }

  /**
   * Get quiz sub-category by ID
   * @param {number} id - The quiz sub-category ID
   * @returns {Promise<Object>} - The quiz sub-category data
   */
  async getQuizSubCategoryById(id) {
    try {
      const response = await apiClient.get(`/quizSubCategoryCategory/getQuizSubCategory/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching quiz sub-category with ID ${id}`);
      throw error;
    }
  }

  /**
   * Search quiz sub-categories by name
   * @param {string} name - The name to search for
   * @returns {Promise<Array>} - List of matching quiz sub-categories
   */
  async searchQuizSubCategories(name) {
    try {
      const response = await apiClient.get('/quizSubCategoryCategory/searchQuizSubCategories', {
        params: { name }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching quiz sub-categories');
      throw error;
    }
  }

  /**
   * Create a new quiz sub-category
   * @param {Object} quizSubCategory - The quiz sub-category object to create
   * @returns {Promise<Object>} - Created quiz sub-category data
   */
  async createQuizSubCategory(quizSubCategory) {
    try {
      const response = await apiClient.post('/quizSubCategoryCategory/postQuizSubCategory', quizSubCategory);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating quiz sub-category');
      throw error;
    }
  }

  /**
   * Update a quiz sub-category
   * @param {number} id - The ID of the quiz sub-category to update
   * @param {Object} quizSubCategoryDetails - The new quiz sub-category details
   * @returns {Promise<Object>} - Updated quiz sub-category data
   */
  async updateQuizSubCategory(id, quizSubCategoryDetails) {
    try {
      const response = await apiClient.put('/quizSubCategoryCategory/putQuizSubCategory', quizSubCategoryDetails, {
        params: { id }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating quiz sub-category');
      throw error;
    }
  }

  /**
   * Delete a quiz sub-category
   * @param {number} id - The ID of the quiz sub-category to delete
   * @returns {Promise<void>} - Empty response on success
   */
  async deleteQuizSubCategory(id) {
    try {
      const response = await apiClient.delete(`/quizSubCategoryCategory/deleteQuizSubCategory/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting quiz sub-category with ID ${id}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Quiz sub-category service error${context ? ' - ' + context : ''}:`, error);
  }
}

export default new QuizSubCategoryCategoryService();
