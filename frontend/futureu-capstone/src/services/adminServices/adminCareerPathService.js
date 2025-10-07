import apiClient from '../api';

/**
 * Service for handling admin career path CRUD operations.
 */
class AdminCareerPathService {
  async getAllCareerPaths() {
    try {
      const response = await apiClient.get('/careerpath/getAll');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all career paths');
      throw error;
    }
  }

  async getCareerPathById(careerPathId) {
    try {
      const response = await apiClient.get(`/careerpath/get/${careerPathId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching career path ${careerPathId}`);
      throw error;
    }
  }

  async searchCareerPaths(query, type = 'name') {
    try {
      const response = await apiClient.get('/careerpath/search', {
        params: { query, type },
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching career paths');
      throw error;
    }
  }

  async createCareerPath(payload) {
    try {
      const response = await apiClient.post('/careerpath/create', payload);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating career path');
      throw error;
    }
  }

  async createCareerPathsBulk(payload) {
    try {
      const response = await apiClient.post('/careerpath/create/bulk', payload);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating career paths in bulk');
      throw error;
    }
  }

  async updateCareerPath(careerPathId, payload) {
    try {
      const response = await apiClient.put('/careerpath/update', {
        ...payload,
        careerPathId,
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating career path');
      throw error;
    }
  }

  async deleteCareerPath(careerPathId) {
    try {
      const response = await apiClient.delete(`/careerpath/delete/${careerPathId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Deleting career path');
      throw error;
    }
  }

  handleError(error, context = '') {
    console.error(`Career path service error${context ? ' - ' + context : ''}:`, error);
    if (error?.response) {
      const message = error.response.data?.message || error.response.statusText;
      throw new Error(`Server error (${error.response.status}): ${message}`);
    }
    throw new Error(error.message || 'Unexpected error');
  }
}

export default new AdminCareerPathService();
