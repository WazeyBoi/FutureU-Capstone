import apiClient from '../api';

/**
 * Service for handling career-program-related API requests for admin use
 */
class AdminCareerProgramService {
  /**
   * Test if the career-program API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/careerprogram/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Get all career-program associations
   * @returns {Promise<Array>} - List of all career-program associations
   */
  async getAllAssociations() {
    try {
      const response = await apiClient.get('/careerprogram/getAllAssociations');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all career-program associations');
      throw error;
    }
  }

  /**
   * Get programs by career ID
   * @param {number} careerId - The career ID
   * @returns {Promise<Array>} - List of programs associated with the career
   */
  async getProgramsByCareer(careerId) {
    try {
      const response = await apiClient.get(`/careerprogram/getProgramsByCareer/${careerId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching programs for career ID ${careerId}`);
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
      const response = await apiClient.get(`/careerprogram/getCareersByProgram/${programId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching careers for program ID ${programId}`);
      throw error;
    }
  }

  /**
   * Create a new career-program association
   * @param {number} careerId - The career ID
   * @param {number} programId - The program ID
   * @returns {Promise<Object>} - The created association
   */
  async createAssociation(careerId, programId) {
    try {
      const response = await apiClient.post('/careerprogram/associate', null, {
        params: { careerId, programId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating career-program association');
      throw error;
    }
  }

  /**
   * Delete a career-program association
   * @param {number} careerId - The career ID
   * @param {number} programId - The program ID
   * @returns {Promise<string>} - Success message
   */
  async deleteAssociation(careerId, programId) {
    try {
      const response = await apiClient.delete('/careerprogram/deleteAssociation', {
        params: { careerId, programId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Deleting career-program association');
      throw error;
    }
  }

  /**
   * Check if an association exists
   * @param {number} careerId - The career ID
   * @param {number} programId - The program ID
   * @returns {Promise<boolean>} - Whether the association exists
   */
  async associationExists(careerId, programId) {
    try {
      const associations = await this.getAllAssociations();
      return associations.some(assoc => 
        assoc.career?.careerId === careerId && 
        assoc.program?.programId === programId
      );
    } catch (error) {
      this.handleError(error, 'Checking association existence');
      throw error;
    }
  }

  /**
   * Get association statistics
   * @returns {Promise<Object>} - Statistics about associations
   */
  async getAssociationStats() {
    try {
      const associations = await this.getAllAssociations();
      const careers = [...new Set(associations.map(a => a.career?.careerId))].filter(Boolean);
      const programs = [...new Set(associations.map(a => a.program?.programId))].filter(Boolean);
      
      return {
        totalAssociations: associations.length,
        uniqueCareers: careers.length,
        uniquePrograms: programs.length,
        averageAssociationsPerCareer: careers.length > 0 ? associations.length / careers.length : 0,
        averageAssociationsPerProgram: programs.length > 0 ? associations.length / programs.length : 0
      };
    } catch (error) {
      this.handleError(error, 'Getting association statistics');
      throw error;
    }
  }

  /**
   * Bulk create associations
   * @param {Array} associations - Array of {careerId, programId} objects
   * @returns {Promise<Array>} - Results of bulk creation
   */
  async bulkCreateAssociations(associations) {
    try {
      const results = await Promise.allSettled(
        associations.map(({ careerId, programId }) => 
          this.createAssociation(careerId, programId)
        )
      );
      
      return {
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
        total: associations.length,
        results
      };
    } catch (error) {
      this.handleError(error, 'Bulk creating associations');
      throw error;
    }
  }

  /**
   * Handle errors from API requests
   * @param {Error} error - The error object
   * @param {string} operation - The operation that failed
   */
  handleError(error, operation) {
    console.error(`Error during ${operation}:`, error);
    
    if (error.response) {
      // Server responded with error status
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened
      console.error('Error details:', error.message);
    }
  }
}

// Export singleton instance
const adminCareerProgramService = new AdminCareerProgramService();
export default adminCareerProgramService;