import apiClient from './api';

/**
 * Service for handling program-career path association API requests
 */
class ProgramCareerPathService {
  /**
   * Get all associations
   * @returns {Promise<Array>}
   */
  async getAllAssociations() {
    try {
      const response = await apiClient.get('/program-career-path/getAllAssociations');
      return response.data;
    } catch (error) {
      this.handleError(error, 'fetching all program-career path associations');
      throw error;
    }
  }

  /**
   * Get career paths by program ID
   * @param {number} programId
   * @returns {Promise<Array>}
   */
  async getCareerPathsByProgram(programId) {
    try {
      const response = await apiClient.get(`/program-career-path/getCareerPathsByProgram/${programId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `fetching career paths for program ${programId}`);
      return [];
    }
  }

  /**
   * Get programs by career path ID
   * @param {number} careerPathId
   * @returns {Promise<Array>}
   */
  async getProgramsByCareerPath(careerPathId) {
    try {
      const response = await apiClient.get(`/program-career-path/getProgramsByCareerPath/${careerPathId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `fetching programs for career path ${careerPathId}`);
      return [];
    }
  }

  /**
   * Associate program with career path
   * @param {number} programId
   * @param {number} careerPathId
   * @returns {Promise<Object>}
   */
  async associateProgramWithCareerPath(programId, careerPathId) {
    try {
      const response = await apiClient.post('/program-career-path/associate', null, {
        params: { programId, careerPathId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'creating program-career path association');
      throw error;
    }
  }

  /**
   * Delete association
   * @param {number} programId
   * @param {number} careerPathId
   * @returns {Promise<Object>}
   */
  async deleteAssociation(programId, careerPathId) {
    try {
      const response = await apiClient.delete('/program-career-path/deleteAssociation', {
        params: { programId, careerPathId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'deleting program-career path association');
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error
   * @param {string} context
   */
  handleError(error, context = '') {
    console.error(`ProgramCareerPath service error${context ? ' - ' + context : ''}:`, error);
  }
}

export default new ProgramCareerPathService();