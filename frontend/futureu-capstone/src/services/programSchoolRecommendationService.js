// Service for ProgramSchoolRecommendationController
import apiClient from './api';

/**
 * Fetch best school recommendations for a list of programIds.
 * @param {number[]} programIds - Array of program IDs
 * @returns {Promise<Array>} List of recommendations per program
 */
export async function getProgramSchoolRecommendations(programIds) {
  const response = await apiClient.post('/programschoolrecommendation/getRecommendations', programIds);
  return response.data;
}
