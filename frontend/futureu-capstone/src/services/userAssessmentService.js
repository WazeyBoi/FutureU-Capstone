import apiClient from './api';

/**
 * Service for handling user assessment-related API requests
 */
class UserAssessmentService {
  /**
   * Test if the user assessment API is working
   * @returns {Promise<string>} - Response message
   */
  async testApi() {
    try {
      const response = await apiClient.get('/userassessment/test');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Testing API');
      throw error;
    }
  }

  /**
   * Get all user assessments
   * @returns {Promise<Array>} - List of all user assessments
   */
  async getAllUserAssessments() {
    try {
      const response = await apiClient.get('/userassessment/getAllUserAssessments');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching all user assessments');
      throw error;
    }
  }

  /**
   * Get user assessment by ID
   * @param {number} id - The user assessment ID
   * @returns {Promise<Object>} - The user assessment data
   */
  async getUserAssessmentById(id) {
    try {
      const response = await apiClient.get(`/userassessment/getUserAssessment/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user assessment with ID ${id}`);
      throw error;
    }
  }

  /**
   * Get user assessments by user ID
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - List of user assessments
   */
  async getUserAssessmentsByUser(userId) {
    try {
      const response = await apiClient.get(`/userassessment/getUserAssessmentsByUser/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user assessments for user ID ${userId}`);
      throw error;
    }
  }

  /**
   * Get user assessments by assessment ID
   * @param {number} assessmentId - The assessment ID
   * @returns {Promise<Array>} - List of user assessments
   */
  async getUserAssessmentsByAssessment(assessmentId) {
    try {
      const response = await apiClient.get(`/userassessment/getUserAssessmentsByAssessment/${assessmentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching user assessments for assessment ID ${assessmentId}`);
      throw error;
    }
  }

  /**
   * Create a new user assessment
   * @param {Object} userAssessment - The user assessment object to create
   * @returns {Promise<Object>} - Created user assessment data
   */
  async createUserAssessment(userAssessment) {
    try {
      const response = await apiClient.post('/userassessment/postUserAssessmentRecord', userAssessment);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Creating user assessment');
      throw error;
    }
  }

  /**
   * Update a user assessment
   * @param {Object} userAssessment - The user assessment to update
   * @returns {Promise<Object>} - Updated user assessment data
   */
  async updateUserAssessment(userAssessment) {
    try {
      const response = await apiClient.put(`/userassessment/putUserAssessmentDetails?id=${userAssessment.userQuizAssessment}`, userAssessment);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Updating user assessment');
      throw error;
    }
  }

  /**
   * Delete a user assessment
   * @param {number} id - The ID of the user assessment to delete
   * @returns {Promise<string>} - Response message
   */
  async deleteUserAssessment(id) {
    try {
      const response = await apiClient.delete(`/userassessment/deleteUserAssessment/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Deleting user assessment with ID ${id}`);
      throw error;
    }
  }

  /**
   * Save assessment progress for later resumption
   * @param {Object} progressData - The assessment progress data
   * @returns {Promise<Object>} - Saved progress data
   */
  async saveProgress(progressData) {
    try {
      const response = await apiClient.post('/assessment-progress/save', progressData);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Saving assessment progress');
      throw error;
    }
  }

  /**
   * Get in-progress assessments for a user
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - List of in-progress assessments
   */
  async getInProgressAssessments(userId) {
    try {
      const response = await apiClient.get(`/assessment-progress/in-progress/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching in-progress assessments');
      return []; // Return empty array to prevent errors
    }
  }

  /**
   * Get specific assessment progress by ID
   * @param {number} userAssessmentId - The user assessment ID
   * @returns {Promise<Object>} - Assessment progress data
   */
  async getAssessmentProgress(userAssessmentId) {
    try {
      const response = await apiClient.get(`/assessment-progress/${userAssessmentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching assessment progress data');
      throw error;
    }
  }

  /**
   * Submit a complete assessment for scoring
   * @param {Object} submissionData - The complete assessment submission data
   * @returns {Promise<Object>} - Assessment results
   */
  async submitCompletedAssessment(submissionData) {
    try {
      // Using the new endpoint
      const response = await apiClient.post('/userassessment/submit-completed', submissionData);
      return response.data;
    } catch (error) {
      // Enhanced error handling
      let errorMessage = 'Error submitting assessment';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || 
                      `Server error: ${error.response.status} - ${error.response.statusText}`;
        console.error('Server error response:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response received from server. Check your network connection.';
      }
      this.handleError(error, `Submitting completed assessment: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get detailed assessment results by user assessment ID
   * @param {number} userAssessmentId - The user assessment ID
   * @returns {Promise<Object>} - Detailed assessment results
   */
  async getDetailedResults(userAssessmentId) {
    try {
      const response = await apiClient.get(`/assessment-results/${userAssessmentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching detailed assessment results');
      throw error;
    }
  }

  /**
   * Get assessment results for a specific user assessment
   * @param {number} userAssessmentId - The user assessment ID
   * @returns {Promise<Object>} - Assessment results data
   */
  async getAssessmentResults(userAssessmentId) {
    try {
      const response = await apiClient.get(`/assessment-results/user-assessment/${userAssessmentId}`);
      return response.data;
    } catch (error) {
      // If token expired (401), try to refresh the token and retry the request
      if (error.response && error.response.status === 401) {
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Retry the request with the new token
          const response = await apiClient.get(`/assessment-results/user-assessment/${userAssessmentId}`);
          return response.data;
        }
      }
      
      this.handleError(error, 'Fetching assessment results');
      throw error;
    }
  }

  /**
   * Get assessments for a user and filter for completed ones
   * @param {number} userId - The user ID
   * @returns {Promise<Array>} - List of completed assessments
   */
  async getCompletedAssessments(userId) {
    try {
      // Use the existing endpoint to get all user assessments
      const response = await apiClient.get(`/userassessment/getUserAssessmentsByUser/${userId}`);
      
      // Filter for assessments with a status of "COMPLETED"
      // Adjust the status check based on your actual data structure
      return response.data.filter(assessment => assessment.status === "COMPLETED");
    } catch (error) {
      // If token expired (401), try to refresh the token and retry the request
      if (error.response && error.response.status === 401) {
        const refreshed = await authService.refreshToken();
        if (refreshed) {
          // Retry the request with the new token
          const response = await apiClient.get(`/userassessment/getUserAssessmentsByUser/${userId}`);
          return response.data.filter(assessment => assessment.status === "COMPLETED");
        }
      }
      
      this.handleError(error, 'Fetching completed assessments');
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`User assessment service error${context ? ' - ' + context : ''}:`, error);
  }
}

export default new UserAssessmentService();
