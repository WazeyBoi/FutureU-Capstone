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
import { schoolLogos } from '../AcademicExplorer/constants';

// Add bubble animation styles
const bubbleAnimationStyles = `
  @keyframes floatBubble1 {
    0% {
      transform: translateY(50px) scale(0);
      opacity: 0;
    }
    5% {
      opacity: 1;
      transform: translateY(40px) scale(0.3);
    }
    45% {
      transform: translateY(-120px) scale(1.2);
      opacity: 1;
    }
    47% {
      transform: translateY(-130px) scale(2.5);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-140px) scale(0);
      opacity: 0;
    }
    100% {
      transform: translateY(-300px) scale(0);
      opacity: 0;
    }
  }
  
  @keyframes floatBubble2 {
    0% {
      transform: translateY(50px) translateX(0) scale(0);
      opacity: 0;
    }
    8% {
      opacity: 1;
      transform: translateY(35px) translateX(5px) scale(0.4);
    }
    35% {
      transform: translateY(-100px) translateX(15px) scale(1);
      opacity: 1;
    }
    37% {
      transform: translateY(-110px) translateX(15px) scale(2.2);
      opacity: 0.2;
    }
    40% {
      transform: translateY(-120px) translateX(15px) scale(0);
      opacity: 0;
    }
    100% {
      transform: translateY(-350px) translateX(20px) scale(0);
      opacity: 0;
    }
  }
  
  @keyframes floatBubble3 {
    0% {
      transform: translateY(50px) translateX(0) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
      transform: translateY(30px) translateX(-5px) scale(0.2);
    }
    60% {
      transform: translateY(-80px) translateX(-12px) scale(0.9);
      opacity: 1;
    }
    63% {
      transform: translateY(-90px) translateX(-12px) scale(1.8);
      opacity: 0.4;
    }
    66% {
      transform: translateY(-100px) translateX(-12px) scale(0);
      opacity: 0;
    }
    100% {
      transform: translateY(-280px) translateX(-15px) scale(0);
      opacity: 0;
    }
  }
  
  @keyframes floatBubble4 {
    0% {
      transform: translateY(50px) scale(0) rotate(0deg);
      opacity: 0;
    }
    6% {
      opacity: 1;
      transform: translateY(40px) scale(0.3) rotate(30deg);
    }
    25% {
      transform: translateY(-60px) scale(1.1) rotate(90deg);
      opacity: 1;
    }
    28% {
      transform: translateY(-70px) scale(2.8) rotate(100deg);
      opacity: 0.1;
    }
    32% {
      transform: translateY(-80px) scale(0) rotate(110deg);
      opacity: 0;
    }
    100% {
      transform: translateY(-320px) scale(0) rotate(360deg);
      opacity: 0;
    }
  }
  
  @keyframes floatBubble5 {
    0% {
      transform: translateY(50px) translateX(0) scale(0);
      opacity: 0;
    }
    4% {
      opacity: 1;
      transform: translateY(45px) translateX(-3px) scale(0.2);
    }
    52% {
      transform: translateY(-70px) translateX(-8px) scale(0.8);
      opacity: 1;
    }
    55% {
      transform: translateY(-80px) translateX(-8px) scale(2.1);
      opacity: 0.3;
    }
    58% {
      transform: translateY(-90px) translateX(-8px) scale(0);
      opacity: 0;
    }
    100% {
      transform: translateY(-250px) translateX(-5px) scale(0);
      opacity: 0;
    }
  }
  
  @keyframes floatBubble6 {
    0% {
      transform: translateY(50px) scale(0);
      opacity: 0;
    }
    3% {
      opacity: 1;
      transform: translateY(45px) scale(0.1);
    }
    42% {
      transform: translateY(-90px) scale(1.3);
      opacity: 1;
    }
    45% {
      transform: translateY(-100px) scale(2.6);
      opacity: 0.2;
    }
    48% {
      transform: translateY(-110px) scale(0);
      opacity: 0;
    }
    100% {
      transform: translateY(-400px) scale(0);
      opacity: 0;
    }
  }
  
  .animate-float-bubble-1 {
    animation: floatBubble1 6s infinite linear;
    animation-delay: 0s;
  }
  .animate-float-bubble-2 {
    animation: floatBubble2 8s infinite linear;
    animation-delay: -2s;
  }
  .animate-float-bubble-3 {
    animation: floatBubble3 7s infinite linear;
    animation-delay: -4s;
  }
  .animate-float-bubble-4 {
    animation: floatBubble4 9s infinite linear;
    animation-delay: -1s;
  }
  .animate-float-bubble-5 {
    animation: floatBubble5 5s infinite linear;
    animation-delay: -3s;
  }
  .animate-float-bubble-6 {
    animation: floatBubble6 10s infinite linear;
    animation-delay: -5s;
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = bubbleAnimationStyles;
  document.head.appendChild(styleElement);
}

// Utility function to get school logo by school ID
const getSchoolLogo = (schoolId) => {
  return schoolLogos[schoolId] || null;
};

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
  const [careers, setCareers] = useState([]); // NEW: Add careers state
  // NEW: Add state to store filtered programs by career path
  const [programsByCareerPath, setProgramsByCareerPath] = useState([]);
  
  // NEW: States for reverse search (career → programs)
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [programsData, setProgramsData] = useState(null);
  const [searchMode, setSearchMode] = useState('program'); // 'program' or 'career'
  
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
  const [currentCareerPage, setCurrentCareerPage] = useState(1);
  const programsPerPage = 12;
  const careersPerPage = 12;

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
        setCareers(careersData); // NEW: Store careers data

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
      setCareers(careersData); // NEW: Store careers data

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

  // UPDATED Filter programs based on search and REAL filters using backend API with IMPROVED SEARCH RELEVANCE
  const filteredPrograms = useMemo(() => {
    let basePrograms = programs;

    // UPDATED: If career path filter is active, use backend-filtered programs
    if (filterOptions.careerPath !== 'all') {
      basePrograms = programsByCareerPath;
    }

    return basePrograms.filter(program => {
      const searchTermLower = searchTerm.toLowerCase();
      const programNameLower = program.programName.toLowerCase();
      const programDescLower = (program.description || '').toLowerCase();
      
      // IMPROVED SEARCH LOGIC: Multiple relevance checks
      const exactNameMatch = programNameLower === searchTermLower;
      const nameStartsWith = programNameLower.startsWith(searchTermLower);
      const nameContainsAllWords = searchTermLower.split(' ').every(word => 
        word.length > 0 && programNameLower.includes(word)
      );
      const nameContainsAnyWord = searchTermLower.split(' ').some(word => 
        word.length > 0 && programNameLower.includes(word)
      );
      const descriptionContainsAllWords = searchTermLower.split(' ').every(word => 
        word.length > 0 && programDescLower.includes(word)
      );
      const descriptionContainsAnyWord = searchTermLower.split(' ').some(word => 
        word.length > 0 && programDescLower.includes(word)
      );
      
      // Match if any of these conditions are true (ordered by relevance)
      const matchesSearch = exactNameMatch || nameStartsWith || nameContainsAllWords || 
                           nameContainsAnyWord || descriptionContainsAllWords || 
                           descriptionContainsAnyWord;
      
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
    }).sort((a, b) => {
      // ENHANCED SORTING: Prioritize results by relevance
      if (!searchTerm) return 0;
      
      const searchTermLower = searchTerm.toLowerCase();
      const aNameLower = a.programName.toLowerCase();
      const bNameLower = b.programName.toLowerCase();
      
      // Exact matches first
      const aExactMatch = aNameLower === searchTermLower;
      const bExactMatch = bNameLower === searchTermLower;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Name starts with search term
      const aStartsWith = aNameLower.startsWith(searchTermLower);
      const bStartsWith = bNameLower.startsWith(searchTermLower);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // All search words in name
      const aAllWordsInName = searchTermLower.split(' ').every(word => 
        word.length > 0 && aNameLower.includes(word)
      );
      const bAllWordsInName = searchTermLower.split(' ').every(word => 
        word.length > 0 && bNameLower.includes(word)
      );
      if (aAllWordsInName && !bAllWordsInName) return -1;
      if (!aAllWordsInName && bAllWordsInName) return 1;
      
      // Shorter names with matches are often more relevant
      const aWordMatches = searchTermLower.split(' ').filter(word => 
        word.length > 0 && aNameLower.includes(word)
      ).length;
      const bWordMatches = searchTermLower.split(' ').filter(word => 
        word.length > 0 && bNameLower.includes(word)
      ).length;
      
      if (aWordMatches !== bWordMatches) {
        return bWordMatches - aWordMatches; // More word matches first
      }
      
      // If same number of matches, prefer shorter names (often more specific)
      return a.programName.length - b.programName.length;
    });
  }, [programs, programsByCareerPath, searchTerm, filterOptions, schoolPrograms]);

  // ENHANCED: Filter careers with improved search relevance and sorting
  const filteredCareers = useMemo(() => {
    // If no search term, return all careers
    if (!searchTerm.trim()) {
      return careers.sort((a, b) => a.careerTitle.localeCompare(b.careerTitle));
    }

    return careers.filter(career => {
      const searchTermLower = searchTerm.toLowerCase();
      const titleLower = career.careerTitle.toLowerCase();
      const descLower = (career.careerDescription || '').toLowerCase();
      const industryLower = (career.industry || '').toLowerCase();
      
      // Enhanced search logic: Multiple relevance checks
      const exactTitleMatch = titleLower === searchTermLower;
      const titleStartsWith = titleLower.startsWith(searchTermLower);
      const titleContainsAllWords = searchTermLower.split(' ').every(word => 
        word.length > 0 && titleLower.includes(word)
      );
      const titleContainsAnyWord = searchTermLower.split(' ').some(word => 
        word.length > 0 && titleLower.includes(word)
      );
      const industryContainsSearch = industryLower.includes(searchTermLower);
      const descriptionContainsAllWords = searchTermLower.split(' ').every(word => 
        word.length > 0 && descLower.includes(word)
      );
      const descriptionContainsAnyWord = searchTermLower.split(' ').some(word => 
        word.length > 0 && descLower.includes(word)
      );
      
      // Match if any of these conditions are true (ordered by relevance)
      const matchesSearch = exactTitleMatch || titleStartsWith || titleContainsAllWords || 
                           titleContainsAnyWord || industryContainsSearch || 
                           descriptionContainsAllWords || descriptionContainsAnyWord;
      
      return matchesSearch;
    }).sort((a, b) => {
      // Enhanced sorting: Prioritize results by relevance
      if (!searchTerm) return a.careerTitle.localeCompare(b.careerTitle);
      
      const searchTermLower = searchTerm.toLowerCase();
      const aTitleLower = a.careerTitle.toLowerCase();
      const bTitleLower = b.careerTitle.toLowerCase();
      
      // Exact matches first
      const aExactMatch = aTitleLower === searchTermLower;
      const bExactMatch = bTitleLower === searchTermLower;
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;
      
      // Title starts with search term
      const aStartsWith = aTitleLower.startsWith(searchTermLower);
      const bStartsWith = bTitleLower.startsWith(searchTermLower);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // All search words in title
      const aAllWordsInTitle = searchTermLower.split(' ').every(word => 
        word.length > 0 && aTitleLower.includes(word)
      );
      const bAllWordsInTitle = searchTermLower.split(' ').every(word => 
        word.length > 0 && bTitleLower.includes(word)
      );
      if (aAllWordsInTitle && !bAllWordsInTitle) return -1;
      if (!aAllWordsInTitle && bAllWordsInTitle) return 1;
      
      // Industry matches
      const aIndustryMatch = (a.industry || '').toLowerCase().includes(searchTermLower);
      const bIndustryMatch = (b.industry || '').toLowerCase().includes(searchTermLower);
      if (aIndustryMatch && !bIndustryMatch) return -1;
      if (!aIndustryMatch && bIndustryMatch) return 1;
      
      // Shorter titles with matches are often more relevant
      return a.careerTitle.length - b.careerTitle.length;
    });
  }, [careers, searchTerm]);

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

  // Career pagination logic
  const indexOfLastCareer = currentCareerPage * careersPerPage;
  const indexOfFirstCareer = indexOfLastCareer - careersPerPage;
  const currentCareers = useMemo(() => 
    filteredCareers.slice(indexOfFirstCareer, indexOfLastCareer),
    [filteredCareers, indexOfFirstCareer, indexOfLastCareer]
  );
  const totalCareerPages = useMemo(() => 
    Math.ceil(filteredCareers.length / careersPerPage),
    [filteredCareers.length]
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setCurrentCareerPage(1);
  }, [filterOptions, searchTerm, searchMode]);

  // Handle program selection - CLEAN PRODUCTION VERSION: Using correct database relationships
  const handleProgramSelect = async (program) => {
    setSelectedProgram(program);
    setSearchTerm(program.programName);
    setShowDropdown(false);
    setLoading(true);

    try {
      // Step 1: Get career paths for this program (program_career_path)
      const careerPathsResponse = await programCareerPathService.getCareerPathsByProgram(program.programId);
      
      // Step 2: Get careers directly associated with this program (career_program) 
      const programCareersResponse = await getCachedData(
        `careersByProgram_${program.programId}`,
        `/careerprogram/getCareersByProgram/${program.programId}`
      );
      
      // Step 3: For each career path, get careers from career_career_path and find intersection
      const careerPathsWithCareers = await Promise.all(
        careerPathsResponse.map(async (careerPath) => {
          try {
            // Get careers for this career path using the correct endpoint
            const careerPathCareers = await getCachedData(
              `careersByCareerPath_${careerPath.careerPathId}`,
              `/career-career-path/getCareersByCareerPath/${careerPath.careerPathId}`
            );
            
            // Step 4: Find intersection - careers that exist in BOTH career_program AND career_career_path
            const intersectionCareers = programCareersResponse.filter(programCareer => 
              careerPathCareers.some(pathCareer => {
                const pathCareerId = pathCareer.careerId || pathCareer.id || pathCareer.career?.careerId;
                const programCareerId = programCareer.careerId || programCareer.id;
                return pathCareerId === programCareerId;
              })
            );
            
            return {
              ...careerPath,
              careers: intersectionCareers
            };
          } catch (error) {
            console.error(`Error processing career path ${careerPath.careerPathName}:`, error);
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
      console.error('Error fetching career paths and careers:', error);
      setCareerPathsData({ careerPaths: [] });
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle career selection for reverse search (career → programs)
  const handleCareerSelect = async (career) => {
    setSelectedCareer(career);
    setSearchTerm(career.careerTitle);
    setShowDropdown(false);
    setLoading(true);

    try {
      // Get programs directly associated with this career
      const programsResponse = await getCachedData(
        `programsByCareer_${career.careerId}`,
        `/careerprogram/getProgramsByCareer/${career.careerId}`
      );

      // Get additional program details and school information
      const programsWithDetails = await Promise.all(
        programsResponse.map(async (program) => {
          try {
            // Get schools offering this program
            const schoolsForProgram = schoolPrograms.filter(sp => 
              sp.program?.programId === program.programId
            ).map(sp => sp.school);

            return {
              ...program,
              schools: schoolsForProgram || []
            };
          } catch (error) {
            console.error(`Error fetching details for program ${program.programId}:`, error);
            return {
              ...program,
              schools: []
            };
          }
        })
      );

      setProgramsData({ 
        careerId: career.careerId,
        programs: programsWithDetails 
      });
    } catch (error) {
      console.error('Error fetching programs for career:', error);
      setProgramsData({ programs: [] });
    } finally {
      setLoading(false);
    }
  };

  // Function to scroll to programs section
  const scrollToProgramsSection = () => {
    const programsSection = document.getElementById('programs-section');
    if (programsSection) {
      programsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const clearSelection = () => {
    setSelectedProgram(null);
    setSelectedCareer(null); // NEW: Clear career selection
    setCareerPathsData(null);
    setProgramsData(null); // NEW: Clear programs data
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
          <p className="text-gray-600">Loading career program explorer...</p>
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
            <span className="text-[#FFB71B]">Career Program Explorer</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto mb-10 text-center text-white/90 animate-fade-in-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            Discover career paths and opportunities for your chosen academic program, 
            or explore which programs lead to your dream career. 
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
          {/* NEW: Search Mode Toggle */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => {
                  setSearchMode('program');
                  clearSelection();
                }}
                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                  searchMode === 'program'
                    ? 'bg-[#FFB71B] text-[#2B3E4E] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Search Programs
              </button>
              <button
                onClick={() => {
                  setSearchMode('career');
                  clearSelection();
                }}
                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                  searchMode === 'career'
                    ? 'bg-[#FFB71B] text-[#2B3E4E] shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Search Careers
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative search-dropdown-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchMode === 'program' 
                    ? "Search programs here..." 
                    : "Search careers here..."
                  }
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

              {/* Dynamic Dropdown - Programs or Careers */}
              {showDropdown && searchTerm && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-80 overflow-y-auto">
                  {searchMode === 'program' ? (
                    // Program Dropdown
                    filteredPrograms.length === 0 ? (
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
                    )
                  ) : (
                    // Enhanced Career Dropdown with detailed information
                    filteredCareers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No careers found</p>
                        <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {filteredCareers.slice(0, 10).map((career) => (
                          <button
                            key={career.careerId}
                            onClick={() => handleCareerSelect(career)}
                            className="w-full px-4 py-4 text-left hover:bg-[#FFB71B]/10 focus:bg-[#FFB71B]/10 focus:outline-none transition-colors group border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-start">
                              <div className="w-12 h-12 bg-[#FFB71B] rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform shadow-sm">
                                <Briefcase className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-[#2B3E4E] group-hover:text-[#1D63A1] transition-colors text-base mb-1">
                                  {career.careerTitle}
                                </h3>
                                
                                {/* Career Tags */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {career.industry && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium flex items-center">
                                      <Building className="w-3 h-3 mr-1" />
                                      {career.industry}
                                    </span>
                                  )}
                                  {career.salary && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium flex items-center">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      {career.salary}
                                    </span>
                                  )}
                                  {career.jobTrend && (
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium flex items-center">
                                      <Target className="w-3 h-3 mr-1" />
                                      {career.jobTrend}
                                    </span>
                                  )}
                                </div>
                                
                                {/* Career Description Preview */}
                                {career.careerDescription && (
                                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                    {career.careerDescription}
                                  </p>
                                )}
                                
                                {/* Click hint */}
                                <div className="mt-2 text-xs text-gray-400 group-hover:text-[#1D63A1] transition-colors">
                                  Click to view related programs
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            
            {/* Filter Button */}
            <div className="relative flex-shrink-0">
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
        {!selectedProgram && !selectedCareer ? (
          /* Default Selection View - FULL WIDTH */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#FFB71B] rounded-2xl flex items-center justify-center mx-auto mb-4">
                {searchMode === 'program' ? (
                  <BookOpen className="w-8 h-8 text-white" />
                ) : (
                  <Briefcase className="w-8 h-8 text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-[#2B3E4E] mb-2">
                {searchMode === 'program' 
                  ? 'Choose Your Academic Path' 
                  : 'Choose Your Career Path'
                }
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {searchMode === 'program'
                  ? 'Search for an academic program above to discover its career opportunities and pathways. Use filters to narrow down your options by school or career path.'
                  : 'Search for a career above to discover which academic programs can lead you to that career. Find the right educational path for your career goals.'
                }
              </p>
            </div>

            {/* Dynamic Grid - Programs or Careers */}
            {searchMode === 'program' && filteredPrograms.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#2B3E4E]">
                    {searchTerm ? `Programs matching "${searchTerm}"` : 'Available Programs'} ({filteredPrograms.length})
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
                          <div className="w-16 h-16 bg-[#232D35] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
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
                                  className="mt-3 flex items-center text-xs font-semibold text-[#232D35] hover:text-[#FFB71B] transition-colors group/btn"
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
                    <div className="flex gap-2 flex-wrap justify-center">
                      {/* Previous Button */}
                      {currentPage > 1 && (
                        <button
                          onClick={() => {
                            setCurrentPage(currentPage - 1);
                            setExpandedDescriptions(new Set());
                          }}
                          className="px-3 py-2 rounded-lg transition-all bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow flex items-center"
                        >
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                      )}
                      
                      {/* Page Numbers - Smart Pagination */}
                      {(() => {
                        const maxVisiblePages = 5;
                        const pages = [];
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        // Adjust startPage if we're near the end
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        
                        // Add first page and ellipsis if needed
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => {
                                setCurrentPage(1);
                                setExpandedDescriptions(new Set());
                              }}
                              className="px-4 py-2 rounded-lg transition-all bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-2 py-2 text-gray-400">...</span>
                            );
                          }
                        }
                        
                        // Add visible page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => {
                                setCurrentPage(i);
                                setExpandedDescriptions(new Set());
                              }}
                              className={`px-4 py-2 rounded-lg transition-all ${
                                currentPage === i
                                  ? 'bg-[#FFB71B] text-[#2B3E4E] font-semibold shadow-lg'
                                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        // Add ellipsis and last page if needed
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-2 py-2 text-gray-400">...</span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => {
                                setCurrentPage(totalPages);
                                setExpandedDescriptions(new Set());
                              }}
                              className="px-4 py-2 rounded-lg transition-all bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow"
                            >
                              {totalPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                      
                      {/* Next Button */}
                      {currentPage < totalPages && (
                        <button
                          onClick={() => {
                            setCurrentPage(currentPage + 1);
                            setExpandedDescriptions(new Set());
                          }}
                          className="px-3 py-2 rounded-lg transition-all bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow flex items-center"
                        >
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : searchMode === 'career' && filteredCareers.length > 0 ? (
              /* NEW: Careers Grid Display */
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#2B3E4E]">
                    {searchTerm ? `Careers matching "${searchTerm}"` : 'Available Careers'} ({filteredCareers.length})
                  </h3>
                  <div className="text-sm text-gray-500">
                    Click on any career to explore related programs
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {currentCareers.map((career, index) => (
                    <motion.div
                      key={career.careerId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCareerSelect(career)}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer group hover:border-[#FFB71B] flex flex-col min-h-[320px]"
                    >
                      {/* Career Header */}
                      <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-16 h-16 bg-[#FFB71B] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                          <Briefcase className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="font-bold text-[#2B3E4E] group-hover:text-[#1D63A1] transition-colors text-lg leading-tight mb-3">
                          {career.careerTitle}
                        </h4>
                      </div>

                      {/* Career Tags */}
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {career.industry && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {career.industry}
                          </span>
                        )}
                        {career.salary && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {career.salary}
                          </span>
                        )}
                        {career.jobTrend && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {career.jobTrend}
                          </span>
                        )}
                      </div>

                      {/* Career Description */}
                      {career.careerDescription && (
                        <div className="flex-1 flex flex-col">
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <div className="w-4 h-4 bg-[#FFB71B]/20 rounded flex items-center justify-center mr-2">
                                <Briefcase className="w-2 h-2 text-[#FFB71B]" />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Career Overview
                              </span>
                            </div>
                            
                            <p className="text-sm text-gray-700 leading-relaxed text-justify line-clamp-4">
                              {career.careerDescription}
                            </p>
                          </div>

                          {/* Call to Action */}
                          <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-center text-xs text-gray-500 group-hover:text-[#1D63A1] transition-colors">
                              <BookOpen className="w-3 h-3 mr-1" />
                              Click to explore related programs
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Career Pagination */}
                {totalCareerPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex gap-2 flex-wrap justify-center">
                      {/* Previous Button */}
                      {currentCareerPage > 1 && (
                        <button
                          onClick={() => setCurrentCareerPage(currentCareerPage - 1)}
                          className="px-3 py-2 rounded-lg transition-all bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow flex items-center"
                        >
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                      )}
                      
                      {/* Page Numbers - Smart Pagination */}
                      {(() => {
                        const maxVisiblePages = 5;
                        const pages = [];
                        let startPage = Math.max(1, currentCareerPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalCareerPages, startPage + maxVisiblePages - 1);
                        
                        // Adjust startPage if we're near the end
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        
                        // Add first page and ellipsis if needed
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => setCurrentCareerPage(1)}
                              className="px-4 py-2 rounded-lg transition-all bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-2 py-2 text-gray-400">...</span>
                            );
                          }
                        }
                        
                        // Add visible page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentCareerPage(i)}
                              className={`px-4 py-2 rounded-lg transition-all ${
                                currentCareerPage === i
                                  ? 'bg-[#FFB71B] text-[#2B3E4E] font-semibold shadow-lg'
                                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                        
                        // Add ellipsis and last page if needed
                        if (endPage < totalCareerPages) {
                          if (endPage < totalCareerPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-2 py-2 text-gray-400">...</span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalCareerPages}
                              onClick={() => setCurrentCareerPage(totalCareerPages)}
                              className="px-4 py-2 rounded-lg transition-all bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow"
                            >
                              {totalCareerPages}
                            </button>
                          );
                        }
                        
                        return pages;
                      })()}
                      
                      {/* Next Button */}
                      {currentCareerPage < totalCareerPages && (
                        <button
                          onClick={() => setCurrentCareerPage(currentCareerPage + 1)}
                          className="px-3 py-2 rounded-lg transition-all bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow flex items-center"
                        >
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        ) : selectedProgram ? (
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
                  <div className="w-16 h-16 bg-[#232D35] rounded-2xl flex items-center justify-center mr-4">
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
                <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#232D35] rounded-lg flex items-center justify-center mr-3">
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
        ) : selectedCareer ? (
          <AnimatePresence mode="wait">
            {/* Programs Results for Selected Career - FULL WIDTH LAYOUT */}
            <motion.div
              key={selectedCareer.careerId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ delay: 0.2 }}
            >
            {/* Selected Career Header - NEW LAYOUT */}
            <div className="relative mb-8">
              {/* Hero Card with Animated Bubbles */}
              <div className="relative bg-[#FFB71B] rounded-3xl p-8 shadow-2xl mb-8">
                {/* Animated Floating Bubbles - moved outside to allow full movement */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                  {/* Bubble 1 */}
                  <div className="absolute w-4 h-4 bg-white/20 rounded-full animate-float-bubble-1" 
                       style={{
                         left: '10%',
                         bottom: '0px'
                       }}>
                  </div>
                  {/* Bubble 2 */}
                  <div className="absolute w-6 h-6 bg-white/15 rounded-full animate-float-bubble-2" 
                       style={{
                         left: '20%',
                         bottom: '0px'
                       }}>
                  </div>
                  {/* Bubble 3 */}
                  <div className="absolute w-3 h-3 bg-white/25 rounded-full animate-float-bubble-3" 
                       style={{
                         left: '80%',
                         bottom: '0px'
                       }}>
                  </div>
                  {/* Bubble 4 */}
                  <div className="absolute w-5 h-5 bg-white/20 rounded-full animate-float-bubble-4" 
                       style={{
                         left: '70%',
                         bottom: '0px'
                       }}>
                  </div>
                  {/* Bubble 5 */}
                  <div className="absolute w-2 h-2 bg-white/30 rounded-full animate-float-bubble-5" 
                       style={{
                         left: '45%',
                         bottom: '0px'
                       }}>
                  </div>
                  {/* Bubble 6 */}
                  <div className="absolute w-7 h-7 bg-white/10 rounded-full animate-float-bubble-6" 
                       style={{
                         left: '60%',
                         bottom: '0px'
                       }}>
                  </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
                  <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full"></div>
                </div>
                
                {/* Hero Content */}
                <div className="relative z-10">
                  {/* Icon - Positioned absolutely in top-left */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Centered Content */}
                  <div className="text-center">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
                      {selectedCareer.careerTitle}
                    </h1>
                    <p className="text-white/90 text-base md:text-lg font-medium mb-8">
                      Discover your path to this career
                    </p>
                    
                    {/* CTA Button - Centered */}
                    <div className="flex justify-center">
                      <button 
                        onClick={scrollToProgramsSection}
                        className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 text-white font-semibold hover:bg-white/30 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                      >
                        <GraduationCap className="w-5 h-5 mr-2" />
                        <span className="text-sm">View {programsData?.programs?.length || 0} Related Programs</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Career Insights Cards - Horizontal Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {selectedCareer.industry && (
                  <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 border border-blue-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Building className="w-7 h-7 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-blue-900 mb-1">Industry</h3>
                        <p className="text-blue-600 text-sm mb-3">Primary sector</p>
                        <p className="text-blue-800 font-semibold text-xl">{selectedCareer.industry}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedCareer.salary && (
                  <div className="group bg-gradient-to-br from-emerald-50 to-green-100 rounded-3xl p-6 border border-emerald-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-emerald-900 mb-1">Salary Range</h3>
                        <p className="text-emerald-600 text-sm mb-3">Expected compensation</p>
                        <p className="text-emerald-800 font-semibold text-xl">{selectedCareer.salary}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedCareer.jobTrend && (
                  <div className="group bg-gradient-to-br from-purple-50 to-violet-100 rounded-3xl p-6 border border-purple-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="flex items-start">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Target className="w-7 h-7 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-bold text-purple-900 mb-1">Job Outlook</h3>
                        <p className="text-purple-600 text-sm mb-3">Market demand</p>
                        <p className="text-purple-800 font-semibold text-xl">{selectedCareer.jobTrend}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Career Description - Full Width */}
              {selectedCareer.careerDescription && (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-3 h-12 bg-[#FFB71B] rounded-full mr-4"></div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Career Overview</h2>
                        <p className="text-gray-600">What this career entails</p>
                      </div>
                    </div>
                    <div className="prose prose-lg max-w-none">
                      <div className="text-gray-700 leading-relaxed text-justify whitespace-pre-line text-base">
                        {selectedCareer.careerDescription?.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-2 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Programs for Career */}
            <div id="programs-section">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB71B] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading programs...</p>
              </div>
            ) : programsData?.programs?.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Programs Found</h3>
                <p className="text-gray-500">
                  This career doesn't have any associated programs yet. 
                  Try selecting a different career.
                </p>
              </div>
            ) : (
              <div className="w-full">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-[#2B3E4E] mb-6">
                    Academic Programs ({programsData?.programs?.length || 0})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {programsData?.programs?.map((program, index) => (
                      <motion.div
                        key={program.programId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer hover:border-[#FFB71B] shadow-lg"
                        onClick={() => {
                          setSearchMode('program');
                          handleProgramSelect(program);
                        }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-[#232D35] rounded-xl flex items-center justify-center mb-4 hover:scale-110 transition-transform shadow-lg">
                            <BookOpen className="w-8 h-8 text-[#FFB71B]" />
                          </div>
                          <h4 className="font-bold text-[#2B3E4E] hover:text-[#1D63A1] transition-colors text-lg leading-tight mb-3">
                            {program.programName}
                          </h4>
                          {program.description && (
                            <p className="text-sm text-gray-700 leading-relaxed text-justify line-clamp-4 mb-4">
                              {program.description}
                            </p>
                          )}
                          {program.schools && program.schools.length > 0 && (
                            <div className="mt-auto">
                              <div className="text-xs text-gray-500 mb-3">Available at:</div>
                              <div className="flex flex-wrap gap-1.5 justify-center">
                                {program.schools.map((school, idx) => {
                                  const schoolLogo = getSchoolLogo(school.schoolId);
                                  // Dynamic size based on number of schools
                                  const logoSize = program.schools.length > 6 ? 'w-9 h-9' : program.schools.length > 4 ? 'w-10 h-10' : 'w-12 h-12';
                                  const textSize = program.schools.length > 6 ? 'text-[10px]' : 'text-xs';
                                  
                                  return (
                                    <div
                                      key={idx}
                                      className="school-logo-container relative group"
                                      onClick={(e) => e.stopPropagation()} // Prevent program card click when clicking school logo
                                    >
                                      {schoolLogo ? (
                                        <div className={`${logoSize} rounded-full overflow-hidden border-2 border-gray-200 hover:border-[#FFB71B] transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md cursor-pointer school-logo-hover-target`}>
                                          <img 
                                            src={schoolLogo} 
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              // Fallback to text badge on image error
                                              e.target.style.display = 'none';
                                              e.target.nextSibling.style.display = 'flex';
                                            }}
                                          />
                                          <div 
                                            className={`w-full h-full bg-blue-100 text-blue-700 rounded-full flex items-center justify-center ${textSize} font-bold hidden`}
                                          >
                                            {school.name.substring(0, 2).toUpperCase()}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className={`${logoSize} bg-blue-100 text-blue-700 rounded-full flex items-center justify-center ${textSize} font-bold border-2 border-gray-200 hover:border-[#FFB71B] transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md cursor-pointer school-logo-hover-target`}>
                                          {school.name.substring(0, 2).toUpperCase()}
                                        </div>
                                      )}
                                      
                                      {/* Tooltip on individual logo hover only */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                        {school.name}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </div> {/* End programs-section */}
          </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </div>
  );
};

export default ProgramCareerExplorer;