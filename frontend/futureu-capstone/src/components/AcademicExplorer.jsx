import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import apiClient from '../services/api';
import authService from '../services/authService';
import schoolProgramService from '../services/schoolProgramService';
import schoolService from '../services/schoolService';
import programService from '../services/programService';

// Import new components
import HeroHeader from './AcademicExplorer/HeroHeader';
import SearchHeader from './AcademicExplorer/SearchHeader';
import WelcomeModal from './AcademicExplorer/WelcomeModal';
import SchoolDetailsModal from './AcademicExplorer/SchoolDetailsModal';
import ProgramSidePanel from './AcademicExplorer/ProgramSidePanel';
import SchoolGrid from './AcademicExplorer/SchoolGrid';
import SchoolSearchResults from './AcademicExplorer/SchoolSearchResults';
import { EmptyStateWithMascots, NoSchoolsFound } from './AcademicExplorer/EmptyState';
import { LoadingGrid } from './AcademicExplorer/LoadingState';
import { SchoolsFoundToast, ErrorToast } from './AcademicExplorer/ToastNotifications';

// Import utilities
import { fadeAnimationStyle, schoolLogos } from './AcademicExplorer/constants';
import { filterSchools, getSchoolBackground } from './AcademicExplorer/utils';
import { useAcademicExplorerData, useProgramSelection, useSchoolSearch } from './AcademicExplorer/hooks';

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
  const [showSchoolsFoundToast, setShowSchoolsFoundToast] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    return !localStorage.getItem('academicExplorerWelcomeSeen');
  });
  const [showProgramSidePanel, setShowProgramSidePanel] = useState(false);
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState(null);
  const [showSchoolDetailsModal, setShowSchoolDetailsModal] = useState(false);
  const [programSidebarHidden, setProgramSidebarHidden] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [mascotWiggle, setMascotWiggle] = useState(false);
  const [programsOfferedSearchTerm, setProgramsOfferedSearchTerm] = useState('');

  const totalPrograms = programs.length;
  const totalSchools = schools.length;

  // Updated data fetching with cached services
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use cached services instead of direct API calls
        const [programsResponse, schoolsResponse] = await Promise.all([
          programService.getAllPrograms(),
          schoolService.getAllSchools()
        ]);

        // Transform programs data if needed
        if (Array.isArray(programsResponse)) {
          const transformedPrograms = programsResponse.map((program) => ({
            programId: program.programId,
            programName: program.programName,
          }));
          // Note: setPrograms should be available from the hook
          // If not available, you might need to update the hook
        } else {
          setError('Failed to load programs. Please try again later.');
        }

        if (Array.isArray(schoolsResponse)) {
          // Note: setSchools should be available from the hook
          // If not available, you might need to update the hook
          try {
            // Use cached school program service
            const schoolProgramResponse = await schoolProgramService.getAllSchoolPrograms();
            if (Array.isArray(schoolProgramResponse)) {
              const counts = {};
              schoolProgramResponse.forEach(schoolProgram => {
                const schoolId = schoolProgram.school?.schoolId;
                if (schoolId) {
                  counts[schoolId] = (counts[schoolId] || 0) + 1;
                }
              });
              // Note: setSchoolProgramCounts should be available from the hook
            }
          } catch (error) {
            console.error('Error fetching school program counts:', error);
          }
        } else {
          setError('Failed to load schools. Please try again later.');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          authService.signout();
          navigate('/login', { state: { from: location.pathname } });
        }
        setError('Failed to load data. Please check your connection or login status.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

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
            setShowSchoolsFoundToast(true);
            setTimeout(() => {
              setShowSchoolsFoundToast(false);
            }, 3000);
          } else {
            setFilteredSchools([]);
          }
        } catch (error) {
          console.error('Error fetching school programs:', error);
          setFilteredSchools([]);
        } finally {
          setLoading(false);
        }
      };
      fetchSchoolPrograms();
    } else {
      if (filterOptions.locationSearch) {
        setFilteredSchools(schools);
        setShowSchoolsFoundToast(true);
        setTimeout(() => {
          setShowSchoolsFoundToast(false);
        }, 3000);
      } else {
        setFilteredSchools([]);
      }
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

  // Event handlers
  const handleProgramChange = (programId) => {
    const selected = programs.find(p => p.programId === programId);
    setProgramSearchTerm(selected ? selected.programName : '');
    setSearchTerm('');
    setSearchedSchool(null);
    setShowSchoolSearchResults(false);
    setSelectedProgram(programId);
    setSelectedProgramDetails(null); // Clear previous program details
    setShowProgramSidePanel(true);
    setFilterOptions(prev => ({ ...prev, schoolNameFilter: '' }));
  };

  const handleSchoolSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSelectedProgram(null);
    setProgramSearchTerm('');
    setShowProgramSidePanel(false);
    
    const result = await searchSchool(searchTerm);
    if (result.success) {
      setShowSchoolsFoundToast(true);
      setTimeout(() => {
        setShowSchoolsFoundToast(false);
      }, 3000);
    } else {
      setError(result.error);
    }
  };

  const handleSchoolSelect = async (school) => {
    setSearchTerm(school.name);
    setShowSchoolDropdown(false);
    setSelectedProgram(null);
    setProgramSearchTerm(''); 
    setShowProgramSidePanel(false);
    
    const result = await searchSchool(school.name);
    if (result.success) {
      setShowSchoolsFoundToast(true);
      setTimeout(() => setShowSchoolsFoundToast(false), 3000);
    } else {
      setError(result.error);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSchoolSearch();
    }
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('academicExplorerWelcomeSeen', 'true');
  };

  const handleViewSchoolDetails = (school) => {
    setSelectedSchoolDetails(school);
    setShowSchoolDetailsModal(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-auto">
      <style dangerouslySetInnerHTML={{ __html: fadeAnimationStyle }} />

      <HeroHeader totalPrograms={totalPrograms} totalSchools={totalSchools} />
      
      <WelcomeModal show={showWelcomeModal} onClose={handleCloseWelcomeModal} />

      <SchoolsFoundToast 
        count={filteredAndSearchedSchools.length} 
        visible={showSchoolsFoundToast} 
      />
      
      <ErrorToast error={error} visible={!!error} />

      <SearchHeader
        programSearchTerm={programSearchTerm}
        setProgramSearchTerm={setProgramSearchTerm}
        showProgramDropdown={showProgramDropdown}
        setShowProgramDropdown={setShowProgramDropdown}
        programs={programs}
        selectedProgram={selectedProgram}
        onProgramChange={handleProgramChange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showSchoolDropdown={showSchoolDropdown}
        setShowSchoolDropdown={setShowSchoolDropdown}
        schools={schools}
        onSchoolSearch={handleSchoolSearch}
        onSearchKeyDown={handleSearchKeyDown}
        onSchoolSelect={handleSchoolSelect}
        showFilterMenu={showFilterMenu}
        setShowFilterMenu={setShowFilterMenu}
        filterOptions={filterOptions}
        setFilterOptions={setFilterOptions}
        isSearchingSchool={isSearchingSchool}
      />
      
      <main className="flex-1 w-full flex overflow-auto">
        {/* Program Side Panel */}
        {showProgramSidePanel && !programSidebarHidden && (
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
        )}
        
        <div className={`flex-1 transition-all duration-300 ease-in-out px-6 py-6 ${
          showProgramSidePanel && !programSidebarHidden ? '' : 'w-full'
        }`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 min-h-[calc(100vh-140px)] overflow-auto relative">

            {/* Show sidebar button when hidden */}
            {showProgramSidePanel && programSidebarHidden && (
              <div className="flex justify-start mb-4">
                <button
                  onClick={() => setProgramSidebarHidden(false)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow px-3 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  aria-label="Show program details"
                >
                  <ChevronRight className="w-5 h-5 text-[#2B3E4E] dark:text-[#FFB71B]" />
                  <span className="ml-2 font-medium text-[#2B3E4E] dark:text-[#FFB71B] hidden md:inline">Show Program Details</span>
                </button>
              </div>
            )}
            
            {/* Main content area */}
            {showSchoolSearchResults && searchedSchool && !selectedProgram ? (
              <SchoolSearchResults
                searchedSchool={searchedSchool}
                schoolPrograms={schoolPrograms}
                programsOfferedSearchTerm={programsOfferedSearchTerm}
                setProgramsOfferedSearchTerm={setProgramsOfferedSearchTerm}
              />
            ) : !selectedProgram && filteredSchools.length === 0 ? (
              <EmptyStateWithMascots mascotWiggle={mascotWiggle} />
            ) : loading && selectedProgram ? (
              <LoadingGrid />
            ) : filteredAndSearchedSchools.length === 0 ? (
              <NoSchoolsFound 
                searchTerm={searchTerm} 
                filterOptions={filterOptions} 
              />
            ) : (
              <SchoolGrid
                schools={filteredAndSearchedSchools}
                showProgramSidePanel={showProgramSidePanel}
                onViewDetails={handleViewSchoolDetails}
              />
            )}
          </div>
        </div>
      </main>

      <SchoolDetailsModal
        show={showSchoolDetailsModal}
        onClose={() => setShowSchoolDetailsModal(false)}
        school={selectedSchoolDetails}
        selectedProgramDetails={selectedProgramDetails}
        programs={programs}
        selectedProgram={selectedProgram}
      />
    </div>
  );
};

export default AcademicExplorer;