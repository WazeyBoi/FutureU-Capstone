import apiClient from './api';
import schoolService from './schoolService';
import { getAllTestimonials } from './testimonialService';
import adminUserService from './adminServices/adminUserService';

/**
 * Statistics Service
 * Handles fetching statistics data for the landing page
 */

/**
 * Get the count of all schools
 * @returns {Promise<number>} Number of schools
 */
export const getSchoolCount = async () => {
  try {
    const schools = await schoolService.getAllSchools();
    return schools.length || 0;
  } catch (error) {
    console.error('Error fetching school count:', error);
    return 0;
  }
};

/**
 * Get the count of all programs (unique programs)
 * @returns {Promise<number>} Number of unique programs
 */
export const getProgramCount = async () => {
  try {
    const response = await apiClient.get('/schoolprogram/getAllSchoolPrograms');
    const programs = response.data || [];
    
    // Get unique programs based on programName
    const uniquePrograms = new Set();
    programs.forEach(schoolProgram => {
      let programName = null;
      
      // Handle different possible data structures
      if (schoolProgram.program && schoolProgram.program.programName) {
        programName = schoolProgram.program.programName;
      } else if (schoolProgram.programName) {
        programName = schoolProgram.programName;
      } else if (schoolProgram.program && schoolProgram.program.name) {
        programName = schoolProgram.program.name;
      }
      
      if (programName) {
        uniquePrograms.add(programName.trim().toLowerCase());
      }
    });
    
    return uniquePrograms.size;
  } catch (error) {
    console.error('Error fetching program count:', error);
    return 0;
  }
};

/**
 * Get the count of alumni (users who have submitted testimonials)
 * @returns {Promise<number>} Number of alumni with testimonials
 */
export const getAlumniCount = async () => {
  try {
    const response = await getAllTestimonials();
    const testimonials = response.data || [];
    
    // Get unique alumni based on userId or student.userId
    const uniqueAlumni = new Set();
    testimonials.forEach(testimonial => {
      const userId = testimonial.userId || 
                   (testimonial.student && testimonial.student.userId) ||
                   (testimonial.user && testimonial.user.id);
      if (userId) {
        uniqueAlumni.add(userId);
      }
    });
    
    return uniqueAlumni.size;
  } catch (error) {
    console.error('Error fetching alumni count:', error);
    return 0;
  }
};

/**
 * Get the count of students (users with STUDENT role)
 * @returns {Promise<number>} Number of students
 */
export const getStudentCount = async () => {
  try {
    // Use lightweight public count endpoint instead of fetching all users
    const response = await apiClient.get('/user/public/countStudents');
    const count = typeof response.data === 'number' ? response.data : 0;
    return count;
  } catch (error) {
    console.error('Error fetching student count:', error);
    return 0;
  }
};

/**
 * Get all statistics at once
 * @returns {Promise<Object>} Object containing all statistics
 */
export const getAllStatistics = async () => {
  try {
    const [schools, programs, alumni, students] = await Promise.all([
      getSchoolCount(),
      getProgramCount(),
      getAlumniCount(),
      getStudentCount()
    ]);

    return {
      schools,
      programs,
      alumni,
      students
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      schools: 0,
      programs: 0,
      alumni: 0,
      students: 0
    };
  }
};

const statisticsService = {
  getSchoolCount,
  getProgramCount,
  getAlumniCount,
  getStudentCount,
  getAllStatistics
};

export default statisticsService;