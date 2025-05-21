import axios from 'axios';
import apiClient from './api';
import authService from './authService';

/**
 * Service for handling school-related API requests
 */
class AdminSchoolService {
  /**
   * Create a new school
   * @param {Object} schoolData - The school data to create
   * @returns {Promise<Object>} - Created school data
   */
  async createSchool(schoolData) {
    try {
      // Use apiClient which has the authorization header configured
      const response = await apiClient.post('/school/postSchoolRecord', schoolData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating school');
      throw error;
    }
  }

  /**
   * Get all schools
   * @returns {Promise<Array>} - List of all schools
   */
  async getAllSchools() {
    try {
      // Use apiClient instead of direct axios
      const response = await apiClient.get('/school/getAllSchools');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all schools');
      throw error;
    }
  }

  /**
   * Get school by ID
   * @param {number} schoolId - The school ID
   * @returns {Promise<Object>} - The school data
   */
  async getSchoolById(schoolId) {
    if (!schoolId) {
      throw new Error('School ID is required');
    }
    try {
      const response = await apiClient.get(`/school/getSchool/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching school with ID ${schoolId}`);
      throw error;
    }
  }

  /**
   * Search schools by name
   * @param {string} name - The name to search for
   * @returns {Promise<Array>} - List of matching schools
   */
  async searchSchoolsByName(name) {
    try {
      const response = await apiClient.get('/school/searchSchools', {
        params: { name }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching schools by name');
      throw error;
    }
  }

  /**
   * Filter schools by location
   * @param {string} location - The location to filter by
   * @returns {Promise<Array>} - List of schools in the specified location
   */
  async filterSchoolsByLocation(location) {
    try {
      const response = await apiClient.get('/school/filterByLocation', {
        params: { location }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering schools by location');
      throw error;
    }
  }

  /**
   * Filter schools by type
   * @param {string} type - The type to filter by
   * @returns {Promise<Array>} - List of schools of the specified type
   */
  async filterSchoolsByType(type) {
    try {
      const response = await apiClient.get('/school/filterByType', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering schools by type');
      throw error;
    }
  }

  /**
   * Update an existing school
   * @param {number} schoolId - The ID of the school to update
   * @param {Object} schoolData - The updated school data
   * @returns {Promise<Object>} - Updated school data
   */
  async updateSchool(schoolId, schoolData) {
    try {
      const response = await apiClient.put('/school/putSchoolDetails', schoolData, {
        params: { schoolId }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `Updating school with ID ${schoolId}`);
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
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting school with ID ${schoolId}`);
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
    if (error.response) {
      throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
    } else {
      throw new Error(`Unexpected error: ${error.message}`);
    }
  }

}

export default new AdminSchoolService();