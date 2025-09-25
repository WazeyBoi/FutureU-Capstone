import apiClient from './api';

class CounselorService {
  // Get students from counselor's institution (filtered results)
  async getInstitutionStudentResults(counselorId) {
    try {
      const response = await apiClient.get(`/institution/counselor/${counselorId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching institution student results:', error);
      throw error;
    }
  }

  // Get students by email domain (for institutions like CIT)
  async getStudentsByEmailDomain(emailDomain) {
    try {
      const response = await apiClient.get(`/counselor/students/domain/${emailDomain}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students by email domain:', error);
      throw error;
    }
  }

  // Get students by school code (for public schools)
  async getStudentsBySchoolCode(schoolCode) {
    try {
      const response = await apiClient.get(`/counselor/students/code/${schoolCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching students by school code:', error);
      throw error;
    }
  }

  // Get aggregated assessment statistics for institution
  async getInstitutionAssessmentStats(counselorId) {
    try {
      const response = await apiClient.get(`/institution/counselor/${counselorId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching institution assessment stats:', error);
      throw error;
    }
  }

  // Export student results for institution
  async exportInstitutionResults(counselorId, format = 'csv') {
    try {
      const response = await apiClient.get(`/institution/counselor/${counselorId}/export/${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting institution results:', error);
      throw error;
    }
  }

  // Get counselor's institution info
  async getCounselorInstitution(counselorId) {
    try {
      const response = await apiClient.get(`/institution/counselor/${counselorId}/institution`);
      return response.data;
    } catch (error) {
      console.error('Error fetching counselor institution:', error);
      throw error;
    }
  }
}

export default new CounselorService();