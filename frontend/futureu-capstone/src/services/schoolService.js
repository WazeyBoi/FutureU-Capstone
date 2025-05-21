import axios from 'axios';

// Base URL for school API
const API_URL = '/api/school';

// Create a new school
export const createSchool = async (schoolData) => {
  return await axios.post(`${API_URL}/postSchoolRecord`, schoolData);
};

// Get all schools
export const getAllSchools = async () => {
  return await axios.get(`${API_URL}/getAllSchools`);
};

// Get school by ID
export const getSchoolById = async (schoolId) => {
  return await axios.get(`${API_URL}/getSchool/${schoolId}`);
};

// Search schools by name
export const searchSchoolsByName = async (name) => {
  return await axios.get(`${API_URL}/searchSchools?name=${name}`);
};

// Filter schools by location
export const filterSchoolsByLocation = async (location) => {
  return await axios.get(`${API_URL}/filterByLocation?location=${location}`);
};

// Filter schools by type
export const filterSchoolsByType = async (type) => {
  return await axios.get(`${API_URL}/filterByType?type=${type}`);
};

// Update school
export const updateSchool = async (schoolId, schoolData) => {
  return await axios.put(`${API_URL}/putSchoolDetails?schoolId=${schoolId}`, schoolData);
};

// Delete school
export const deleteSchool = async (schoolId) => {
  return await axios.delete(`${API_URL}/deleteSchoolDetails/${schoolId}`);
};

const schoolService = {
  createSchool,
  getAllSchools,
  getSchoolById,
  searchSchoolsByName,
  filterSchoolsByLocation,
  filterSchoolsByType,
  updateSchool,
  deleteSchool
};

export default schoolService;