import apiClient from './api';

class InstitutionService {
  // Get institution by email domain (for automatic linking like CIT)
  async getInstitutionByEmailDomain(emailDomain) {
    try {
      const response = await apiClient.get(`/institution/by-domain/${emailDomain}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching institution by domain:', error);
      throw error;
    }
  }

  // Get institution by school code (for manual linking)
  async getInstitutionBySchoolCode(schoolCode) {
    try {
      const response = await apiClient.get(`/institution/by-code/${schoolCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching institution by code:', error);
      throw error;
    }
  }

  // Validate school code (for frontend validation)
  async validateSchoolCode(schoolCode) {
    try {
      const response = await apiClient.get(`/institution/validate-school-code/${schoolCode}`);
      return response.data;
    } catch (error) {
      console.error('Error validating school code:', error);
      throw error;
    }
  }

  // Validate email domain
  async validateEmailDomain(emailDomain) {
    try {
      const response = await apiClient.get(`/institution/validate-email-domain/${emailDomain}`);
      return response.data;
    } catch (error) {
      console.error('Error validating email domain:', error);
      throw error;
    }
  }

  // Get all institutions (for admin purposes)
  async getAllInstitutions() {
    try {
      const response = await apiClient.get('/institution/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw error;
    }
  }

  // For counselors: Get students from their institution
  async getCounselorInstitutionStudents(counselorId) {
    try {
      const response = await apiClient.get(`/institution/counselor/${counselorId}/students`);
      return response.data;
    } catch (error) {
      console.error('Error fetching counselor institution students:', error);
      throw error;
    }
  }
}

export default new InstitutionService();