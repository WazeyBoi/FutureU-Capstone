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