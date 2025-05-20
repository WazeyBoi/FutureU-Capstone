import apiClient from './api';

/**
 * Service for handling program-related API requests for admin use
 */
class AdminProgramService {
  /**
   * Test if the program API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/program/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Create a new program
   * @param {Object} programData - The program data to create
   * @returns {Promise<Object>} - Created program data
   */
  async createProgram(programData) {
    try {
      const response = await apiClient.post('/program/postProgramRecord', programData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating program');
      throw error;
    }
  }

  /**
   * Get all programs
   * @returns {Promise<Array>} - List of all programs
   */
  async getAllPrograms() {
    try {
      const response = await apiClient.get('/program/getAllPrograms');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all programs');
      throw error;
    }
  }

  /**
   * Get program by ID
   * @param {number} programId - The program ID
   * @returns {Promise<Object>} - The program data
   */
  async getProgramById(programId) {
    try {
      const response = await apiClient.get(`/program/getProgram/${programId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching program with ID ${programId}`);
      throw error;
    }
  }

  /**
   * Search programs by name
   * @param {string} name - The name to search for
   * @returns {Promise<Array>} - List of matching programs
   */
  async searchPrograms(name) {
    try {
      const response = await apiClient.get('/program/searchPrograms', {
        params: { name }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching programs');
      throw error;
    }
  }

  /**
   * Update an existing program
   * @param {number} programId - The ID of the program to update
   * @param {Object} programData - The updated program data
   * @returns {Promise<Object>} - Updated program data
   */
  async updateProgram(programId, programData) {
    try {
      const response = await apiClient.put('/program/putProgramDetails', programData, {
        params: { programId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating program');
      throw error;
    }
  }

  /**
   * Delete a program
   * @param {number} programId - The ID of the program to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteProgram(programId) {
    try {
      const response = await apiClient.delete(`/program/deleteProgramDetails/${programId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting program with ID ${programId}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Program service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminProgramService();