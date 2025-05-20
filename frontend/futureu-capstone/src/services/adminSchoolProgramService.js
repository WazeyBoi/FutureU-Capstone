import apiClient from './api';

/**
 * Service for handling school program-related API requests for admin use
 */
class AdminSchoolProgramService {
  /**
   * Test if the school program API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/schoolprogram/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Create a new school program
   * @param {Object} schoolProgramData - The school program data to create
   * @returns {Promise<Object>} - Created school program data
   */
  async createSchoolProgram(schoolProgramData) {
    try {
      const response = await apiClient.post('/schoolprogram/postSchoolProgramRecord', schoolProgramData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating school program');
      throw error;
    }
  }

  /**
   * Get all school programs
   * @returns {Promise<Array>} - List of all school programs
   */
  async getAllSchoolPrograms() {
    try {
      const response = await apiClient.get('/schoolprogram/getAllSchoolPrograms');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all school programs');
      throw error;
    }
  }

  /**
   * Get school program by ID
   * @param {number} schoolProgramId - The school program ID
   * @returns {Promise<Object>} - The school program data
   */
  async getSchoolProgramById(schoolProgramId) {
    try {
      const response = await apiClient.get(`/schoolprogram/getSchoolProgram/${schoolProgramId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching school program with ID ${schoolProgramId}`);
      throw error;
    }
  }

  /**
   * Get school programs by school ID
   * @param {number} schoolId - The school ID
   * @returns {Promise<Array>} - List of school programs for the school
   */
  async getSchoolProgramsBySchool(schoolId) {
    try {
      const response = await apiClient.get(`/schoolprogram/getSchoolProgramsBySchool/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching school programs for school ID ${schoolId}`);
      throw error;
    }
  }
  
  /**
   * Get school programs by program ID
   * @param {number} programId - The program ID
   * @returns {Promise<Array>} - List of school programs for the program
   */
  async getSchoolProgramsByProgram(programId) {
    try {
      const response = await apiClient.get(`/schoolprogram/getSchoolProgramsByProgram/${programId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching school programs for program ID ${programId}`);
      throw error;
    }
  }
  
  /**
   * Get school programs by accreditation ID
   * @param {number} accredId - The accreditation ID
   * @returns {Promise<Array>} - List of school programs for the accreditation
   */
  async getSchoolProgramsByAccreditation(accredId) {
    try {
      const response = await apiClient.get(`/schoolprogram/getSchoolProgramsByAccreditation/${accredId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching school programs for accreditation ID ${accredId}`);
      throw error;
    }
  }
  
  /**
   * Get school program by school ID and program ID
   * @param {number} schoolId - The school ID
   * @param {number} programId - The program ID
   * @returns {Promise<Object>} - The school program data
   */
  async getSchoolProgramBySchoolAndProgram(schoolId, programId) {
    try {
      const response = await apiClient.get('/schoolprogram/getSchoolProgramBySchoolAndProgram', {
        params: { schoolId, programId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching school program for school ID ${schoolId} and program ID ${programId}`);
      throw error;
    }
  }

  /**
   * Update an existing school program
   * @param {number} schoolProgramId - The ID of the school program to update
   * @param {Object} schoolProgramData - The updated school program data
   * @returns {Promise<Object>} - Updated school program data
   */
  async updateSchoolProgram(schoolProgramId, schoolProgramData) {
    try {
      const response = await apiClient.put('/schoolprogram/putSchoolProgramDetails', schoolProgramData, {
        params: { schoolProgramId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating school program');
      throw error;
    }
  }

  /**
   * Delete a school program
   * @param {number} schoolProgramId - The ID of the school program to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteSchoolProgram(schoolProgramId) {
    try {
      const response = await apiClient.delete(`/schoolprogram/deleteSchoolProgramDetails/${schoolProgramId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting school program with ID ${schoolProgramId}`);
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`School program service error${context ? ' - ' + context : ''}:`, error);
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }
}

export default new AdminSchoolProgramService();