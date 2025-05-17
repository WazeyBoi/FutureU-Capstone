import apiClient from './api';

/**
 * Accreditation Service
 * Handles all API requests related to accreditations
 */

/**
 * Test if the accreditation API is working
 * @returns {Promise} Promise with test response
 */
export const testAccreditationApi = () => {
  return apiClient.get('/accreditation/test');
};

/**
 * Get all accreditations
 * @returns {Promise} Promise with all accreditations data
 */
export const getAllAccreditations = () => {
  return apiClient.get('/accreditation/getAllAccreditations');
};

/**
 * Get accreditation by ID
 * @param {number} accredId - The ID of the accreditation
 * @returns {Promise} Promise with accreditation data
 */
export const getAccreditationById = (accredId) => {
  return apiClient.get(`/accreditation/getAccreditation/${accredId}`);
};

/**
 * Get accreditations for a specific school
 * @param {number} schoolId - The ID of the school
 * @returns {Promise} Promise with filtered accreditations data
 */
export const getAccreditationsBySchool = (schoolId) => {
  return apiClient.get(`/accreditation/getAccreditationsBySchool/${schoolId}`);
};

/**
 * Search accreditations by title
 * @param {string} title - The title to search for
 * @returns {Promise} Promise with matching accreditations
 */
export const searchAccreditations = (title) => {
  return apiClient.get(`/accreditation/searchAccreditations?title=${title}`);
};

/**
 * Create a new accreditation
 * @param {Object} accreditationData - The accreditation data to submit
 * @returns {Promise} Promise with the created accreditation data
 */
export const createAccreditation = (accreditationData) => {
  return apiClient.post('/accreditation/postAccreditationRecord', accreditationData);
};

/**
 * Update an existing accreditation
 * @param {number} accredId - The ID of the accreditation to update
 * @param {Object} accreditationData - The updated accreditation data
 * @returns {Promise} Promise with the updated accreditation data
 */
export const updateAccreditation = (accredId, accreditationData) => {
  return apiClient.put(`/accreditation/putAccreditationDetails?accredId=${accredId}`, accreditationData);
};

/**
 * Delete an accreditation
 * @param {number} accredId - The ID of the accreditation to delete
 * @returns {Promise} Promise with the deletion status
 */
export const deleteAccreditation = (accredId) => {
  return apiClient.delete(`/accreditation/deleteAccreditationDetails/${accredId}`);
};

/**
 * Service for handling accreditation-related API requests
 */
class AccreditationService {
  /**
   * Get all accreditation data for schools and programs
   * @returns {Promise<Array>} - List of schools with accreditation data
   */
  async getAllAccreditationData() {
    try {
      const response = await apiClient.get('/accreditation/getAllData');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all accreditation data');
      throw error;
    }
  }

  /**
   * Get accreditation data for a specific school
   * @param {number} schoolId - The school ID
   * @returns {Promise<Object>} - School accreditation data
   */
  async getSchoolAccreditationData(schoolId) {
    try {
      const response = await apiClient.get(`/accreditation/school/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching accreditation data for school ID ${schoolId}`);
      throw error;
    }
  }

  /**
   * Get all programs with COE recognition
   * @returns {Promise<Array>} - List of COE programs
   */
  async getCOEPrograms() {
    try {
      const response = await apiClient.get('/accreditation/programs/coe');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching COE programs');
      throw error;
    }
  }

  /**
   * Get all programs with COD recognition
   * @returns {Promise<Array>} - List of COD programs
   */
  async getCODPrograms() {
    try {
      const response = await apiClient.get('/accreditation/programs/cod');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching COD programs');
      throw error;
    }
  }

  /**
   * Search programs by name
   * @param {string} query - Search query string
   * @returns {Promise<Array>} - List of matching programs
   */
  async searchPrograms(query) {
    try {
      const response = await apiClient.get('/accreditation/programs/search', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching programs');
      throw error;
    }
  }

  /**
   * Filter programs by criteria
   * @param {Object} filters - Filter criteria
   * @param {string} [filters.programType] - Program type
   * @param {number} [filters.accreditationLevel] - Accreditation level
   * @param {string} [filters.recognition] - Recognition status
   * @returns {Promise<Array>} - List of filtered programs
   */
  async filterPrograms(filters) {
    try {
      const response = await apiClient.get('/accreditation/programs/filter', {
        params: filters
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering programs');
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Accreditation service error${context ? ' - ' + context : ''}:`, error);
    // You could add additional error handling here (e.g., notifications, logging)
  }
}

export default new AccreditationService(); 