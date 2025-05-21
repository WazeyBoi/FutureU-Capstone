import apiClient from './api';

/**
 * Fetch comprehensive recommendations for a specific assessment
 * @param {number} userAssessmentId - The ID of the user assessment
 * @returns {Promise} - Axios response promise
 */
export const fetchRecommendations = (userAssessmentId) => {
  try {
    return apiClient.get(`/recommendation/comprehensive/${userAssessmentId}`);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

/**
 * Generate AI recommendations for a specific assessment
 * @param {number} userAssessmentId - The ID of the user assessment
 * @returns {Promise} - Axios response promise
 */
export const generateRecommendations = (userAssessmentId) => {
  try {
    return apiClient.post(`/recommendation/generate-for-assessment/${userAssessmentId}`);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

/**
 * Fetch a single recommendation by its ID
 * @param {number} recommendationId - The ID of the recommendation
 * @returns {Promise} - Axios response promise
 */
export const fetchRecommendationById = (recommendationId) => {
  try {
    return apiClient.get(`/recommendation/getRecommendation/${recommendationId}`);
  } catch (error) {
    console.error(`Error fetching recommendation ${recommendationId}:`, error);
    throw error;
  }
};

/**
 * Fetch recommendations by assessment result ID.
 * @param {number} resultId - The ID of the assessment result.
 * @returns {Promise} - Axios response promise with array of recommendations.
 */
export const fetchRecommendationsByResult = (resultId) => {
  try {
    return apiClient.get(`/recommendation/getRecommendationByResult/${resultId}`);
  } catch (error) {
    console.error(`Error fetching recommendations for result ${resultId}:`, error);
    throw error;
  }
};

/**
 * Create a new recommendation
 * @param {Object} recommendation - The recommendation data
 * @returns {Promise} - Axios response promise
 */
export const createRecommendation = (recommendation) => {
  try {
    return apiClient.post('/recommendation/postRecommendation', recommendation);
  } catch (error) {
    console.error('Error creating recommendation:', error);
    throw error;
  }
};

/**
 * Update an existing recommendation
 * @param {number} recommendationId - The ID of the recommendation to update
 * @param {Object} recommendationData - The updated recommendation data
 * @returns {Promise} - Axios response promise
 */
export const updateRecommendation = (recommendationId, recommendationData) => {
  try {
    return apiClient.put('/recommendation/putRecommendation', recommendationData, {
      params: { recommendationId }
    });
  } catch (error) {
    console.error(`Error updating recommendation ${recommendationId}:`, error);
    throw error;
  }
};

/**
 * Delete a recommendation
 * @param {number} recommendationId - The ID of the recommendation to delete
 * @returns {Promise} - Axios response promise
 */
export const deleteRecommendation = (recommendationId) => {
  try {
    return apiClient.delete(`/recommendation/deleteRecommendation/${recommendationId}`);
  } catch (error) {
    console.error(`Error deleting recommendation ${recommendationId}:`, error);
    throw error;
  }
};
