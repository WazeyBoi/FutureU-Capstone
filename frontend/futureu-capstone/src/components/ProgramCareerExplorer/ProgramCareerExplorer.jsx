import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  Briefcase, 
  Users,
  Search,
  Filter,
  X,
  ChevronDown,
  School,
  Award,
  TrendingUp,
  Building,
  Clock,
  MapPin,
  GraduationCap,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react';
import apiClient from '../../services/api';
import dataCacheService from '../../services/dataCache';
import programCareerPathService from '../../services/programCareerPathService';
import CareerPathCard from './CareerPathCard';

const ProgramCareerExplorer = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [careerPathsData, setCareerPathsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [stats, setStats] = useState({
    totalPrograms: 0,
    totalCareerPaths: 0,
    totalCareers: 0
  });
  
  // States for actual data with caching support
  const [schools, setSchools] = useState([]);
  const [careerPaths, setCareerPaths] = useState([]);
  const [schoolPrograms, setSchoolPrograms] = useState([]);
  // NEW: Add state to store filtered programs by career path
  const [programsByCareerPath, setProgramsByCareerPath] = useState([]);
  
  // Search and Filter States - UPDATED WITH REAL FILTERS
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    school: 'all',        // Filter by school
    careerPath: 'all'     // Filter by career path
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const programsPerPage = 12;

  // Helper function to get cached data or fetch from API (similar to CareerPathways)
  const getCachedData = useCallback(async (cacheKey, apiUrl) => {
    // Check cache first
    const cached = dataCacheService.get(cacheKey);
    if (cached) {
      return cached;
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
      dataCacheService.setLoading(cacheKey, true);
      
      const response = await apiClient.get(apiUrl);
      const data = response.data || [];
      
      // Cache the result
      dataCacheService.set(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${cacheKey}:`, error);
      throw error;
    } finally {
      dataCacheService.setLoading(cacheKey, false);
    }
  }, []);

  // Toggle description expansion
  const toggleDescription = (programId, e) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId);
    } else {
      newExpanded.add(programId);
    }
    setExpandedDescriptions(newExpanded);
  };

  // Enhanced data fetching with caching (similar to CareerPathways)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all data using cached service and helper
        const [programsData, schoolsData, careerPathsData, schoolProgramsData, careersData] = await Promise.all([
          getCachedData('programs', '/program/getAllPrograms'),
          getCachedData('schools', '/school/getAllSchools'),
          getCachedData('careerPaths', '/careerpath/getAll'),
          getCachedData('schoolPrograms', '/schoolprogram/getAllSchoolPrograms'),
          getCachedData('careers', '/career/getAllCareers'),
        ]);

        setPrograms(programsData);
        setSchools(schoolsData);
        setCareerPaths(careerPathsData);
        setSchoolPrograms(schoolProgramsData);

        // Update stats with REAL data
        setStats({
          totalPrograms: programsData.length,
          totalCareerPaths: careerPathsData.length,
          totalCareers: careersData.length
        });
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        // Set fallback numbers if API fails
        setStats({
          totalPrograms: 0,
          totalCareerPaths: 0,
          totalCareers: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [getCachedData]);

  // NEW: Fetch programs by career path when career path filter changes
  useEffect(() => {
    const fetchProgramsByCareerPath = async () => {
      if (filterOptions.careerPath === 'all') {
        setProgramsByCareerPath([]);
        return;
      }

      try {
        setLoading(true);
        
        // Use the backend API endpoint you provided
        const cacheKey = `programsByCareerPath_${filterOptions.careerPath}`;
        const cachedPrograms = dataCacheService.get(cacheKey);
        
        let programsForCareerPath;
        if (cachedPrograms) {
          programsForCareerPath = cachedPrograms;
        } else {
          const response = await apiClient.get(`/program-career-path/getProgramsByCareerPath/${filterOptions.careerPath}`);
          programsForCareerPath = response.data || [];
          
          // Cache the result
          dataCacheService.set(cacheKey, programsForCareerPath);
        }
        
        setProgramsByCareerPath(programsForCareerPath);
        
      } catch (error) {
        console.error(`Error fetching programs for career path ${filterOptions.careerPath}:`, error);
        setProgramsByCareerPath([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramsByCareerPath();
  }, [filterOptions.careerPath]);

  // Add a force refresh function for testing (similar to CareerPathways)
  const handleForceRefresh = useCallback(async () => {
    setLoading(true);
    try {
      // Clear all caches
      dataCacheService.clear('programs');
      dataCacheService.clear('schools');
      dataCacheService.clear('careerPaths');
      dataCacheService.clear('schoolPrograms');
      dataCacheService.clear('careers');
      dataCacheService.clearByPattern('programsByCareerPath_');
      
      // Force refresh all data
      const [programsData, schoolsData, careerPathsData, schoolProgramsData, careersData] = await Promise.all([
        getCachedData('programs', '/program/getAllPrograms'),
        getCachedData('schools', '/school/getAllSchools'),
        getCachedData('careerPaths', '/careerpath/getAll'),
        getCachedData('schoolPrograms', '/schoolprogram/getAllSchoolPrograms'),
        getCachedData('careers', '/career/getAllCareers'),
      ]);

      setPrograms(programsData);
      setSchools(schoolsData);
      setCareerPaths(careerPathsData);
      setSchoolPrograms(schoolProgramsData);

      setStats({
        totalPrograms: programsData.length,
        totalCareerPaths: careerPathsData.length,
        totalCareers: careersData.length
      });
      
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [getCachedData]);

  // UPDATED Filter programs based on search and REAL filters using backend API
  const filteredPrograms = useMemo(() => {
    let basePrograms = programs;

    // UPDATED: If career path filter is active, use backend-filtered programs
    if (filterOptions.careerPath !== 'all') {
      basePrograms = programsByCareerPath;
    }

    return basePrograms.filter(program => {
      const matchesSearch = program.programName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (program.description && program.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by school - check if program is offered by selected school
      let matchesSchool = true;
      if (filterOptions.school !== 'all') {
        const programOfferedBySchool = schoolPrograms.some(sp => 
          sp.program?.programId === program.programId && 
          sp.school?.schoolId === parseInt(filterOptions.school)
        );
        matchesSchool = programOfferedBySchool;
      }

      // Career path filter is now handled by using programsByCareerPath
      // No need for additional filtering here since backend already filtered
      
      return matchesSearch && matchesSchool;
    });
  }, [programs, programsByCareerPath, searchTerm, filterOptions, schoolPrograms]);

  // Pagination logic (memoized)
  const indexOfLastProgram = currentPage * programsPerPage;
  const indexOfFirstProgram = indexOfLastProgram - programsPerPage;
  const currentPrograms = useMemo(() => 
    filteredPrograms.slice(indexOfFirstProgram, indexOfLastProgram),
    [filteredPrograms, indexOfFirstProgram, indexOfLastProgram]
  );
  const totalPages = useMemo(() => 
    Math.ceil(filteredPrograms.length / programsPerPage),
    [filteredPrograms.length]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterOptions, searchTerm]);

  // Handle program selection - USING programCareerPathService
  const handleProgramSelect = async (program) => {
    setSelectedProgram(program);
    setSearchTerm(program.programName);
    setShowDropdown(false);
    setLoading(true);

    try {
      // Use the programCareerPathService for cached data
      const careerPathsResponse = await programCareerPathService.getCareerPathsByProgram(program.programId);
      
      // Transform data to match expected format with careers
      const careerPathsWithCareers = await Promise.all(
        careerPathsResponse.map(async (careerPath) => {
          try {
            // Get careers for this career path
            const careersResponse = await getCachedData(
              `careersByCareerPath_${careerPath.careerPathId}`,
              `/career-career-path/getCareersByCareerPath/${careerPath.careerPathId}`
            );
            
            return {
              ...careerPath,
              careers: careersResponse || []
            };
          } catch (error) {
            console.error(`Error fetching careers for career path ${careerPath.careerPathId}:`, error);
            return {
              ...careerPath,
              careers: []
            };
          }
        })
      );

      setCareerPathsData({ 
        programId: program.programId,
        careerPaths: careerPathsWithCareers 
      });
    } catch (error) {
      console.error('Error fetching career paths:', error);
      setCareerPathsData({ careerPaths: [] });
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedProgram(null);
    setCareerPathsData(null);
    setSearchTerm('');
    setCurrentPage(1);
    setShowDropdown(false);
    setExpandedDescriptions(new Set());
  };

  // UPDATED Reset filters
  const resetFilters = useCallback(() => {
    setFilterOptions({
      school: 'all',
      careerPath: 'all'
    });
    setProgramsByCareerPath([]); // Clear career path filtered programs
    setCurrentPage(1);
  }, []);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // UPDATED Filter Menu Component with REAL filters
  const FilterMenu = () => (
    <AnimatePresence>
      {showFilterMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 z-50 w-80"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#2B3E4E] text-lg">FILTER PROGRAMS</h3>
            <button
              onClick={() => setShowFilterMenu(false)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* School Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <School className="w-4 h-4 mr-2 text-[#2B3E4E]" />
                  Filter by School
                </div>
              </label>
              <select
                value={filterOptions.school}
                onChange={(e) => setFilterOptions({...filterOptions, school: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B]"
              >
                <option value="all">All Schools</option>
                {schools.map(school => (
                  <option key={school.schoolId} value={school.schoolId}>
                    {school.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Show programs offered by specific schools
              </p>
            </div>

            {/* Career Path Filter - ENHANCED */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-2 text-[#FFB71B]" />
                  Filter by Career Path
                </div>
              </label>
              <select
                value={filterOptions.careerPath}
                onChange={(e) => setFilterOptions({...filterOptions, careerPath: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B]"
              >
                <option value="all">All Career Paths</option>
                {careerPaths.map(careerPath => (
                  <option key={careerPath.careerPathId} value={careerPath.careerPathId}>
                    {careerPath.careerPathName}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Show programs that lead to specific career paths
              </p>
              {filterOptions.careerPath !== 'all' && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                  <div className="flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    Showing {programsByCareerPath.length} programs for this career path
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilterMenu(false)}
                className="flex-1 px-4 py-2 bg-[#FFB71B] text-[#2B3E4E] rounded-lg font-semibold hover:bg-[#FFB71B]/90 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Loading state
  if (loading && programs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB71B] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading program explorer...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleForceRefresh}
            className="px-4 py-2 bg-[#FFB71B] text-[#2B3E4E] rounded-lg font-semibold hover:bg-[#FFB71B]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Header with Wave Pattern - Similar to Academic Explorer */}
      <div className="relative bg-[#2B3E4E] text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/pattern-bg.png')] opacity-10 pointer-events-none"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center animate-fade-in-up"
          >
            <span className="text-[#FFB71B]">Program Explorer</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-center text-white/90 animate-fade-in-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            Discover career paths and opportunities for your chosen academic program. 
            Explore what your future could look like.
          </motion.p>
          
          {/* Stats Cards - Dynamic Data from REAL APIs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto w-full animate-fade-in-up"
            style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
          >
            <div className="bg-[#1B2836]/80 backdrop-blur-sm rounded-lg p-6 shadow-lg flex flex-col items-center transition-all duration-200 hover:scale-105">
              <BookOpen className="w-8 h-8 text-[#FFB71B] mb-3" />
              <h3 className="text-2xl font-bold text-white">{stats.totalPrograms}</h3>
              <p className="text-white/80 text-center">Academic Programs</p>
            </div>
            <div className="bg-[#1B2836]/80 backdrop-blur-sm rounded-lg p-6 shadow-lg flex flex-col items-center transition-all duration-200 hover:scale-105">
              <Target className="w-8 h-8 text-[#FFB71B] mb-3" />
              <h3 className="text-2xl font-bold text-white">{stats.totalCareerPaths}</h3>
              <p className="text-white/80 text-center">Career Paths</p>
            </div>
            <div className="bg-[#1B2836]/80 backdrop-blur-sm rounded-lg p-6 shadow-lg flex flex-col items-center transition-all duration-200 hover:scale-105">
              <Briefcase className="w-8 h-8 text-[#FFB71B] mb-3" />
              <h3 className="text-2xl font-bold text-white">{stats.totalCareers}</h3>
              <p className="text-white/80 text-center">Career Opportunities</p>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative wave divider - Exactly like Academic Explorer */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Search Header - Similar to Academic Explorer */}
      <div className="bg-white shadow-sm sticky top-0 z-30 backdrop-blur-sm bg-white/90">
        <div className="max-w-full mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative search-dropdown-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search programs by name or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FFB71B] focus:border-[#FFB71B] transition-all shadow-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      clearSelection();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Program Dropdown */}
              {showDropdown && searchTerm && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-80 overflow-y-auto">
                  {filteredPrograms.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No programs found</p>
                    </div>
                  ) : (
                    <div className="py-2">
                      {filteredPrograms.slice(0, 10).map((program) => (
                        <button
                          key={program.programId}
                          onClick={() => handleProgramSelect(program)}
                          className="w-full px-4 py-3 text-left hover:bg-[#FFB71B]/10 focus:bg-[#FFB71B]/10 focus:outline-none transition-colors group"
                        >
                          <div className="flex items-start">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#1D63A1] to-[#2B3E4E] rounded-lg flex items-center justify-center mr-3 group-hover:scale-105 transition-transform">
                              <BookOpen className="w-5 h-5 text-[#FFB71B]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-[#2B3E4E] group-hover:text-[#1D63A1] transition-colors">
                                {program.programName}
                              </h3>
                              {program.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {program.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="bg-white text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition border border-gray-200 shadow-sm hover:shadow flex items-center gap-2"
              >
                <Filter className="w-5 h-5 text-[#FFB71B]" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>
              <FilterMenu />
            </div>


            {/* Clear Selection Button */}
            {selectedProgram && (
              <button
                onClick={clearSelection}
                className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition border border-red-200"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* UPDATED Active Filters Display */}
          {(filterOptions.school !== 'all' || filterOptions.careerPath !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-2">Active filters:</span>
              {filterOptions.school !== 'all' && (
                <span className="px-3 py-1 bg-[#2B3E4E]/10 text-[#2B3E4E] rounded-full text-sm font-medium flex items-center">
                  <School className="w-3 h-3 mr-1" />
                  {schools.find(s => s.schoolId === parseInt(filterOptions.school))?.name || 'Unknown School'}
                </span>
              )}
              {filterOptions.careerPath !== 'all' && (
                <span className="px-3 py-1 bg-[#FFB71B]/10 text-[#2B3E4E] rounded-full text-sm font-medium flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  {careerPaths.find(cp => cp.careerPathId === parseInt(filterOptions.careerPath))?.careerPathName || 'Unknown Career Path'}
                  <span className="ml-2 bg-[#FFB71B]/20 px-2 py-0.5 rounded text-xs">
                    {programsByCareerPath.length} programs
                  </span>
                </span>
              )}
              {(filterOptions.school !== 'all' || filterOptions.careerPath !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear All
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - FULL WIDTH */}
      <div className="w-full px-4 py-8">
        {!selectedProgram ? (
          /* Program Selection View - FULL WIDTH */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FFB71B] to-[#FF9800] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#2B3E4E] mb-2">Choose Your Academic Path</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Search for an academic program above to discover its career opportunities and pathways. 
                Use filters to narrow down your options by school or career path.
              </p>
            </div>

            {/* Program Grid - ENHANCED WITH FULL DESCRIPTIONS */}
            {filteredPrograms.length > 0 && !searchTerm && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#2B3E4E]">
                    Available Programs ({filteredPrograms.length})
                    {filterOptions.careerPath !== 'all' && (
                      <span className="ml-2 text-sm text-[#FFB71B] font-normal">
                        - filtered by {careerPaths.find(cp => cp.careerPathId === parseInt(filterOptions.careerPath))?.careerPathName}
                      </span>
                    )}
                  </h3>
                  <div className="text-sm text-gray-500">
                    Click on any program to explore career paths
                  </div>
                </div>
                
                {/* UPDATED GRID: More spacious layout for full descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {currentPrograms.map((program, index) => {
                    const isExpanded = expandedDescriptions.has(program.programId);
                    const hasLongDescription = program.description && program.description.length > 150;
                    
                    return (
                      <motion.div
                        key={program.programId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleProgramSelect(program)}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer group hover:border-[#FFB71B] flex flex-col min-h-[320px]"
                      >
                        {/* Program Header */}
                        <div className="flex flex-col items-center text-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-[#1D63A1] to-[#2B3E4E] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                            <BookOpen className="w-8 h-8 text-[#FFB71B]" />
                          </div>
                          <h4 className="font-bold text-[#2B3E4E] group-hover:text-[#1D63A1] transition-colors text-lg leading-tight mb-3">
                            {program.programName}
                          </h4>
                        </div>

                        {/* Program Description */}
                        {program.description && (
                          <div className="flex-1 flex flex-col">
                            <div className="mb-4">
                              <div className="flex items-center mb-2">
                                <div className="w-4 h-4 bg-[#FFB71B]/20 rounded flex items-center justify-center mr-2">
                                  <BookOpen className="w-2 h-2 text-[#FFB71B]" />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Program Overview
                                </span>
                              </div>
                              
                              {/* Full Description with Expand/Collapse */}
                              <div className="relative">
                                <p className={`text-sm text-gray-700 leading-relaxed text-justify transition-all duration-300 ${
                                  isExpanded || !hasLongDescription 
                                    ? 'line-clamp-none' 
                                    : 'line-clamp-4'
                                }`}>
                                  {program.description}
                                </p>
                                
                                {/* Gradient overlay for collapsed long descriptions */}
                                {hasLongDescription && !isExpanded && (
                                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent"></div>
                                )}
                              </div>

                              {/* Read More/Less Button */}
                              {hasLongDescription && (
                                <button
                                  onClick={(e) => toggleDescription(program.programId, e)}
                                  className="mt-3 flex items-center text-xs font-semibold text-[#1D63A1] hover:text-[#FFB71B] transition-colors group/btn"
                                >
                                  {isExpanded ? (
                                    <>
                                      <EyeOff className="w-3 h-3 mr-1 group-hover/btn:scale-110 transition-transform" />
                                      Show Less
                                      <ChevronUp className="w-3 h-3 ml-1" />
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-3 h-3 mr-1 group-hover/btn:scale-110 transition-transform" />
                                      Read More
                                      <ChevronDown className="w-3 h-3 ml-1" />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Call to Action */}
                            <div className="mt-auto pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-center text-xs text-gray-500 group-hover:text-[#1D63A1] transition-colors">
                                <Target className="w-3 h-3 mr-1" />
                                Click to explore career paths
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            setCurrentPage(page);
                            setExpandedDescriptions(new Set()); // Reset expanded descriptions on page change
                          }}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            currentPage === page
                              ? 'bg-[#FFB71B] text-[#2B3E4E] font-semibold shadow-lg'
                              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          /* Career Paths Results - FULL WIDTH LAYOUT */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Selected Program Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1D63A1] to-[#2B3E4E] rounded-2xl flex items-center justify-center mr-4">
                    <BookOpen className="w-8 h-8 text-[#FFB71B]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2B3E4E]">{selectedProgram.programName}</h2>
                    <p className="text-gray-600">Career opportunities and pathways</p>
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {selectedProgram.description && (
                <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#1D63A1] to-[#2B3E4E] rounded-lg flex items-center justify-center mr-3">
                      <BookOpen className="w-4 h-4 text-[#FFB71B]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#2B3E4E]">Program Description</h3>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 text-justify leading-relaxed text-base whitespace-pre-line">
                      {selectedProgram.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Career Paths - FULL WIDTH LAYOUT */}
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB71B] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading career paths...</p>
              </div>
            ) : careerPathsData?.careerPaths?.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Career Paths Found</h3>
                <p className="text-gray-500">
                  This program doesn't have any associated career paths yet. 
                  Try selecting a different program.
                </p>
              </div>
            ) : (
              /* CHANGED TO FULL WIDTH - REMOVED max-w-4xl CONSTRAINT */
              <div className="w-full space-y-8">
                {careerPathsData?.careerPaths?.map((careerPath, index) => (
                  <CareerPathCard
                    key={careerPath.careerPathId}
                    careerPath={careerPath}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProgramCareerExplorer;