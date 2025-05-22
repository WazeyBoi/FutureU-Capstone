
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
 * Get accreditations for a specific school program
 * @param {number} schoolProgramId - The ID of the school program
 * @returns {Promise} Promise with filtered accreditations data
 */
export const getAccreditationsBySchoolProgram = (schoolProgramId) => {
  return apiClient.get(`/accreditation/getAccreditationsBySchoolProgram/${schoolProgramId}`);
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
            // Get school programs with accreditations already attached
            const schoolProgramsResponse = await apiClient.get(`/schoolprogram/getSchoolProgramsBySchool/${school.schoolId}`, {
              headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
            });
            const schoolPrograms = schoolProgramsResponse.data;
            console.log(`Programs for school ${school.name}:`, schoolPrograms);
            
            // Get all programs for this school
            const allPrograms = [];
            
            // Process school programs and their accreditations
            for (const schoolProgram of schoolPrograms) {
              if (schoolProgram.program) {
                // Add the program with its accreditation (singular, not a list)
                allPrograms.push({
                  program: schoolProgram.program,
                  schoolProgram: schoolProgram,
                  accreditation: schoolProgram.accreditation
                });
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
              
              // Get accreditation data from the single accreditation property
              let accreditationStatus = 'Not Accredited';
              let accreditingBody = '-';
              let recognitionStatus = null;
              let level = 0;
              
              // Check if program has accreditation data
              if (item.accreditation) {
                const accreditation = item.accreditation;
                
                // Set accreditation status and level
                if (accreditation.accreditationLevel) {
                  accreditationStatus = `${accreditation.accreditationLevel} Accredited`;
                  level = this.parseAccreditationLevel(accreditation.accreditationLevel);
                }
                
                // Set accrediting body
                if (accreditation.accreditingBody) {
                  accreditingBody = accreditation.accreditingBody;
                }
                
                // Set recognition status (COE, COD)
                if (accreditation.recognitionStatus && accreditation.recognitionStatus !== 'None') {
                  recognitionStatus = accreditation.recognitionStatus;
                }
              }
              
              // Debug log
              if (item.accreditation) {
                console.log(`Accreditation found for ${program.programName}:`, {
                  accredId: item.accreditation.accredId,
                  level: level,
                  accreditingBody: accreditingBody,
                  recognitionStatus: recognitionStatus
                });
              }
              
              // Create program object
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
              totalAccredited: Object.values(programCategories)
                .flatMap(progs => progs)
                .filter(p => p.level > 0).length,
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
    
    // Handle PTC-ACBET Full Accreditation
    if (levelString.includes('Full')) return 4; // Treat Full Accreditation as Level IV
    
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
      
      // This will now return school programs with all of their accreditations attached
      const schoolWithAccreditation = await this.getAllAccreditationData().then(
        schools => schools.find(s => s.id === schoolId)
      );
      
      return schoolWithAccreditation;
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
   * @param {string} query - Search term
   * @returns {Promise<Array>} - List of matching programs
   */
  async searchPrograms(query) {
    try {
      if (!query) return [];
      
      // If using mock data, search locally
      if (!this.isUserAuthenticated() && this.mockData) {
        const lowerQuery = query.toLowerCase();
        return this.mockData.flatMap(school => 
            school.programs.flatMap(category => 
              category.items.filter(program => 
              program.name.toLowerCase().includes(lowerQuery)
            ).map(program => ({
              ...program,
              schoolName: school.name
            }))
            )
          );
      }
      
      // Fetch all programs and filter client-side
      const allSchools = await this.getAllAccreditationData();
      const lowerQuery = query.toLowerCase();
      
      return allSchools.flatMap(school => 
        school.programs.flatMap(category => 
          category.items.filter(program => 
            program.name.toLowerCase().includes(lowerQuery)
          ).map(program => ({
            ...program,
            schoolName: school.name
          }))
        )
      );
    } catch (error) {
      this.handleError(error, 'Searching programs');
      return [];
    }
  }

  /**
   * Filter programs by criteria
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} - List of filtered programs
   */
  async filterPrograms(filters) {
    try {
      // If using mock data, filter locally
      if (!this.isUserAuthenticated() && this.mockData) {
          let allPrograms = this.mockData.flatMap(school => 
            school.programs.flatMap(category => 
            category.items.map(program => ({
              ...program,
              schoolName: school.name,
              category: category.category
            }))
            )
          );
          
          // Apply filters
        if (filters.schoolId) {
          const school = this.mockData.find(s => s.id === parseInt(filters.schoolId));
          if (school) {
            allPrograms = allPrograms.filter(p => p.schoolName === school.name);
          }
        }
        
          if (filters.programType) {
            allPrograms = allPrograms.filter(p => p.category === filters.programType);
          }
        
          if (filters.accreditationLevel) {
            allPrograms = allPrograms.filter(p => p.level === parseInt(filters.accreditationLevel));
          }
        
          if (filters.recognition) {
            allPrograms = allPrograms.filter(p => p.recognition === filters.recognition);
          }
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          allPrograms = allPrograms.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.schoolName.toLowerCase().includes(searchTerm)
          );
        }
        
        if (filters.accreditedOnly) {
          allPrograms = allPrograms.filter(p => p.level > 0);
        }
          
          return allPrograms;
        }
      
      // Fetch all programs and filter client-side
      const allSchools = await this.getAllAccreditationData();
      let allPrograms = allSchools.flatMap(school => 
        school.programs.flatMap(category => 
          category.items.map(program => ({
            ...program,
            schoolName: school.name,
            category: category.category
          }))
        )
      );
      
      // Apply filters
      if (filters.schoolId) {
        const schoolId = parseInt(filters.schoolId);
        const school = allSchools.find(s => s.id === schoolId);
        if (school) {
          allPrograms = allPrograms.filter(p => p.schoolName === school.name);
        }
      }
      
      if (filters.programType) {
        allPrograms = allPrograms.filter(p => p.category === filters.programType);
      }
      
      if (filters.accreditationLevel) {
        allPrograms = allPrograms.filter(p => p.level === parseInt(filters.accreditationLevel));
      }
      
      if (filters.recognition) {
        allPrograms = allPrograms.filter(p => p.recognition === filters.recognition);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        allPrograms = allPrograms.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.schoolName.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.accreditedOnly) {
        allPrograms = allPrograms.filter(p => p.level > 0);
      }
      
      return allPrograms;
    } catch (error) {
      this.handleError(error, 'Filtering programs');
      return [];
    }
  }
  
  /**
   * Map numeric level to string
   * @param {number} level - Numeric level (1-4)
   * @returns {string} - Level string
   */
  mapNumericLevelToString(level) {
    switch(level) {
      case 4: return "Level IV";
      case 3: return "Level III";
      case 2: return "Level II";
      case 1: return "Level I";
      default: return "None";
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - The error object
   * @param {string} context - Context description for the error
   */
  handleError(error, context = '') {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    const status = error.response?.status;
    
    if (status === 401) {
      console.error(`Authentication error (${context}):`, message);
    } else if (status === 404) {
      console.error(`Not found (${context}):`, message);
    } else {
      console.error(`API error (${context}):`, message);
    }
  }
}

// Create an instance of the AccreditationService
const accreditationService = new AccreditationService();
export default accreditationService; 

