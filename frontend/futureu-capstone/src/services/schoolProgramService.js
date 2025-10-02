import apiClient from './api';
import dataCacheService from './dataCache';

/**
 * Service for handling school program relationships with caching
 */
class SchoolProgramService {
  /**
   * Get all school programs with caching
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} - List of all school programs
   */
  async getAllSchoolPrograms(forceRefresh = false) {
    const cacheKey = 'schoolPrograms';
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Check if already loading
    if (dataCacheService.isLoading(cacheKey)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!dataCacheService.isLoading(cacheKey)) {
            clearInterval(checkInterval);
            resolve(dataCacheService.get(cacheKey));
          }
        }, 100);
      });
    }

    try {
      dataCacheService.setLoading(cacheKey, true);
      
      const response = await apiClient.get('/schoolprogram/getAllSchoolPrograms');
      const schoolPrograms = response.data || [];
      
      // Cache the result
      dataCacheService.set(cacheKey, schoolPrograms);
      
      return schoolPrograms;
    } catch (error) {
      this.handleError(error, 'Fetching all school programs');
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
    }
  }

  /**
   * Get school programs by program ID
   * @param {number} programId - The program ID
   * @returns {Promise<Array>} - List of school programs
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
   * Get school programs by school ID
   * @param {number} schoolId - The school ID
   * @returns {Promise<Array>} - List of school programs
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
   * Create a new school program relationship
   * @param {Object} schoolProgramData - The school program data
   * @returns {Promise<Object>} - Created school program data
   */
  async createSchoolProgram(schoolProgramData) {
    try {
      const response = await apiClient.post('/schoolprogram/postSchoolProgramRecord', schoolProgramData);
      
      // Clear cache to force refresh
      dataCacheService.clear('schoolPrograms');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating school program');
      throw error;
    }
  }

  /**
   * Update a school program relationship
   * @param {number} schoolProgramId - The school program ID
   * @param {Object} schoolProgramData - The updated data
   * @returns {Promise<Object>} - Updated school program data
   */
  async updateSchoolProgram(schoolProgramId, schoolProgramData) {
    try {
      const response = await apiClient.put(`/schoolprogram/putSchoolProgramDetails?schoolProgramId=${schoolProgramId}`, schoolProgramData);
      
      // Clear cache to force refresh
      dataCacheService.clear('schoolPrograms');
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating school program');
      throw error;
    }
  }

  /**
   * Delete a school program relationship
   * @param {number} schoolProgramId - The school program ID
   * @returns {Promise<string>} - Response message
   */
  async deleteSchoolProgram(schoolProgramId) {
    try {
      const response = await apiClient.delete(`/schoolprogram/deleteSchoolProgramDetails/${schoolProgramId}`);
      
      // Clear cache to force refresh
      dataCacheService.clear('schoolPrograms');
      
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
  }
}

export default new SchoolProgramService();