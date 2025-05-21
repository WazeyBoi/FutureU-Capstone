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

  getSchoolProgramById: async (schoolProgramId) => {
    try {
      const response = await apiClient.get(`/schoolprogram/getSchoolProgram/${schoolProgramId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school program with ID ${schoolProgramId}:`, error);
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

  getSchoolProgramBySchoolAndProgram: async (schoolId, programId) => {
    try {
      const response = await apiClient.get(`/schoolprogram/getSchoolProgramBySchoolAndProgram?schoolId=${schoolId}&programId=${programId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching school program for school ID ${schoolId} and program ID ${programId}:`, error);
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
  },

  updateSchoolProgram: async (schoolProgramId, schoolProgramData) => {
    try {
      const response = await apiClient.put(
        `/schoolprogram/putSchoolProgramDetails?schoolProgramId=${schoolProgramId}`, 
        schoolProgramData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating school program with ID ${schoolProgramId}:`, error);
      throw error;
    }
  }
};

export default schoolProgramService; 