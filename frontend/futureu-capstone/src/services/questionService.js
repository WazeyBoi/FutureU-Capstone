import apiClient from './api';

/**
 * Service for handling question-related API requests
 */
class QuestionService {
  /**
   * Create a new question
   * @param {Object} question - The question object to create
   * @returns {Promise<Object>} - Created question data
   */
  async createQuestion(question) {
    try {
      const response = await apiClient.post('/question/postQuestion', question);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating question');
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
   * Get questions by assessment category ID
   * @param {number} assessmentCategoryId - The assessment category ID
   * @returns {Promise<Array>} - List of questions
   */
  async getQuestionsByAssessmentCategory(assessmentCategoryId) {
    try {
      const response = await apiClient.get(`/question/getQuestionsByAssessmentCategory/${assessmentCategoryId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching questions for assessment category ID ${assessmentCategoryId}`);
      throw error;
    }
  }

  /**
   * Update a question
   * @param {number} questionId - The ID of the question to update
   * @param {Object} questionDetails - The new question details
   * @returns {Promise<Object>} - Updated question data
   */
  async updateQuestion(questionId, questionDetails) {
    try {
      const response = await apiClient.put('/question/putQuestion', questionDetails, {
        params: { questionId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating question');
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
  }
}

export default new QuestionService();
