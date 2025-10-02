import apiClient from '../api';
import dataCacheService from '../dataCache';

/**
 * Service for handling accreditation-related API requests for admin use
 */
class AdminAccreditationService {
  /**
   * Test if the accreditation API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/accreditation/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Create a new accreditation
   * @param {Object} accreditationData - The accreditation data to create
   * @returns {Promise<Object>} - Created accreditation data
   */
  async createAccreditation(accreditationData) {
    try {
      const response = await apiClient.post('/accreditation/postAccreditationRecord', accreditationData);
      
      // Clear related caches
      dataCacheService.clear('accreditationData');
      dataCacheService.clear('schoolPrograms');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating accreditation');
      throw error;
    }
  }

  /**
   * Get all accreditations
   * @returns {Promise<Array>} - List of all accreditations
   */
  async getAllAccreditations() {
    try {
      const response = await apiClient.get('/accreditation/getAllAccreditations');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all accreditations');
      throw error;
    }
  }

  /**
   * Get accreditation by ID
   * @param {number} accredId - The accreditation ID
   * @returns {Promise<Object>} - The accreditation data
   */
  async getAccreditationById(accredId) {
    try {
      const response = await apiClient.get(`/accreditation/getAccreditation/${accredId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching accreditation with ID ${accredId}`);
      throw error;
    }
  }

  /**
   * Get accreditations by school ID
   * @param {number} schoolId - The school ID
   * @returns {Promise<Array>} - List of accreditations for the school
   */
  async getAccreditationsBySchool(schoolId) {
    try {
      const response = await apiClient.get(`/accreditation/getAccreditationsBySchool/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching accreditations for school ID ${schoolId}`);
      throw error;
    }
  }

  /**
   * Assign an accreditation to school program(s)
   * @param {number} accredId - The accreditation ID
   * @param {number} schoolId - The school ID
   * @param {number} [programId] - Optional program ID (if null, assigns to all programs of the school)
   * @returns {Promise<string>} - Success message
   */
  async assignAccreditationToPrograms(accredId, schoolId, programId = null) {
    try {
      const params = { accredId, schoolId };
      if (programId) {
        params.programId = programId;
      }
      
      const response = await apiClient.post('/accreditation/assignToSchoolPrograms', null, { params });
      
      // Clear related caches
      dataCacheService.clear('accreditationData');
      dataCacheService.clear('schoolPrograms');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Assigning accreditation to programs');
      throw error;
    }
  }

  /**
   * Search accreditations by title
   * @param {string} title - The title to search for
   * @returns {Promise<Array>} - List of matching accreditations
   */
  async searchAccreditations(title) {
    try {
      const response = await apiClient.get('/accreditation/searchAccreditations', {
        params: { title }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching accreditations');
      throw error;
    }
  }

  /**
   * Update an accreditation
   * @param {number} accredId - The ID of the accreditation to update
   * @param {Object} accreditationData - The new accreditation details
   * @returns {Promise<Object>} - Updated accreditation data
   */
  async updateAccreditation(accredId, accreditationData) {
    try {
      const response = await apiClient.put(`/accreditation/putAccreditationDetails?accredId=${accredId}`, accreditationData);
      
      // Clear related caches
      dataCacheService.clear('accreditationData');
      dataCacheService.clear('schoolPrograms');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating accreditation');
      throw error;
    }
  }

  /**
   * Delete an accreditation
   * @param {number} accredId - The ID of the accreditation to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteAccreditation(accredId) {
    try {
      const response = await apiClient.delete(`/accreditation/deleteAccreditationDetails/${accredId}`);
      
      // Clear related caches
      dataCacheService.clear('accreditationData');
      dataCacheService.clear('schoolPrograms');
      
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting accreditation with ID ${accredId}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Admin accreditation service error${context ? ' - ' + context : ''}:`, error);
  }
}

export default new AdminAccreditationService();


