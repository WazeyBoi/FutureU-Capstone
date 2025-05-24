import apiClient from './api';

const fetchProgramRecommendationsByResult = async (resultId) => {
  return apiClient.get(`/program-recommendation/by-result/${resultId}`);
};

const generateProgramRecommendations = async (userAssessmentId) => {
  return apiClient.post(`/program-recommendation/generate/${userAssessmentId}`);
};

export default {
  fetchProgramRecommendationsByResult,
  generateProgramRecommendations,
};
