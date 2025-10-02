import apiClient from './api';
import authService from './authService';
import dataCacheService from './dataCache';

/**
 * Service for handling accreditation-related API requests with caching
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
   * Get all accreditation data for schools and programs with caching
   * @param {boolean} forceRefresh - Force a refresh of the data, bypassing any caching
   * @returns {Promise<Array>} - List of schools with accreditation data
   */
  async getAllAccreditationData(forceRefresh = false) {
    const cacheKey = 'accreditationData';
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = dataCacheService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }
    
    // Check if already loading
    if (dataCacheService.isLoading(cacheKey)) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!dataCacheService.isLoading(cacheKey)) {
            clearInterval(checkInterval);
            resolve(dataCacheService.get(cacheKey));
          }
        }, 100);
      });
    }

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

      dataCacheService.setLoading(cacheKey, true);

      // Get list of schools
      const schoolsResponse = await apiClient.get('/school/getAllSchools', {
        timeout: 30000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const schools = schoolsResponse.data || [];
      
      // Get school programs for each school
      const schoolsWithAccreditation = await Promise.all(
        schools.map(async (school) => {
          try {
            const schoolProgramsResponse = await apiClient.get(
              `/schoolprogram/getSchoolProgramsBySchool/${school.schoolId}`,
              { timeout: 15000 }
            );
            
            const schoolPrograms = schoolProgramsResponse.data || [];
            
            // Group programs by category
            const programCategories = {};
            
            for (const item of schoolPrograms) {
              // Get the program information
              const program = item.program;
              if (!program) continue;
              
              // Determine category based on program name or type
              const category = program.programName?.toLowerCase().includes('master') || 
                             program.programName?.toLowerCase().includes('phd') ||
                             program.programName?.toLowerCase().includes('doctor')
                             ? 'Graduate Programs' 
                             : 'Undergraduate Programs';
              
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
              
              // Create program object
              programCategories[category].push({
                name: program.programName,
                description: program.description,
                // Map accreditation data to the expected format
                accreditationStatus: accreditationStatus,
                accreditingBody: accreditingBody,
                recognition: recognitionStatus,
                level: level,
                // Add accreditation object with title and description
                accreditation: item.accreditation ? {
                  title: item.accreditation.title,
                  description: item.accreditation.description,
                  level: level,
                  accreditingBody: accreditingBody,
                  recognition: recognitionStatus,
                  status: accreditationStatus
                } : null
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
              location: school.location,
              type: school.type,
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
              location: school.location,
              type: school.type,
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
      
      // Cache the result
      dataCacheService.set(cacheKey, schoolsWithAccreditation);
      
      return schoolsWithAccreditation;
    } catch (error) {
      this.handleError(error, 'Fetching accreditation data');
      
      // Return mock data on error if available
      if (this.mockData) {
        console.warn('API failed, falling back to mock data');
        return this.mockData;
      }
      
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
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
    
    // Handle Roman numerals only
    if (levelString.match(/^IV$/i)) return 4;
    if (levelString.match(/^III$/i)) return 3;
    if (levelString.match(/^II$/i)) return 2;
    if (levelString.match(/^I$/i)) return 1;
    
    // Handle numeric formats
    if (levelString.includes('4')) return 4;
    if (levelString.includes('3')) return 3;
    if (levelString.includes('2')) return 2;
    if (levelString.includes('1')) return 1;
    
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
            program.name.toLowerCase().includes(lowerQuery) ||
            program.schoolName?.toLowerCase().includes(lowerQuery)
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
        
        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
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
      
      // If authenticated, fetch all data and filter
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
        const school = allSchools.find(s => s.id === parseInt(filters.schoolId));
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
      
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
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

// Keep existing named exports for backward compatibility
export const testAccreditationApi = () => {
  return apiClient.get('/accreditation/test');
};

export const getAllAccreditations = () => {
  return apiClient.get('/accreditation/getAllAccreditations');
};

export const getAccreditationById = (accredId) => {
  return apiClient.get(`/accreditation/getAccreditation/${accredId}`);
};

export const getAccreditationsBySchoolProgram = (schoolProgramId) => {
  return apiClient.get(`/accreditation/getAccreditationsBySchoolProgram/${schoolProgramId}`);
};

export const searchAccreditations = (title) => {
  return apiClient.get(`/accreditation/searchAccreditations?title=${title}`);
};

export const createAccreditation = (accreditationData) => {
  return apiClient.post('/accreditation/postAccreditationRecord', accreditationData);
};

export const updateAccreditation = (accredId, accreditationData) => {
  return apiClient.put(`/accreditation/putAccreditationDetails?accredId=${accredId}`, accreditationData);
};

export const deleteAccreditation = (accredId) => {
  return apiClient.delete(`/accreditation/deleteAccreditationDetails/${accredId}`);
};

export const getAccreditationsByRecognitionStatus = (status) => {
  return apiClient.get(`/accreditation/getByRecognitionStatus?status=${status}`);
};

export const getAccreditationsByAccreditingBody = (body) => {
  return apiClient.get(`/accreditation/getByAccreditingBody?body=${body}`);
};

export const getAccreditationsByAccreditationLevel = (level) => {
  return apiClient.get(`/accreditation/getByAccreditationLevel?level=${level}`);
};

