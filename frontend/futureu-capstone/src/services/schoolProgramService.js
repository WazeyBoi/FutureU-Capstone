import apiClient from './api';

const schoolProgramService = {
  getAllSchoolPrograms: async () => {
    try {
      const response = await apiClient.get('/schoolprogram/getAllSchoolPrograms');
      return response.data;
    } catch (error) {
      console.error('Error fetching school programs:', error);
      throw error;
    }
  },

  getSchoolProgramsBySchool: async (schoolId) => {
    try {
      const response = await apiClient.get(`/schoolprogram/getSchoolProgramsBySchool/${schoolId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school programs for school ID ${schoolId}:`, error);
      throw error;
    }
  },

  getSchoolProgramsBySchoolName: async (schoolName) => {
    try {
      const response = await apiClient.get('/schoolprogram/getSchoolProgramsBySchoolName', {
        params: { schoolName }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching school programs for school name "${schoolName}":`, error);
      throw error;
    }
  },

  getSchoolProgramsByProgram: async (programId) => {
    try {
      const response = await apiClient.get(`/schoolprogram/getSchoolProgramsByProgram/${programId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school programs for program ID ${programId}:`, error);
      throw error;
    }
  },

  createSchoolProgram: async (schoolProgram) => {
    try {
      const response = await apiClient.post('/schoolprogram/postSchoolProgramRecord', schoolProgram);
      return response.data;
    } catch (error) {
      console.error('Error creating school program:', error);
      throw error;
    }
  }
};

export default schoolProgramService; 