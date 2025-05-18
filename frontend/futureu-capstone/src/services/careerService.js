import apiClient from './api';

/**
 * Service for handling career-related API requests
 */
class CareerService {
  /**
   * Get all careers
   * @returns {Promise<Array>} - List of all careers
   */
  async getAllCareers() {
    try {
      const response = await apiClient.get('/career/getAllCareers');
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
   * @param {Object} careerData - The career object to create
   * @returns {Promise<Object>} - Created career data
   */
  async createCareer(careerData) {
    try {
      const response = await apiClient.post('/career/postCareerRecord', careerData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating career');
      throw error;
    }
  }

  /**
   * Update a career
   * @param {number} careerId - The ID of the career to update
   * @param {Object} careerData - The new career details
   * @returns {Promise<Object>} - Updated career data
   */
  async updateCareer(careerId, careerData) {
    try {
      const response = await apiClient.put(`/career/putCareerDetails?careerId=${careerId}`, careerData);
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
   * @param {number} programId
   * @returns {Promise<Array>}
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
   * @param {string} title
   * @returns {Promise<Array>}
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
   * @param {string} industry
   * @returns {Promise<Array>}
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
   * @param {string} jobTrend
   * @returns {Promise<Array>}
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
   * @param {number} minSalary
   * @param {number} maxSalary
   * @returns {Promise<Array>}
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
  }
}

export default new CareerService();