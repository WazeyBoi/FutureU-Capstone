import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import apiClient from '../services/api';
import authService from '../services/authService';
import schoolProgramService from '../services/schoolProgramService';

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
import { fadeAnimationStyle } from './AcademicExplorer/constants';
import { filterSchools } from './AcademicExplorer/utils';
import { useAcademicExplorerData, useProgramSelection, useSchoolSearch } from './AcademicExplorer/hooks';
import apiClient from '../services/api';
import schoolService from '../services/schoolService';
import programService from '../services/programService';
import schoolProgramService from '../services/schoolProgramService';
import { Info, School, BookOpen, MapPin, Globe, X, Search, ChevronRight, Star, StarOff, Filter, AlertCircle, Compass, Building } from 'lucide-react';
import { useLocation, useNavigate } from "react-router-dom";
import authService from '../services/authService';

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

  // Effect for updating filtered schools based on selected program
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
          setPrograms(transformedPrograms);
        } else {
          setError('Failed to load programs. Please try again later.');
        }

        if (Array.isArray(schoolsResponse)) {
          setSchools(schoolsResponse);
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
              setSchoolProgramCounts(counts);
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
    }
  }, [selectedProgram, schools, filterOptions.locationSearch, navigate, setFilteredSchools, setError, setLoading]);
  }, [selectedProgram]);

  // Update program details fetching
  useEffect(() => {
    if (pendingProgramSelection) {
      setLoadingProgramDetails(true);
      programService.getProgramById(pendingProgramSelection)
        .then(response => {
          setSelectedProgramDetails(response);
        })
        .catch(error => {
          if (error.response?.status === 401) {
            authService.signout();
            navigate('/login', { state: { from: location.pathname } });
          }
        })
        .finally(() => {
          setLoadingProgramDetails(false);
        });
    } else {
      setSelectedProgramDetails(null);
    }
  }, [pendingProgramSelection, navigate]);

  useEffect(() => {
    if (showProgramSidePanel && selectedProgram && !selectedProgramDetails) {
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
  }, [showProgramSidePanel, selectedProgram, selectedProgramDetails, programs]);

  useEffect(() => {
    // Automatic mascot wiggle every 3 seconds, alternating left/right
    const interval = setInterval(() => {
      setMascotHovered((prev) => {
        if (prev === 'left') return 'right';
        if (prev === 'right') return false;
        return 'left';
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      {/* School Details Modal */}
      {showSchoolDetailsModal && selectedSchoolDetails && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 dark:bg-gray-900/60 flex items-center justify-center z-[100] p-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full relative border border-gray-200 dark:border-gray-700 animate-fade-in-up overflow-hidden h-[80vh]">
            {/* Close button */}
           
           
            <button
              onClick={() => setShowSchoolDetailsModal(false)}
              className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-700 z-10 shadow"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            {/* Banner */}
            <div className="h-32 bg-[#2B3E4E] relative overflow-hidden w-full">
              {getSchoolBackground(selectedSchoolDetails.name) ? (
                <img 
                  src={getSchoolBackground(selectedSchoolDetails.name)} 
                  alt={`${selectedSchoolDetails.name} campus`}
                  className="w-full h-full object-cover object-center opacity-40"
                />
              ) : (
                <div className="absolute inset-0 bg-[#2B3E4E] opacity-90"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-4 py-2 text-center">
                  <h2 className="text-white text-2xl font-bold text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {selectedSchoolDetails.name}
                  </h2>
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="px-4 pb-4 relative">
              {/* Logo */}
              <div className="absolute -top-10 right-4">
                {schoolLogos[selectedSchoolDetails.schoolId] ? (
                  <img 
                    src={schoolLogos[selectedSchoolDetails.schoolId]} 
                    alt={`${selectedSchoolDetails.name} logo`}
                    className="w-25 h-25 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                ) : (
                  <div className="w-25 h-25 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow-lg">
                    <School className="w-24 h-24 text-[#2B3E4E]" />
                  </div>
                )}
              </div>
              {/* Location */}
              <div className="pt-10 pb-2 flex items-center text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-1 text-[#FFB71B]" />
                  {selectedSchoolDetails.location}
                </div>
                {selectedSchoolDetails.type && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300 ml-4">
                    <School className="w-4 h-4 mr-1 text-[#FFB71B]" />
                    {selectedSchoolDetails.type}
                  </div>
                )}
              </div>
              {/* About */}
              <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-lg mb-4 h-[20vh] flex flex-col justify-center">
                <h3 className="text-base font-semibold text-[#2B3E4E] dark:text-[#FFB71B] mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  About the School
                </h3>
                <div className="flex-1 overflow-y-auto">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {selectedSchoolDetails.description || 'No description available for this school.'}
                  </p>
                </div>
              </div>
              {/* Program Description */}
              <div className="bg-[#2B3E4E]/5 dark:bg-[#2B3E4E]/20 p-3 h-[27vh] rounded-lg border border-[#2B3E4E]/10 dark:border-[#2B3E4E]/30 mb-4 shadow relative overflow-hidden flex flex-col justify-center items-center">
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-[#FFB71B]/40 to-[#2B3E4E]/10 rounded-full blur-xl opacity-60 pointer-events-none"></div>
                
                {/* Left-aligned heading */}
                <div className="w-full">
                  <h3 className="text-base font-extrabold text-[#2B3E4E] dark:text-[#FFB71B] flex gap-2 tracking-tight mb-3">
                    <BookOpen className="w-5 h-5 mr-1 text-[#FFB71B] drop-shadow" />
                    Program Description
                  </h3>
                </div>
                
                {/* Top: badges and program name */}
                <div className="flex flex-col items-center w-full">
                  <span className="uppercase text-[10px] font-semibold tracking-wider text-[#2B3E4E]/70 dark:text-[#FFB71B]/80 bg-white/60 dark:bg-gray-800/60 px-1.5 py-0.5 rounded mb-2">
                    Selected Program
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#FFB71B]/90 to-[#FFB71B]/60 text-[#2B3E4E] dark:text-[#2B3E4E] font-bold shadow text-sm border border-[#FFB71B] mb-2">
                    <BookOpen className="w-4 h-4 mr-1 text-[#2B3E4E]" />
                    {selectedProgramDetails?.programName ||
                      programs.find(p => p.programId === selectedProgram)?.programName ||
                      "N/A"}
                  </span>
                  <hr className="border-t border-[#FFB71B]/30 mb-2 w-full" />
                </div>

                {/* Center only the description vertically */}
                <div className="flex-1 flex items-center w-full">
                  <p className="text-gray-800 dark:text-gray-200 text-base leading-snug font-medium drop-shadow-sm line-clamp-4 text-center w-full">
                    {selectedProgramDetails?.description ||
                      selectedProgramDetails?.programDescription ||
                      "Select a program from the dropdown menu to see its description."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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