import apiClient from './api';
import dataCacheService from './dataCache';

/**
 * Service for handling program-related API requests with caching
 */
class ProgramService {
  /**
   * Get all programs with caching
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} - List of all programs
   */
  async getAllPrograms(forceRefresh = false) {
    const cacheKey = 'programs';
    
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
      
      const response = await apiClient.get('/program/getAllPrograms');
      const programs = response.data || [];
      
      // Cache the result
      dataCacheService.set(cacheKey, programs);
      
      return programs;
    } catch (error) {
      this.handleError(error, 'Fetching all programs');
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
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
   * Create a new program
   * @param {Object} programData - The program object to create
   * @returns {Promise<Object>} - Created program data
   */
  async createProgram(programData) {
    try {
      const response = await apiClient.post('/program/postProgramRecord', programData);
      
      // Clear cache to force refresh
      dataCacheService.clear('programs');
      dataCacheService.clear('schoolPrograms'); // Also clear related cache
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating program');
      throw error;
    }
  }

  /**
   * Update a program
   * @param {number} programId - The ID of the program to update
   * @param {Object} programData - The new program details
   * @returns {Promise<Object>} - Updated program data
   */
  async updateProgram(programId, programData) {
    try {
      const response = await apiClient.put(`/program/putProgramDetails?programId=${programId}`, programData);
      
      // Clear cache to force refresh
      dataCacheService.clear('programs');
      dataCacheService.clear('schoolPrograms'); // Also clear related cache
      
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
      
      // Clear cache to force refresh
      dataCacheService.clear('programs');
      dataCacheService.clear('schoolPrograms'); // Also clear related cache
      
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting program with ID ${programId}`);
      throw error;
    }
  }

  /**
   * Search programs by name
   * @param {string} name
   * @returns {Promise<Array>}
   */
  async searchPrograms(name) {
    try {
      const response = await apiClient.get('/program/searchPrograms', { params: { name } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching programs');
      throw error;
    }
  }

  /**
   * Get programs by school ID
   * @param {number} schoolId
   * @returns {Promise<Array>}
   */
  async getProgramsBySchool(schoolId) {
    try {
      const response = await apiClient.get(`/program/getProgramsBySchool/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching programs for school ID ${schoolId}`);
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
  }
}

export default new ProgramService();