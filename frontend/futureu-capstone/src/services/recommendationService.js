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
    // Use longer timeout for AI generation process (3 minutes)
    return apiClient.post(`/recommendation/regenerate/${userAssessmentId}`, {}, {
      timeout: 180000 // 3 minutes to allow for AI generation and rate limiting
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
};

/**
 * Enqueue a regeneration job (server will process asynchronously)
 * @returns {Promise} - Returns { jobId, status }
 */
export const enqueueRegeneration = (userAssessmentId) => {
  try {
    return apiClient.post(`/recommendation/regenerate/${userAssessmentId}`);
  } catch (error) {
    console.error('Error enqueueing regeneration job:', error);
    throw error;
  }
};

/**
 * Get job status by jobId
 */
export const getJobStatus = (jobId) => {
  try {
    return apiClient.get(`/recommendation/job/${jobId}`);
  } catch (error) {
    console.error(`Error fetching job status ${jobId}:`, error);
    throw error;
  }
};

/**
 * Check whether recommendations exist for a given user assessment.
 * This endpoint is fast and intended for polling to detect when a long-running
 * backend generation has finished and persisted results.
 * @param {number} userAssessmentId
 * @returns {Promise} - Axios response promise with { hasRecommendations: boolean, ... }
 */
export const checkRecommendationsExist = (userAssessmentId) => {
  try {
    return apiClient.get(`/recommendation/exists/${userAssessmentId}`);
  } catch (error) {
    console.error(`Error checking existence of recommendations for ${userAssessmentId}:`, error);
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

/**
 * Fetch all career recommendations (admin/counselor dashboard aggregate)
 * @returns {Promise} - Axios response promise with array of all career recommendations
 */
export const fetchAllCareerRecommendations = () => {
  try {
    return apiClient.get('/recommendation/getAllCareerRecommendations');
  } catch (error) {
    console.error('Error fetching all career recommendations:', error);
    throw error;
  }
};

/**
 * Regenerate dream career analysis specifically
 * @param {number} userAssessmentId - The ID of the user assessment
 * @returns {Promise} - Axios response promise
 */
export const regenerateDreamCareerAnalysis = (userAssessmentId) => {
  try {
    // Use longer timeout for AI regeneration process (2 minutes)
    return apiClient.post(`/recommendation/regenerate-dream-career/${userAssessmentId}`, {}, {
      timeout: 120000 // 2 minutes for AI regeneration
    });
  } catch (error) {
    console.error('Error regenerating dream career analysis:', error);
    throw error;
  }
};

/**
 * Fetch career path details including description by career path ID
 * @param {number} careerPathId - The ID of the career path
 * @returns {Promise} - Axios response promise with career path details
 */
export const fetchCareerPathDetails = (careerPathId) => {
  try {
    return apiClient.get(`/careerpath/get/${careerPathId}`);
  } catch (error) {
    console.error(`Error fetching career path details for ID ${careerPathId}:`, error);
    throw error;
  }
};
