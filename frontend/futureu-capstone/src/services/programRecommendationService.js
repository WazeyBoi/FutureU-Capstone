import apiClient from './api';

const fetchProgramRecommendationsByResult = async (resultId) => {
  return apiClient.get(`/program-recommendation/by-result/${resultId}`);
};

const generateProgramRecommendations = async (userAssessmentId) => {
  return apiClient.post(`/program-recommendation/generate/${userAssessmentId}`);
};

const fetchAllProgramRecommendations = async () => {
  return apiClient.get('/program-recommendation/getAllProgramRecommendations');
};

export default {
  fetchProgramRecommendationsByResult,
  generateProgramRecommendations,
  fetchAllProgramRecommendations,
};
