import apiClient from './api';
import dataCacheService from './dataCache';

/**
 * Service for handling school-related API requests with caching
 */
class SchoolService {
  /**
   * Get all schools with caching
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} - List of all schools
   */
  async getAllSchools(forceRefresh = false) {
    const cacheKey = 'schools';
    
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
      
      const response = await apiClient.get('/school/getAllSchools');
      const schools = response.data || [];
      
      // Cache the result
      dataCacheService.set(cacheKey, schools);
      
      return schools;
    } catch (error) {
      this.handleError(error, 'Fetching all schools');
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
    }
  }

  /**
   * Get school by ID
   * @param {number} schoolId - The school ID
   * @returns {Promise<Object>} - The school data
   */
  async getSchoolById(schoolId) {
    try {
      const response = await apiClient.get(`/school/getSchool/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching school with ID ${schoolId}`);
      throw error;
    }
  }

  /**
   * Create a new school
   * @param {Object} schoolData - The school object to create
   * @returns {Promise<Object>} - Created school data
   */
  async createSchool(schoolData) {
    try {
      const response = await apiClient.post('/school/postSchoolRecord', schoolData);
      
      // Clear cache to force refresh
      dataCacheService.clear('schools');
      dataCacheService.clear('schoolPrograms'); // Also clear related cache
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating school');
      throw error;
    }
  }

  /**
   * Update a school
   * @param {number} schoolId - The ID of the school to update
   * @param {Object} schoolData - The new school details
   * @returns {Promise<Object>} - Updated school data
   */
  async updateSchool(schoolId, schoolData) {
    try {
      const response = await apiClient.put(`/school/putSchoolDetails?schoolId=${schoolId}`, schoolData);
      
      // Clear cache to force refresh
      dataCacheService.clear('schools');
      dataCacheService.clear('schoolPrograms'); // Also clear related cache
      
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating school');
      throw error;
    }
  }

  /**
   * Delete a school
   * @param {number} schoolId - The ID of the school to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteSchool(schoolId) {
    try {
      const response = await apiClient.delete(`/school/deleteSchoolDetails/${schoolId}`);
      
      // Clear cache to force refresh
      dataCacheService.clear('schools');
      dataCacheService.clear('schoolPrograms'); // Also clear related cache
      
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting school with ID ${schoolId}`);
      throw error;
    }
  }

  /**
   * Search schools by name
   * @param {string} name
   * @returns {Promise<Array>}
   */
  async searchSchools(name) {
    try {
      const response = await apiClient.get('/school/searchSchools', { params: { name } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching schools');
      throw error;
    }
  }

  /**
   * Filter schools by location
   * @param {string} location
   * @returns {Promise<Array>}
   */
  async filterByLocation(location) {
    try {
      const response = await apiClient.get('/school/filterByLocation', { params: { location } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering by location');
      throw error;
    }
  }

  /**
   * Filter schools by type
   * @param {string} type
   * @returns {Promise<Array>}
   */
  async filterByType(type) {
    try {
      const response = await apiClient.get('/school/filterByType', { params: { type } });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering by type');
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`School service error${context ? ' - ' + context : ''}:`, error);
  }
}

export default new SchoolService();