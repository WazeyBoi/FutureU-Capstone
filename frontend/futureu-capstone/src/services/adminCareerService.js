import apiClient from './api';

/**
 * Service for handling career-related API requests for admin use
 */
class AdminCareerService {
  /**
   * Test if the career API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/career/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Get all careers
   * @returns {Promise<Array>} - List of all careers
   */
  async getAllCareers() {
    try {
      const response = await apiClient.get('/career/getAllCareers');
      console.log('API response for getAllCareers:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all careers');
      throw error;
    }
  }

  /**
   * Get career by ID
   * @param {number} careerId - The career ID
   * @returns {Promise<Object>} - The career data
   */
  async getCareerById(careerId) {
    try {
      const response = await apiClient.get(`/career/getCareer/${careerId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching career with ID ${careerId}`);
      throw error;
    }
  }

  /**
   * Create a new career
   * @param {Object} careerData - The career data to create
   * @param {number} programId - Optional program ID to associate with the career
   * @returns {Promise<Object>} - Created career data
   */
  async createCareer(careerData, programId = null) {
    try {
      // Create a CareerDTO object that matches the backend structure
      const careerDTO = {
        career: careerData,
        programId: programId
      };
      
      // Manually stringify the data and set the content type
      const response = await apiClient.post(
        '/career/postCareerRecord', 
        JSON.stringify(careerDTO), 
        {
          headers: {
            'Content-Type': 'application/json'
          },
          transformRequest: [(data) => data] // Prevent Axios from transforming the already stringified data
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating career');
      throw error;
    }
  }

  /**
   * Update an existing career
   * @param {number} careerId - The ID of the career to update
   * @param {Object} careerData - The updated career data
   * @param {number} programId - Optional program ID to associate with the career
   * @returns {Promise<Object>} - Updated career data
   */
  async updateCareer(careerId, careerData, programId = null) {
    try {
      // Create a CareerDTO object that matches the backend structure
      const careerDTO = {
        career: careerData,
        programId: programId
      };
      
      // Manually stringify the data and set the content type
      const response = await apiClient.put(
        `/career/putCareerDetails?careerId=${careerId}`, 
        JSON.stringify(careerDTO), 
        {
          headers: {
            'Content-Type': 'application/json'
          },
          transformRequest: [(data) => data] // Prevent Axios from transforming the already stringified data
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating career');
      throw error;
    }
  }

  /**
   * Delete a career
   * @param {number} careerId - The ID of the career to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteCareer(careerId) {
    try {
      const response = await apiClient.delete(`/career/deleteCareerDetails/${careerId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting career with ID ${careerId}`);
      throw error;
    }
  }

  /**
   * Get careers by program ID
   * @param {number} programId - The program ID
   * @returns {Promise<Array>} - List of careers associated with the program
   */
  async getCareersByProgram(programId) {
    try {
      const response = await apiClient.get(`/career/getCareersByProgram/${programId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching careers for program ID ${programId}`);
      throw error;
    }
  }

  /**
   * Search careers by title
   * @param {string} title - The title to search for
   * @returns {Promise<Array>} - List of matching careers
   */
  async searchCareers(title) {
    try {
      const response = await apiClient.get('/career/searchCareers', { params: { title } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching careers');
      throw error;
    }
  }

  /**
   * Filter careers by industry
   * @param {string} industry - The industry to filter by
   * @returns {Promise<Array>} - List of matching careers
   */
  async filterByIndustry(industry) {
    try {
      const response = await apiClient.get('/career/filterByIndustry', { params: { industry } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering by industry');
      throw error;
    }
  }

  /**
   * Filter careers by job trend
   * @param {string} jobTrend - The job trend to filter by
   * @returns {Promise<Array>} - List of matching careers
   */
  async filterByJobTrend(jobTrend) {
    try {
      const response = await apiClient.get('/career/filterByJobTrend', { params: { jobTrend } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering by job trend');
      throw error;
    }
  }

  /**
   * Filter careers by salary range
   * @param {number} minSalary - Minimum salary
   * @param {number} maxSalary - Maximum salary
   * @returns {Promise<Array>} - List of matching careers
   */
  async filterBySalaryRange(minSalary, maxSalary) {
    try {
      const response = await apiClient.get('/career/filterBySalaryRange', { params: { minSalary, maxSalary } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering by salary range');
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Career service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminCareerService();