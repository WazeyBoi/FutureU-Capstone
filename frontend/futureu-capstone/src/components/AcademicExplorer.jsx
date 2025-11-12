import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import apiClient from '../services/api';
import authService from '../services/authService';
import schoolProgramService from '../services/schoolProgramService';
import schoolService from '../services/schoolService';
import programService from '../services/programService';
import accreditationService from '../services/accreditationService';

// Import new components
import HeroHeader from './AcademicExplorer/HeroHeader';

import ProgramSidePanel from './AcademicExplorer/ProgramSidePanel';
import SchoolGrid from './AcademicExplorer/SchoolGrid';
import SchoolSearchResults from './AcademicExplorer/SchoolSearchResults';
import PersistentSearchHeader from './AcademicExplorer/PersistentSearchHeader';
import SchoolFilter from './AcademicExplorer/SchoolFilter';
import { EmptyStateWithMascots, NoSchoolsFound } from './AcademicExplorer/EmptyState';
import { LoadingGrid } from './AcademicExplorer/LoadingState';
import { ErrorToast } from './AcademicExplorer/ToastNotifications';

// Import utilities
import { fadeAnimationStyle, schoolLogos } from './AcademicExplorer/constants';
import { filterSchools, getSchoolBackground } from './AcademicExplorer/utils';
import { useAcademicExplorerData, useProgramSelection, useSchoolSearch } from './AcademicExplorer/hooks';

// Import quirky mascot for loading screen
import quirkyMascot from '../assets/characters/quirky.svg';

// Animation variants similar to Student Homepage
const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemFade = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const AcademicExplorer = () => {
  // Core data and state from hooks
  const {
    programs,
    schools,
    filteredSchools,
    setFilteredSchools,
    schoolProgramCounts,
    error,
    setError,
    loading,
    setLoading
  } = useAcademicExplorerData();

  const location = useLocation();
  const navigate = useNavigate();

  const {
    selectedProgram,
    setSelectedProgram,
    selectedProgramDetails,
    setSelectedProgramDetails,
    loadingProgramDetails,
    setLoadingProgramDetails
  } = useProgramSelection(programs, schools, navigate, location);

  const {
    searchedSchool,
    setSearchedSchool,
    schoolPrograms,
    setSchoolPrograms,
    isSearchingSchool,
    showSchoolSearchResults,
    setShowSchoolSearchResults,
    searchSchool
  } = useSchoolSearch(schools, navigate, location);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    locationSearch: '',
    schoolType: 'all',
    schoolNameFilter: '',
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [programSearchTerm, setProgramSearchTerm] = useState('');


  const [showProgramSidePanel, setShowProgramSidePanel] = useState(false);

  const [programSidebarHidden, setProgramSidebarHidden] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [mascotWiggle, setMascotWiggle] = useState(false);

  // School-program relationship data for department info
  const [schoolProgramData, setSchoolProgramData] = useState([]);
  const [programsOfferedSearchTerm, setProgramsOfferedSearchTerm] = useState('');

  // New search header state
  const [searchMode, setSearchMode] = useState('programs'); // 'programs' or 'schools'
  const [currentPage, setCurrentPage] = useState(1);
  const [showBrowseView, setShowBrowseView] = useState(true);

  const totalPrograms = programs.length;
  const totalSchools = schools.length;

  // Add state to ensure proper data loading timing
  const [dataReady, setDataReady] = useState(false);
  
  // Filter-related state
  const [displayedSchools, setDisplayedSchools] = useState([]);
  const [accreditationData, setAccreditationData] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});

  // Ensure data is properly loaded before showing content
  useEffect(() => {
    if (!loading && programs.length > 0 && schools.length > 0) {
      // Small delay to ensure all data is processed
      const timer = setTimeout(() => {
        setDataReady(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDataReady(false);
    }
  }, [loading, programs.length, schools.length]);

  // Note: Data fetching is now handled by useAcademicExplorerData hook
  // This prevents race conditions and duplicate API calls

  // Fetch accreditation data for filtering
  useEffect(() => {
    const fetchAccreditationData = async () => {
      try {
        const data = await accreditationService.getAllAccreditationData();
        setAccreditationData(data || []);
      } catch (error) {
        console.error('Error fetching accreditation data:', error);
        setAccreditationData([]);
      }
    };

    if (schools.length > 0) {
      fetchAccreditationData();
    }
  }, [schools.length]);



  // Update school program fetching to use cached service
  useEffect(() => {
    if (selectedProgram) {
      const fetchSchoolPrograms = async () => {
        setLoading(true);
        try {
          setShowSchoolSearchResults(false);
          setSearchedSchool(null);
          
          // Use cached service method
          const response = await schoolProgramService.getSchoolProgramsByProgram(selectedProgram);
          if (Array.isArray(response)) {
            const filtered = response.map((schoolProgram) => schoolProgram.school);
            setFilteredSchools(filtered);
            // Store the complete school-program data for department info
            setSchoolProgramData(response);
          } else {
            setFilteredSchools([]);
            setSchoolProgramData([]);
          }
        } catch (error) {
          console.error('Error fetching school programs:', error);
          setFilteredSchools([]);
          setSchoolProgramData([]);
        } finally {
          setLoading(false);
        }
      };
      fetchSchoolPrograms();
    } else {
      if (filterOptions.locationSearch) {
        setFilteredSchools(schools);
      } else {
        setFilteredSchools([]);
      }
      setSchoolProgramData([]);
    }
  }, [selectedProgram, schools, filterOptions.locationSearch, setFilteredSchools, setShowSchoolSearchResults, setSearchedSchool]);

  // Update program details fetching
  useEffect(() => {
    if (showProgramSidePanel && selectedProgram) {
      setLoadingProgramDetails(true);
      programService.getProgramById(selectedProgram)
        .then(response => {
          setSelectedProgramDetails(response);
        })
        .catch(error => {
          const programName = programs.find(p => p.programId === selectedProgram)?.programName;
          if (programName) {
            setSelectedProgramDetails({ programId: selectedProgram, programName });
          }
        })
        .finally(() => {
          setLoadingProgramDetails(false);
        });
    }
  }, [showProgramSidePanel, selectedProgram, programs]);

  // Mascot animation effects
  useEffect(() => {
    const interval = setInterval(() => {
      setMascotWiggle(true);
      setTimeout(() => setMascotWiggle(false), 600);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // Filter schools based on current filters and search
  const filteredAndSearchedSchools = filterSchools(
    filteredSchools, 
    filterOptions, 
    searchTerm, 
    selectedProgram
  );

  // Initialize displayed schools when needed
  useEffect(() => {
    if (selectedProgram && filteredAndSearchedSchools.length > 0 && Object.keys(activeFilters).length === 0) {
      setDisplayedSchools(filteredAndSearchedSchools);
    }
  }, [filteredAndSearchedSchools, selectedProgram, activeFilters]);

  // Auto-scroll function to bring user to the content area
  const scrollToContent = () => {
    // Scroll to the persistent search header area
    const searchHeaderElement = document.querySelector('[data-persistent-search-header]');
    if (searchHeaderElement) {
      searchHeaderElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    } else {
      // Fallback: scroll to a reasonable position
      window.scrollTo({ 
        top: window.innerHeight * 0.6, 
        behavior: 'smooth' 
      });
    }
  };

  // Filter handler for school filtering
  const handleSchoolFilter = (filteredSchools, filters) => {
    setDisplayedSchools(filteredSchools);
    setActiveFilters(filters);
  };

  // Event handlers
  const handleProgramChange = (programId) => {
    const selected = programs.find(p => p.programId === programId);
    setProgramSearchTerm(selected ? selected.programName : '');
    setSearchTerm(selected ? selected.programName : '');
    setSearchMode('programs');
    setSearchedSchool(null);
    setShowSchoolSearchResults(false);
    setSelectedProgram(programId);
    setSelectedProgramDetails(null); // Clear previous program details
    setShowProgramSidePanel(true);
    setShowBrowseView(false); // Hide browse view when program is selected
    setFilterOptions(prev => ({ ...prev, schoolNameFilter: '' }));
    
    // Clear filter state when selecting new program
    setDisplayedSchools([]);
    setActiveFilters({});
    
    // Auto-scroll to content area after a brief delay for animation
    setTimeout(scrollToContent, 100);
  };

  const handleSchoolSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSelectedProgram(null);
    setProgramSearchTerm('');
    setShowProgramSidePanel(false);
    
    const result = await searchSchool(searchTerm);
    if (!result.success) {
      setError(result.error);
    }
    
    // Auto-scroll to content area after search
    setTimeout(scrollToContent, 100);
  };

  const handleSchoolSelect = async (school) => {
    // Handle both school objects from EmptyState and school name strings from old search
    const schoolName = typeof school === 'string' ? school : school.name;
    
    setSearchTerm(schoolName);
    setSearchMode('schools');
    setShowSchoolDropdown(false);
    setSelectedProgram(null);
    setProgramSearchTerm(''); 
    setShowProgramSidePanel(false);
    setShowBrowseView(false); // Hide browse view when school is selected
    
    const result = await searchSchool(schoolName);
    if (!result.success) {
      setError(result.error);
    }
    
    // Auto-scroll to content area after a brief delay for animation
    setTimeout(scrollToContent, 100);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSchoolSearch();
    }
  };





  // New handlers for persistent search
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setCurrentPage(1);
    
    // Clear all states when switching modes for better UX
    setSearchTerm('');
    setSelectedProgram(null);
    setSearchedSchool(null);
    setShowSchoolSearchResults(false);
    setShowProgramSidePanel(false);
    setProgramSidebarHidden(false);
    setShowBrowseView(true);
    setProgramSearchTerm('');
    setFilteredSchools([]);
  };

  const handleSearchFromHeader = () => {
    if (searchMode === 'programs') {
      // Search for program and select it
      const matchingProgram = programs.find(p => 
        p.programName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingProgram) {
        handleProgramChange(matchingProgram.programId);
      }
    } else {
      // Search for school
      handleSchoolSearch();
      // Auto-scroll to content area after a brief delay for search completion
      setTimeout(scrollToContent, 300);
    }
  };

  const handleBackToBrowse = () => {
    setShowBrowseView(true);
    setSelectedProgram(null);
    setSearchedSchool(null);
    setShowSchoolSearchResults(false);
    setShowProgramSidePanel(false);
    setProgramSidebarHidden(false);
    setSearchTerm('');
    setProgramSearchTerm('');
    setFilteredSchools([]);
    setCurrentPage(1);
    
    // Clear filter state
    setDisplayedSchools([]);
    setActiveFilters({});
  };

  // Add loading screen similar to Accreditation page
  // Show loading screen while data is being fetched OR if we don't have any data yet OR data not ready
  if (loading || programs.length === 0 || schools.length === 0 || !dataReady) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen h-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
        <div>
          <img 
            src={quirkyMascot}
            alt="Quirky mascot" 
            className="quirky-bounce h-50 mx-auto"
          />
        </div>
        <p className="text-lg font-bold text-gray-600 dark:text-gray-300">Loading program and school data...</p>
        
        {/* Add the quirky bounce animation styles */}
        <style jsx="true">{`
          @keyframes quirkyBounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
          
          .quirky-bounce {
            animation: quirkyBounce 2s infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-auto"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <style dangerouslySetInnerHTML={{ __html: fadeAnimationStyle }} />

      <motion.div variants={itemFade}>
        <HeroHeader totalPrograms={totalPrograms} totalSchools={totalSchools} />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ErrorToast error={error} visible={!!error} />
          </motion.div>
        )}
      </AnimatePresence>


      
      <motion.main 
        className="flex-1 w-full flex"
        variants={staggerContainer}
      >
        {/* Program Side Panel */}
        <AnimatePresence>
          {showProgramSidePanel && !programSidebarHidden && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              variants={itemFade}
            >
              <ProgramSidePanel
                show={true}
                hidden={false}
                onHide={() => setProgramSidebarHidden(true)}
                selectedProgramDetails={selectedProgramDetails}
                programs={programs}
                selectedProgram={selectedProgram}
                loadingProgramDetails={loadingProgramDetails}
                filteredSchoolsCount={filteredAndSearchedSchools.length}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div 
          className={`flex-1 transition-all duration-300 ease-in-out px-6 py-6 ${
            showProgramSidePanel && !programSidebarHidden ? '' : 'w-full'
          }`}
          variants={itemFade}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 min-h-[calc(100vh-140px)] relative"
            variants={scaleIn}
          >

            {/* Persistent Search Header */}
            <motion.div variants={itemFade} data-persistent-search-header>
              <PersistentSearchHeader
              searchMode={searchMode}
              setSearchMode={handleSearchModeChange}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSearch={handleSearchFromHeader}
              onSearchChange={setSearchTerm}
              onProgramSelect={handleProgramChange}
              onSchoolSelect={handleSchoolSelect}
              programs={programs}
              schools={schools}
              currentDataCount={
                showBrowseView 
                  ? (searchMode === 'programs' ? programs.length : schools.length)
                  : searchedSchool && showSchoolSearchResults
                  ? schoolPrograms.length
                  : selectedProgram && Object.keys(activeFilters).length > 0 
                  ? displayedSchools.length 
                  : filteredAndSearchedSchools.length
              }
              showingSchoolsForProgram={selectedProgram && !showBrowseView}
              showingProgramsForSchool={searchedSchool && showSchoolSearchResults}
              onBackToBrowse={handleBackToBrowse}
              placeholder={
                selectedProgram 
                  ? `Selected: ${programs.find(p => p.programId === selectedProgram)?.programName || ''}`
                  : searchedSchool
                  ? `Selected: ${searchedSchool.name}`
                  : undefined
              }
              leftSideButton={
                selectedProgram && programSidebarHidden ? (
                  <button
                    onClick={() => setProgramSidebarHidden(false)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    aria-label="Show program details"
                  >
                    <ChevronRight className="w-5 h-5 text-[#2B3E4E] dark:text-[#FFB71B]" />
                    <span className="ml-2 font-medium text-[#2B3E4E] dark:text-[#FFB71B] hidden md:inline">Show Program Details</span>
                  </button>
                ) : null
              }
            />
            </motion.div>
            
            {/* Main content area */}
            <AnimatePresence mode="wait">
              {showBrowseView ? (
                <motion.div
                  key="browse-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <EmptyStateWithMascots 
                    mascotWiggle={mascotWiggle}
                    onProgramSelect={handleProgramChange}
                    onSchoolSelect={handleSchoolSelect}
                    searchMode={searchMode}
                    searchTerm={searchTerm}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </motion.div>
              ) : loading && selectedProgram ? (
                <motion.div
                  key="loading-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <LoadingGrid />
                </motion.div>
              ) : showSchoolSearchResults && searchedSchool && !selectedProgram ? (
                <motion.div
                  key="school-search-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <SchoolSearchResults
                    searchedSchool={searchedSchool}
                    schoolPrograms={schoolPrograms}
                    programsOfferedSearchTerm={programsOfferedSearchTerm}
                    setProgramsOfferedSearchTerm={setProgramsOfferedSearchTerm}
                  />
                </motion.div>
              ) : filteredAndSearchedSchools.length === 0 && !isSearchingSchool && !showSchoolSearchResults ? (
                <motion.div
                  key="no-schools-found"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <NoSchoolsFound 
                    searchTerm={searchTerm} 
                    filterOptions={filterOptions} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="school-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {/* School Filter - Only show when a program is selected */}
                  {selectedProgram && !showSchoolSearchResults && filteredAndSearchedSchools.length > 0 && (
                    <div className="mb-6">
                      <SchoolFilter
                        schools={filteredAndSearchedSchools}
                        accreditationData={accreditationData}
                        onFilterChange={handleSchoolFilter}
                        className="mb-4"
                      />
                    </div>
                  )}
                  
                  <SchoolGrid
                    schools={selectedProgram && Object.keys(activeFilters).length > 0 ? displayedSchools : filteredAndSearchedSchools}
                    showProgramSidePanel={showProgramSidePanel}
                    selectedProgram={selectedProgram}
                    schoolProgramData={schoolProgramData}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.main>


    </motion.div>
  );
};

export default AcademicExplorer;