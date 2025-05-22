import apiClient from './api';

/**
 * Service for handling quiz sub-category related API requests for admin use
 */
class AdminQuizSubCatService {
  /**
   * Test if the quiz sub-category API is working
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
   * @param {Object} quizSubCategoryData - The quiz sub-category data to create
   * @returns {Promise<Object>} - Created quiz sub-category data
   */
  async createQuizSubCategory(quizSubCategoryData) {
    try {
      const response = await apiClient.post('/quizSubCategoryCategory/postQuizSubCategory', quizSubCategoryData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating quiz sub-category');
      throw error;
    }
  }

  /**
   * Update an existing quiz sub-category
   * @param {number} id - The ID of the quiz sub-category to update
   * @param {Object} quizSubCategoryData - The updated quiz sub-category data
   * @returns {Promise<Object>} - Updated quiz sub-category data
   */
  async updateQuizSubCategory(id, quizSubCategoryData) {
    try {
      const response = await apiClient.put(`/quizSubCategoryCategory/putQuizSubCategory?id=${id}`, quizSubCategoryData);
      return response.data;
    } catch (error) {
      this.handleError(error, `Updating quiz sub-category with ID ${id}`);
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
   * Get quiz sub-categories by assessment sub-category ID
   * @param {number} assessmentSubCategoryId - The assessment sub-category ID
   * @returns {Promise<Array>} - List of quiz sub-categories
   */
  async getQuizSubCategoriesBySubCategory(assessmentSubCategoryId) {
    try {
      // Check if there's a direct endpoint for this
      try {
        const response = await apiClient.get(`/quizSubCategoryCategory/getByAssessmentSubCategory/${assessmentSubCategoryId}`);
        return response.data;
      } catch (directError) {
        console.log('No direct endpoint for filtering quiz sub-categories, using client-side filtering');
        
        // Fallback to client-side filtering
        const allResponse = await this.getAllQuizSubCategories();
        if (Array.isArray(allResponse)) {
          // Filter on the client side
          return allResponse.filter(quizSubCat => {
            // Check both possible property names (with different spellings)
            return (
              (quizSubCat.assessmentSubCategory?.assessmentSubCategoryId === assessmentSubCategoryId) ||
              (quizSubCat.assesssmentSubCategory?.assessmentSubCategoryId === assessmentSubCategoryId)
            );
          });
        }
        return [];
      }
    } catch (error) {
      this.handleError(error, `Fetching quiz sub-categories for assessment sub-category ID ${assessmentSubCategoryId}`);
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
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminQuizSubCatService();