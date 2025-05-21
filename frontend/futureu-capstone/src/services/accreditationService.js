import apiClient from './api';
import authService from './authService';

/**
 * Accreditation Service
 * Handles all API requests related to accreditations
 */

/**
 * Test if the accreditation API is working
 * @returns {Promise} Promise with test response
 */
export const testAccreditationApi = () => {
  return apiClient.get('/accreditation/test');
};

/**
 * Get all accreditations
 * @returns {Promise} Promise with all accreditations data
 */
export const getAllAccreditations = () => {
  return apiClient.get('/accreditation/getAllAccreditations');
};

/**
 * Get accreditation by ID
 * @param {number} accredId - The ID of the accreditation
 * @returns {Promise} Promise with accreditation data
 */
export const getAccreditationById = (accredId) => {
  return apiClient.get(`/accreditation/getAccreditation/${accredId}`);
};

/**
 * Get accreditations for a specific school
 * @param {number} schoolId - The ID of the school
 * @returns {Promise} Promise with filtered accreditations data
 */
export const getAccreditationsBySchool = (schoolId) => {
  return apiClient.get(`/accreditation/getAccreditationsBySchool/${schoolId}`);
};

/**
 * Get accreditations for a specific program
 * @param {number} programId - The ID of the program to filter by
 * @returns {Promise} Promise with filtered accreditations data
 */
export const getAccreditationsByProgram = (programId) => {
  return apiClient.get(`/accreditation/getAccreditationsByProgram/${programId}`);
};

/**
 * Get accreditations for a specific school and program
 * @param {number} schoolId - The ID of the school
 * @param {number} programId - The ID of the program
 * @returns {Promise} Promise with filtered accreditations data
 */
export const getAccreditationsBySchoolAndProgram = (schoolId, programId) => {
  return apiClient.get(`/accreditation/getAccreditationsBySchoolAndProgram?schoolId=${schoolId}&programId=${programId}`);
};

/**
 * Search accreditations by title
 * @param {string} title - The title to search for
 * @returns {Promise} Promise with matching accreditations
 */
export const searchAccreditations = (title) => {
  return apiClient.get(`/accreditation/searchAccreditations?title=${title}`);
};

/**
 * Create a new accreditation
 * @param {Object} accreditationData - The accreditation data to submit
 * @returns {Promise} Promise with the created accreditation data
 */
export const createAccreditation = (accreditationData) => {
  return apiClient.post('/accreditation/postAccreditationRecord', accreditationData);
};

/**
 * Update an existing accreditation
 * @param {number} accredId - The ID of the accreditation to update
 * @param {Object} accreditationData - The updated accreditation data
 * @returns {Promise} Promise with the updated accreditation data
 */
export const updateAccreditation = (accredId, accreditationData) => {
  return apiClient.put(`/accreditation/putAccreditationDetails?accredId=${accredId}`, accreditationData);
};

/**
 * Delete an accreditation
 * @param {number} accredId - The ID of the accreditation to delete
 * @returns {Promise} Promise with the deletion status
 */
export const deleteAccreditation = (accredId) => {
  return apiClient.delete(`/accreditation/deleteAccreditationDetails/${accredId}`);
};

/**
 * Get accreditations by recognition status
 * @param {string} status - The recognition status to filter by
 * @returns {Promise} Promise with filtered accreditations
 */
export const getAccreditationsByRecognitionStatus = (status) => {
  return apiClient.get(`/accreditation/getByRecognitionStatus?status=${status}`);
};

/**
 * Get accreditations by accrediting body
 * @param {string} body - The accrediting body to filter by
 * @returns {Promise} Promise with filtered accreditations
 */
export const getAccreditationsByAccreditingBody = (body) => {
  return apiClient.get(`/accreditation/getByAccreditingBody?body=${body}`);
};

/**
 * Get accreditations by accreditation level
 * @param {string} level - The accreditation level to filter by
 * @returns {Promise} Promise with filtered accreditations
 */
export const getAccreditationsByAccreditationLevel = (level) => {
  return apiClient.get(`/accreditation/getByAccreditationLevel?level=${level}`);
};

/**
 * Service for handling accreditation-related API requests
 */
class AccreditationService {
  constructor() {
    // Import mock data for fallback if needed
    this.mockData = null;
    this.loadMockData();
  }

  /**
   * Load mock data from the data folder
   */
  async loadMockData() {
    try {
      // Dynamically import the mock data
      const { schools } = await import('../data/schools');
      this.mockData = schools;
    } catch (error) {
      console.warn('Could not load mock data for fallback', error);
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  isUserAuthenticated() {
    return authService.isAuthenticated();
  }

  /**
   * Ensure user is authenticated before making api calls
   * @returns {boolean} True if user is authenticated, false otherwise
   */
  ensureAuthentication() {
    if (!this.isUserAuthenticated()) {
      console.warn('User is not authenticated. You may need to log in first.');
      return false;
    }
    return true;
  }

  /**
   * Get all accreditation data for schools and programs
   * @param {boolean} forceRefresh - Force a refresh of the data, bypassing any caching
   * @returns {Promise<Array>} - List of schools with accreditation data
   */
  async getAllAccreditationData(forceRefresh = false) {
    try {
      // Check if user is authenticated
      if (!this.ensureAuthentication()) {
        // Return mock data as fallback if available without making API calls
        if (this.mockData) {
          console.warn('Using mock data because user is not authenticated');
          return this.mockData;
        }
        
        // If no mock data, then redirect or throw error
        throw new Error('Authentication required to view accreditation data');
      }

      // Get list of schools
      const schoolsResponse = await apiClient.get('/school/getAllSchools', {
        headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
      });
      const schools = schoolsResponse.data;
      console.log('Retrieved schools:', schools);
      
                  // For each school, get programs and accreditation details
            const schoolsWithAccreditation = await Promise.all(
              schools.map(async (school) => {
                try {
                  // Get school programs
                  const schoolProgramsResponse = await apiClient.get(`/schoolprogram/getSchoolProgramsBySchool/${school.schoolId}`, {
                    headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
                  });
                  const schoolPrograms = schoolProgramsResponse.data;
                  console.log(`Programs for school ${school.name}:`, schoolPrograms);
                  
                  // Get accreditations for this school
                  const accreditationsResponse = await apiClient.get(`/accreditation/getAccreditationsBySchool/${school.schoolId}`, {
                    headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
                  });
                  const accreditations = accreditationsResponse.data;
                  
                  // Debug: Check what data is coming from the API
                  console.log(`Accreditations for school ${school.name}:`, accreditations);
                  
                  // Get all programs for this school
                  const allPrograms = [];
                  
                  // First add programs that have school_program entries
                  for (const schoolProgram of schoolPrograms) {
                    if (schoolProgram.program) {
                      allPrograms.push({
                        program: schoolProgram.program,
                        schoolProgram: schoolProgram
                      });
                    }
                  }
                  
                  // Now check for accreditation records that might not have corresponding school_program entries
                  // but have program_id set (these would be missing otherwise)
                  for (const accreditation of accreditations) {
                    if (accreditation.program) {
                      // Check if we already have this program
                      const exists = allPrograms.some(item => 
                        item.program.programId === accreditation.program.programId);
                        
                      if (!exists) {
                        // Add this program that was only found through accreditation
                        allPrograms.push({
                          program: accreditation.program,
                          accreditation: accreditation
                        });
                      }
                    }
                  }
                  
                  // Deduplicate programs by program_id to avoid showing duplicates
                  const programIds = new Set();
                  const uniquePrograms = [];
                  
                  // Use filter to create a new array with unique elements
                  allPrograms.forEach(item => {
                    if (!programIds.has(item.program.programId)) {
                      programIds.add(item.program.programId);
                      uniquePrograms.push(item);
                    }
                  });
                  
                  // Clear the original array and add back the unique items
                  allPrograms.length = 0;
                  uniquePrograms.forEach(item => allPrograms.push(item));
                  
                  console.log(`Total programs found for ${school.name}:`, allPrograms.length);
                  
                  // Group programs by category
                  const programCategories = {};
                  
                  for (const item of allPrograms) {
                    const program = item.program;
                    const category = program.programName.includes('Bachelor') ? 'Undergraduate Programs' 
                                   : program.programName.includes('Master') ? 'Graduate Programs'
                                   : 'Other Programs';
                    
                    if (!programCategories[category]) {
                      programCategories[category] = [];
                    }
                    
                    // Find accreditation using multiple methods
                    let accreditation = null;
                    
                    // Method 1: If we already have the accreditation from the item
                    if (item.accreditation) {
                      accreditation = item.accreditation;
                    }
                    // Method 2: Try direct relationship through schoolProgram
                    else if (item.schoolProgram && item.schoolProgram.accreditation) {
                      accreditation = item.schoolProgram.accreditation;
                    }
                    // Method 3: Try accredId from schoolProgram
                    else if (item.schoolProgram && item.schoolProgram.accredId) {
                      accreditation = accreditations.find(a => a.accredId === item.schoolProgram.accredId);
                    }
                    // Method 4: Find by matching program ID in accreditations
                    else {
                      accreditation = accreditations.find(a => 
                        a.program && a.program.programId === program.programId);
                    }
                    
                    // Debug log
                    if (accreditation) {
                      console.log(`Accreditation found for ${program.programName}:`, {
                        accredId: accreditation.accredId,
                        accreditationLevel: accreditation.accreditationLevel,
                        accreditingBody: accreditation.accreditingBody
                      });
                    }
                    
                    // Determine accreditation status 
                    let accreditationStatus = 'Not Accredited';
                    let accreditingBody = 'N/A';
                    let recognitionStatus = null;
                    let level = 0;
                    
                    if (accreditation) {
                      // Set accreditation status and level
                      if (accreditation.accreditationLevel) {
                        accreditationStatus = `${accreditation.accreditationLevel} Accredited`;
                        level = this.parseAccreditationLevel(accreditation.accreditationLevel);
                      }
                      
                      // Set accrediting body
                      if (accreditation.accreditingBody) {
                        accreditingBody = accreditation.accreditingBody;
                      }
                      
                      // Set recognition status
                      if (accreditation.recognitionStatus && accreditation.recognitionStatus !== 'None') {
                        recognitionStatus = accreditation.recognitionStatus;
                      }
                    }
                    
                    programCategories[category].push({
                      name: program.programName,
                      description: program.description,
                      // Map accreditation data to the expected format
                      accreditationStatus: accreditationStatus,
                      accreditingBody: accreditingBody,
                      recognition: recognitionStatus,
                      level: level
                    });
                  }
            
            // Convert to format expected by the UI
            const programsArray = Object.keys(programCategories).map(category => ({
              category,
              items: programCategories[category]
            }));
            
            // Create the school object in the format expected by the UI
            return {
              id: school.schoolId,
              name: school.name,
              totalAccredited: accreditations.length,
              institutionalStatus: {
                autonomousStatus: "Pending",
                institutionalAccreditation: "Pending",
                validUntil: "Pending",
              },
              programs: programsArray
            };
          } catch (error) {
            console.error(`Error processing school ${school.name}:`, error);
            return {
              id: school.schoolId,
              name: school.name,
              totalAccredited: 0,
              institutionalStatus: {
                autonomousStatus: "Error",
                institutionalAccreditation: "Error",
                validUntil: "Error",
              },
              programs: []
            };
          }
        })
      );
      
      return schoolsWithAccreditation;
    } catch (error) {
      this.handleError(error, 'Fetching all accreditation data');
      
      // If no mock data is available or other error, rethrow
      if (!this.mockData) {
        throw error;
      }
      
      // Return mock data as fallback
      console.warn('Using mock data as fallback due to API error');
      return this.mockData;
    }
  }
  
  /**
   * Parse accreditation level string to numeric value
   * @param {string} levelString - Level string (e.g. "Level I", "Level II", etc.)
   * @returns {number} - Numeric level value (1-4)
   */
  parseAccreditationLevel(levelString) {
    if (!levelString) return 0;
    
    // Handle standard Level I-IV format
    if (levelString.includes('Level')) {
      if (levelString.includes('IV')) return 4;
      if (levelString.includes('III')) return 3;
      if (levelString.includes('II') && !levelString.includes('III')) return 2;
      if (levelString.includes('I') && !levelString.includes('II') && !levelString.includes('III') && !levelString.includes('IV')) return 1;
    }
    
    // Handle other formats (like "COE Level")
    if (levelString.includes('COE')) return 4;
    
    // Handle PACUCOA specific formats
    if (levelString.includes('RA')) {
      if (levelString.includes('III')) return 3;  
      if (levelString.includes('II')) return 2;
      return 1;
    }
    
    return 0;
  }

  /**
   * Get accreditation data for a specific school
   * @param {number} schoolId - The school ID
   * @returns {Promise<Object>} - School accreditation data
   */
  async getSchoolAccreditationData(schoolId) {
    try {
      if (!this.ensureAuthentication()) {
        // Return mock data for this school if available
        if (this.mockData) {
          return this.mockData.find(s => s.id === schoolId);
        }
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.get(`/accreditation/school/${schoolId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, `Fetching accreditation data for school ID ${schoolId}`);
      throw error;
    }
  }

  /**
   * Get all programs with COE recognition
   * @returns {Promise<Array>} - List of COE programs
   */
  async getCOEPrograms() {
    try {
      if (!this.ensureAuthentication()) {
        // Return filtered mock data if available
        if (this.mockData) {
          const allPrograms = this.mockData.flatMap(school => 
            school.programs.flatMap(category => 
              category.items.filter(program => program.recognition === 'COE')
            )
          );
          return allPrograms;
        }
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.get('/accreditation/getByRecognitionStatus?status=COE');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching COE programs');
      throw error;
    }
  }

  /**
   * Get all programs with COD recognition
   * @returns {Promise<Array>} - List of COD programs
   */
  async getCODPrograms() {
    try {
      if (!this.ensureAuthentication()) {
        // Return filtered mock data if available
        if (this.mockData) {
          const allPrograms = this.mockData.flatMap(school => 
            school.programs.flatMap(category => 
              category.items.filter(program => program.recognition === 'COD')
            )
          );
          return allPrograms;
        }
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.get('/accreditation/getByRecognitionStatus?status=COD');
      return response.data;
    } catch (error) {
      this.handleError(error, 'Fetching COD programs');
      throw error;
    }
  }

  /**
   * Search programs by name
   * @param {string} query - Search query string
   * @returns {Promise<Array>} - List of matching programs
   */
  async searchPrograms(query) {
    try {
      if (!this.ensureAuthentication()) {
        // Search in mock data if available
        if (this.mockData) {
          const allPrograms = this.mockData.flatMap(school => 
            school.programs.flatMap(category => 
              category.items.filter(program => 
                program.name.toLowerCase().includes(query.toLowerCase())
              )
            )
          );
          return allPrograms;
        }
        throw new Error('Authentication required');
      }
      
      const response = await apiClient.get('/accreditation/searchAccreditations', {
        params: { title: query }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Searching programs');
      throw error;
    }
  }

  /**
   * Filter programs by criteria
   * @param {Object} filters - Filter criteria
   * @param {string} [filters.programType] - Program type
   * @param {number} [filters.accreditationLevel] - Accreditation level
   * @param {string} [filters.recognition] - Recognition status
   * @returns {Promise<Array>} - List of filtered programs
   */
  async filterPrograms(filters) {
    try {
      if (!this.ensureAuthentication()) {
        // Filter mock data if available
        if (this.mockData) {
          let allPrograms = this.mockData.flatMap(school => 
            school.programs.flatMap(category => 
              category.items.map(program => ({...program, schoolName: school.name, category: category.category}))
            )
          );
          
          // Apply filters
          if (filters.programType) {
            allPrograms = allPrograms.filter(p => p.category === filters.programType);
          }
          if (filters.accreditationLevel) {
            allPrograms = allPrograms.filter(p => p.level === parseInt(filters.accreditationLevel));
          }
          if (filters.recognition) {
            allPrograms = allPrograms.filter(p => p.recognition === filters.recognition);
          }
          
          return allPrograms;
        }
        throw new Error('Authentication required');
      }
      
      let endpoint = '/accreditation/getAllAccreditations';
      let params = {};
      
      if (filters.recognition) {
        endpoint = '/accreditation/getByRecognitionStatus';
        params.status = filters.recognition;
      } else if (filters.accreditationLevel) {
        endpoint = '/accreditation/getByAccreditationLevel';
        params.level = this.mapNumericLevelToString(filters.accreditationLevel);
      }
      
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Filtering programs');
      throw error;
    }
  }
  
  /**
   * Map numeric level to string format
   * @param {number} level - Numeric level (1-4)
   * @returns {string} - Level in string format
   */
  mapNumericLevelToString(level) {
    switch(Number(level)) {
      case 1: return 'Level I';
      case 2: return 'Level II';
      case 3: return 'Level III';
      case 4: return 'Level IV';
      default: return '';
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    // Check if it's an authentication error
    if (error.response && error.response.status === 401) {
      console.error(`Authentication error ${context ? ' - ' + context : ''}. Please log in.`);
      // Optionally redirect to login page
      // window.location.href = '/login';
    } else {
      console.error(`Accreditation service error${context ? ' - ' + context : ''}:`, error);
    }
    // You could add additional error handling here (e.g., notifications, logging)
  }
}

export default new AccreditationService(); 