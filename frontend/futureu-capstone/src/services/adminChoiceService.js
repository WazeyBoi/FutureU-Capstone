import apiClient from './api';

/**
 * Service for handling choice-related API requests for admin use
 */
class AdminChoiceService {
  /**
   * Test if the choice API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/choice/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Get all choices
   * @returns {Promise<Array>} - List of all choices
   */
  async getAllChoices() {
    try {
      const response = await apiClient.get('/choice/getAllChoices');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all choices');
      throw error;
    }
  }

  /**
   * Get choice by ID
   * @param {number} choiceId - The choice ID
   * @returns {Promise<Object>} - The choice data
   */
  async getChoiceById(choiceId) {
    try {
      const response = await apiClient.get(`/choice/getChoice/${choiceId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching choice with ID ${choiceId}`);
      throw error;
    }
  }

  /**
   * Get choices for a specific question
   * @param {number} questionId - The question ID
   * @returns {Promise<Array>} - List of choices
   */
  async getChoicesByQuestion(questionId) {
    try {
      const response = await apiClient.get(`/choice/getChoicesByQuestion/${questionId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching choices for question ID ${questionId}`);
      throw error;
    }
  }

  /**
   * Get correct choices for a specific question
   * @param {number} questionId - The question ID
   * @returns {Promise<Array>} - List of correct choices
   */
  async getCorrectChoicesByQuestion(questionId) {
    try {
      const response = await apiClient.get(`/choice/getCorrectChoicesByQuestion/${questionId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching correct choices for question ID ${questionId}`);
      throw error;
    }
  }

  /**
   * Search choices by text
   * @param {string} text - The text to search for
   * @returns {Promise<Array>} - List of matching choices
   */
  async searchChoices(text) {
    try {
      const response = await apiClient.get('/choice/searchChoices', {
        params: { text }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching choices');
      throw error;
    }
  }

  /**
   * Create a new choice
   * @param {Object} choiceData - The choice data to create
   * @returns {Promise<Object>} - Created choice data
   */
  async createChoice(choiceData) {
    try {
      // Wrap the single choice in an array as the backend expects a list
      const response = await apiClient.post('/choice/postChoice', [choiceData]);
      // Return the first item from the response array
      return response.data[0];
    } catch (error) {
      this.handleError(error, 'Creating choice');
      throw error;
    }
  }

  /**
   * Update an existing choice
   * @param {number} choiceId - The ID of the choice to update
   * @param {Object} choiceData - The updated choice data
   * @returns {Promise<Object>} - Updated choice data
   */
  async updateChoice(choiceId, choiceData) {
    try {
      const response = await apiClient.put('/choice/putChoice', choiceData, {
        params: { choiceId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `Updating choice with ID ${choiceId}`);
      throw error;
    }
  }

  /**
   * Delete a choice
   * @param {number} choiceId - The ID of the choice to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteChoice(choiceId) {
    try {
      const response = await apiClient.delete(`/choice/deleteChoice/${choiceId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting choice with ID ${choiceId}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Choice service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminChoiceService();