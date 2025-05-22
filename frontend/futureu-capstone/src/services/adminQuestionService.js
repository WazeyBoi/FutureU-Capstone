import apiClient from './api';

/**
 * Service for handling question-related API requests for admin use
 */
class AdminQuestionService {
  /**
   * Test if the question API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/question/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Get all questions
   * @returns {Promise<Array>} - List of all questions
   */
  async getAllQuestions() {
    try {
      const response = await apiClient.get('/question/getAllQuestions');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all questions');
      throw error;
    }
  }

  /**
   * Get all questions with complete category and subcategory information
   * This method ensures that all relations are properly populated
   * @returns {Promise<Array>} - List of all questions with complete data
   */
  async getAllQuestionsEnriched() {
    try {
      // First get all questions
      const questions = await this.getAllQuestions();
      const adminCategoryService = await import('./adminAssessmentCategoryService').then(m => m.default);
      const adminSubCategoryService = await import('./adminAssessmentSubCategoryService').then(m => m.default);
      const adminQuizSubCatService = await import('./adminQuizSubCatService').then(m => m.default);
      
      // Fetch all categories, subcategories, and quiz subcategories
      const [categories, subCategories, quizSubCategories] = await Promise.all([
        adminCategoryService.getAllAssessmentCategories(),
        adminSubCategoryService.getAllAssessmentSubCategories(),
        adminQuizSubCatService.getAllQuizSubCategories()
      ]);
      
      // Map them by ID for quick lookup
      const categoryMap = Object.fromEntries(categories.map(cat => [cat.assessmentCategoryId, cat]));
      const subCategoryMap = Object.fromEntries(subCategories.map(subCat => [subCat.assessmentSubCategoryId, subCat]));
      const quizSubCategoryMap = Object.fromEntries(quizSubCategories.map(quizSubCat => [quizSubCat.quizSubCategoryCategoryId, quizSubCat]));
      
      // Enrich each question with full category objects
      return questions.map(question => {
        const enriched = {...question};
        
        // Check if category ID exists but the full object is missing
        if (question.assessmentCategory?.assessmentCategoryId && !question.assessmentCategory?.categoryName) {
          const categoryId = question.assessmentCategory.assessmentCategoryId;
          enriched.assessmentCategory = categoryMap[categoryId] || question.assessmentCategory;
        }
        
        // Same for sub-category
        if (question.assessmentSubCategory?.assessmentSubCategoryId && !question.assessmentSubCategory?.subCategoryName) {
          const subCategoryId = question.assessmentSubCategory.assessmentSubCategoryId;
          enriched.assessmentSubCategory = subCategoryMap[subCategoryId] || question.assessmentSubCategory;
        }
        
        // And for quiz sub-category
        if (question.quizSubCategoryCategory?.quizSubCategoryCategoryId && !question.quizSubCategoryCategory?.quizSubCategoryCategoryName) {
          const quizSubCategoryId = question.quizSubCategoryCategory.quizSubCategoryCategoryId;
          enriched.quizSubCategoryCategory = quizSubCategoryMap[quizSubCategoryId] || question.quizSubCategoryCategory;
        }
        
        return enriched;
      });
    } catch (error) {
      this.handleError(error, 'Fetching enriched questions');
      throw error;
    }
  }

  /**
   * Get question by ID
   * @param {number} questionId - The question ID
   * @returns {Promise<Object>} - The question data
   */
  async getQuestionById(questionId) {
    try {
      const response = await apiClient.get(`/question/getQuestion/${questionId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching question with ID ${questionId}`);
      throw error;
    }
  }

  /**
   * Get questions by assessment category
   * @param {number} categoryId - The assessment category ID
   * @returns {Promise<Array>} - List of questions in the category
   */
  async getQuestionsByAssessmentCategory(categoryId) {
    try {
      const response = await apiClient.get(`/question/getQuestionsByAssessmentCategory/${categoryId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching questions for category ID ${categoryId}`);
      throw error;
    }
  }

  /**
   * Create a new question
   * @param {Object} questionData - The question data to create
   * @returns {Promise<Object>} - Created question data
   */
  async createQuestion(questionData) {
    try {
      const response = await apiClient.post('/question/postQuestion', questionData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating question');
      throw error;
    }
  }

  /**
   * Update an existing question
   * @param {number} questionId - The ID of the question to update
   * @param {Object} questionData - The updated question data
   * @returns {Promise<Object>} - Updated question data
   */
  async updateQuestion(questionId, questionData) {
    try {
      const response = await apiClient.put('/question/putQuestion', questionData, {
        params: { questionId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `Updating question with ID ${questionId}`);
      throw error;
    }
  }

  /**
   * Delete a question
   * @param {number} questionId - The ID of the question to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteQuestion(questionId) {
    try {
      const response = await apiClient.delete(`/question/deleteQuestion/${questionId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting question with ID ${questionId}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Question service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminQuestionService();