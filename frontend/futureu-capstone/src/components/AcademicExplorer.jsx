import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Remove this import
import apiClient from '../services/api'; // Import the configured apiClient instead
import { Info, School, BookOpen, MapPin, Globe, X, Search, ChevronRight, Star, StarOff, Filter, AlertCircle, Compass, Building } from 'lucide-react';
import { useLocation, useNavigate } from "react-router-dom"; // Add useNavigate
import authService from '../services/authService'; // Import authService for auth checks
import schoolProgramService from '../services/schoolProgramService'; // Import schoolProgramService

// Import all logos
import cdu_school_logo from '../assets/school_logos/cdu_school_logo.png';
import citu_school_logo from '../assets/school_logos/citu_school_logo.png';
import cnu_school_logo from '../assets/school_logos/cnu_school_logo.png';
import ctu_school_logo from '../assets/school_logos/ctu_school_logo.png';
import iau_school_logo from '../assets/school_logos/iau_school_logo.png';
import swu_school_logo from '../assets/school_logos/swu_school_logo.png';
import uc_school_logo from '../assets/school_logos/uc_school_logo.png';
import usc_school_logo from '../assets/school_logos/usc_school_logo.png';
import usjr_school_logo from '../assets/school_logos/usjr_school_logo.png';
import up_school_logo from '../assets/school_logos/up_school_logo.png';
import uv_school_logo from '../assets/school_logos/uv_school_logo.png';

// Import school_images
import citu_school_image from '../assets/school_images/citu_school_image.jpg';
import cdu_school_image from '../assets/school_images/cdu_school_image.jpg';
import cnu_school_image from '../assets/school_images/cnu_school_image.jpg';
import ctu_school_image from '../assets/school_images/ctu_school_image.jpg';
import swu_school_image from '../assets/school_images/swu_school_image.jpg';
import usc_school_image from '../assets/school_images/usc_school_image.jpg';
import usjr_school_image from '../assets/school_images/usjr_school_image.jpg';
import up_school_image from '../assets/school_images/up_school_image.jpg';
import uc_school_image from '../assets/school_images/uc_school_image.jpg';
import uv_school_image from '../assets/school_images/uv_school_image.jpg';
import iau_school_image from '../assets/school_images/iau_school_image.jpg';

// Create a mapping of school IDs to logos
const schoolLogos = {
  1: cdu_school_logo,
  2: citu_school_logo,
  3: cnu_school_logo,
  4: ctu_school_logo,
  5: iau_school_logo,
  6: swu_school_logo,
  7: uc_school_logo,
  8: usc_school_logo,
  9: usjr_school_logo,
  10: up_school_logo,
  11: uv_school_logo,
};

// Create a mapping for school name detection to their background images
const schoolBackgroundMap = {
  "Cebu Institute of Technology": citu_school_image,
  "Cebu Doctors' University": cdu_school_image,
  "Cebu Normal University": cnu_school_image,
  "Cebu Technological University": ctu_school_image,
  "Southwestern University": swu_school_image,
  "University of San Carlos": usc_school_image,
  "University of San Jose Recoletos": usjr_school_image,
  "University of the Philippines Cebu": up_school_image,
  "University of Cebu": uc_school_image,
  "University of the Visayas": uv_school_image,
  "Indiana Aerospace University": iau_school_image,
};

// Function to get the school background based on name
const getSchoolBackground = (schoolName) => {
  if (!schoolName) return null;
  
  const normalizedName = schoolName.toLowerCase();
  
  // Check each key in our map to see if it's in the school name
  for (const [key, background] of Object.entries(schoolBackgroundMap)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return background;
    }
  }
  
  return null;
};

// Add this CSS to the top of the component
const fadeAnimationStyle = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
  }

  @keyframes slideIn {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  @keyframes slideDown {
    from {
      max-height: 0;
      opacity: 0;
    }
    to {
      max-height: 500px;
      opacity: 1;
    }
  }
  
  .animate-slide-down {
    animation: slideDown 0.4s ease-out forwards;
    overflow: hidden;
  }
  
  @keyframes slideUp {
    from {
      max-height: 500px;
      opacity: 1;
    }
    to {
      max-height: 0;
      opacity: 0;
    }
  }
  
  .animate-slide-up {
    animation: slideUp 0.4s ease-out forwards;
    overflow: hidden;
  }

  @keyframes contentSlide {
    from {
      margin-left: 0;
      width: 100%;
    }
    to {
      margin-left: 384px;
      width: calc(100% - 384px);
    }
  }
  
  .animate-content-slide {
    animation: contentSlide 0.4s ease-out forwards;
  }
  
  @keyframes contentSlideBack {
    from {
      margin-left: 384px;
      width: calc(100% - 384px);
    }
    to {
      margin-left: 0;
      width: 100%;
    }
  }

  .animate-content-slide-back {
    animation: contentSlideBack 0.4s ease-out forwards;
  }

  /* Responsive grid adjustments */
  @media (min-width: 640px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }

  @media (min-width: 768px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
  }

  @media (min-width: 1280px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }
  
  @media (min-width: 1536px) {
    .grid-with-panel {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }
`;

const AcademicExplorer = () => {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [hoveredSchool, setHoveredSchool] = useState(null);
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    locationSearch: '',
    schoolType: 'all', // Filter option for school type
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [programSearchTerm, setProgramSearchTerm] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [showSchoolsFoundToast, setShowSchoolsFoundToast] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showProgramsPanel, setShowProgramsPanel] = useState(false);
  const [showProgramConfirmation, setShowProgramConfirmation] = useState(false);
  const [pendingProgramSelection, setPendingProgramSelection] = useState(null);
  const [selectedProgramDetails, setSelectedProgramDetails] = useState(null);
  const [loadingProgramDetails, setLoadingProgramDetails] = useState(false);
  const [schoolProgramCounts, setSchoolProgramCounts] = useState({});
  const [selectedSchoolDetails, setSelectedSchoolDetails] = useState(null);
  const [showSchoolDetailsModal, setShowSchoolDetailsModal] = useState(false);
  const [showProgramSidePanel, setShowProgramSidePanel] = useState(false);
  
  // Add new state variables for school search functionality
  const [searchedSchool, setSearchedSchool] = useState(null);
  const [schoolPrograms, setSchoolPrograms] = useState([]);
  const [showSchoolProgramsModal, setShowSchoolProgramsModal] = useState(false);
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [showSchoolSearchResults, setShowSchoolSearchResults] = useState(false); // New state for direct display

  const location = useLocation();
  const navigate = useNavigate(); // Add this hook for navigation

  // Check authentication status when component mounts
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // Redirect to login page if not authenticated
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const programId = params.get("programId");
    if (programId) {
      setSelectedProgram(Number(programId));
      setShowProgramSidePanel(true);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Replace axios with apiClient which has the token interceptor
        const [programsResponse, schoolsResponse] = await Promise.all([
          apiClient.get('/program/getAllPrograms'),
          apiClient.get('/school/getAllSchools')
        ]);
        
        if (Array.isArray(programsResponse.data)) {
          const transformedPrograms = programsResponse.data.map((program) => ({
            programId: program.programId,
            programName: program.programName,
          }));
          setPrograms(transformedPrograms);
        } else {
          setError('Failed to load programs. Please try again later.');
        }
        
        if (Array.isArray(schoolsResponse.data)) {
          setSchools(schoolsResponse.data);
          
          // Fetch program counts for each school
          try {
            const schoolProgramResponse = await apiClient.get('/schoolprogram/getAllSchoolPrograms');
            if (Array.isArray(schoolProgramResponse.data)) {
              // Count programs for each school
              const counts = {};
              schoolProgramResponse.data.forEach(schoolProgram => {
                const schoolId = schoolProgram.school.schoolId;
                if (!counts[schoolId]) {
                  counts[schoolId] = 1;
                } else {
                  counts[schoolId]++;
                }
              });
              setSchoolProgramCounts(counts);
            }
          } catch (error) {
            console.error("Failed to fetch school program counts:", error);
          }
        } else {
          setError('Failed to load schools. Please try again later.');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          authService.signout(); // Clear credentials
          navigate('/login', { state: { from: location.pathname } });
        }
        
        setError('Failed to load data. Please check your connection or login status.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (selectedProgram) {
      const fetchSchoolPrograms = async () => {
        setLoading(true);
        try {
          // Reset search results and clear search term when program is selected
          setShowSchoolSearchResults(false);
          setSearchedSchool(null);
          
          // Replace axios with apiClient
          const response = await apiClient.get(
            `/schoolprogram/getSchoolProgramsByProgram/${selectedProgram}`
          );
          if (Array.isArray(response.data)) {
            const filtered = response.data.map((schoolProgram) => schoolProgram.school);
              setFilteredSchools(filtered);
            console.log("Schools found for this program:", filtered.length);
            
            // Show the toast notification after filtering
            setShowSchoolsFoundToast(true);
            setTimeout(() => {
              setShowSchoolsFoundToast(false);
            }, 3000);
        } else {
            setFilteredSchools(schools);
            console.log("Invalid response format, showing all schools");
          }
      } catch (error) {
        console.error("Error fetching school programs:", error);
          
          if (error.response?.status === 401) {
            authService.signout();
            navigate('/login', { state: { from: location.pathname } });
          }
          
          setFilteredSchools(schools);
          setError('Failed to load specific schools for the selected program. Showing all schools instead.');
        } finally {
          setLoading(false);
        }
      };
      fetchSchoolPrograms();
    } else {
      // Show all schools if location filter is active, otherwise show none
      if (filterOptions.locationSearch) {
        setFilteredSchools(schools);
        // Show toast for location filter results
        setShowSchoolsFoundToast(true);
        setTimeout(() => {
          setShowSchoolsFoundToast(false);
        }, 3000);
    } else {
      setFilteredSchools([]);
      }
    }
  }, [selectedProgram, schools, filterOptions.locationSearch, navigate]);

  useEffect(() => {
    if (pendingProgramSelection) {
      setLoadingProgramDetails(true);
      // Replace axios with apiClient
      apiClient.get(`/program/getProgram/${pendingProgramSelection}`)
        .then(response => {
          console.log("Program details response:", response.data);
          setSelectedProgramDetails(response.data);
        })
        .catch(error => {
          console.error("Error fetching program details:", error);
          
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

  // Add this effect to load program details when side panel is shown
  useEffect(() => {
    if (showProgramSidePanel && selectedProgram && !selectedProgramDetails) {
      setLoadingProgramDetails(true);
      apiClient.get(`/program/getProgram/${selectedProgram}`)
        .then(response => {
          setSelectedProgramDetails(response.data);
        })
        .catch(error => {
          console.error("Error fetching program details for side panel:", error);
          // Fallback to basic info
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

  const handleSchoolSelect = (school) => {
    if (selectedSchools.find((s) => s.schoolId === school.schoolId)) {
      setSelectedSchools(selectedSchools.filter((s) => s.schoolId !== school.schoolId));
    } else if (selectedSchools.length < 3) {
      setSelectedSchools([...selectedSchools, school]);
    } else {
    const toastElement = document.getElementById('toast');
      if (toastElement) {
        toastElement.classList.remove('hidden');
        setTimeout(() => {
          toastElement.classList.add('hidden');
        }, 3000);
      }
    }
  };

  const handleCompareClick = () => {
    if (selectedSchools.length < 2) {
      const toastElement = document.getElementById('toast');
      if (toastElement) {
        toastElement.textContent = 'Please select at least 2 schools to compare';
        toastElement.classList.remove('hidden');
        setTimeout(() => {
          toastElement.classList.add('hidden');
        }, 3000);
      }
      return;
    }
    setShowComparison(true);
  };

  const filteredAndSearchedSchools = filteredSchools
  .filter(school => {
      const matchesSearch = searchTerm === '' || school.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = filterOptions.locationSearch === '' || (school.location && school.location.toLowerCase().includes(filterOptions.locationSearch.toLowerCase()));
      const matchesSchoolType = filterOptions.schoolType === 'all' || 
                               (filterOptions.schoolType === 'public' && school.type?.toLowerCase() === 'public') || 
                               (filterOptions.schoolType === 'private' && school.type?.toLowerCase() === 'private');
      return matchesSearch && matchesLocation && matchesSchoolType;
    })
  .sort((a, b) => a.name.localeCompare(b.name));

const getAnimationClass = (index) => {
    const baseDelay = 50;
    const delay = index * baseDelay;
    return `animate-fade-in-up animation-delay-${delay}`;
  };

  const handleMouseEnter = (school, e) => {
    setHoveredSchool(school);
    setTooltipVisible(true);
  const rect = e.currentTarget.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;
    const spaceBelow = window.innerHeight - rect.top;
    let x = rect.right + 10;
    let y = rect.top;
    if (spaceOnRight < 400) {
      x = rect.left - 410;
    }
    if (spaceBelow < 500) {
      y = Math.max(10, rect.bottom - 500);
    }
    setTooltipPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
    setHoveredSchool(null);
  };

  // Add this function to handle program selection and side panel
  const handleProgramChange = (programId) => {
    // Reset school search when selecting a program
    setSearchTerm('');
    setSearchedSchool(null);
    setShowSchoolSearchResults(false);
    
    // If the side panel is already open, just update the selected program
    // and the side panel will update via the useEffect hook
    if (showProgramSidePanel) {
      setSelectedProgram(programId);
      setPendingProgramSelection(programId);
      setShowProgramConfirmation(false);
    } else {
      // Otherwise, show the program confirmation modal
      setPendingProgramSelection(programId);
      setShowProgramConfirmation(true);
    }
    
    // Always close the programs panel
    setShowProgramsPanel(false);
  };

  // Add new function to handle school search
  const handleSchoolSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      // Clear any program selection when searching for a school
      setSelectedProgram(null);
      setPendingProgramSelection(null);
      setShowProgramSidePanel(false);
      
      setIsSearchingSchool(true);
      setShowSchoolSearchResults(false); // Reset search results display
      
      // Find schools that match the search term
      const matchingSchool = schools.find(school => 
        school.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchingSchool) {
        // Get programs for the matched school
        const schoolProgramsResponse = await schoolProgramService.getSchoolProgramsBySchool(matchingSchool.schoolId);
        
        if (Array.isArray(schoolProgramsResponse)) {
          // Extract programs from schoolPrograms response
          const programsData = schoolProgramsResponse.map(sp => sp.program);
          setSchoolPrograms(programsData);
          setSearchedSchool(matchingSchool);
          setShowSchoolSearchResults(true); // Show results in the main container
          
          // Show toast notification
          setShowSchoolsFoundToast(true);
          setTimeout(() => {
            setShowSchoolsFoundToast(false);
          }, 3000);
        } else {
          setError(`No programs found for "${searchTerm}". Please try another school name.`);
          setTimeout(() => {
            setError(null);
          }, 3000);
        }
      } else {
        setError(`School "${searchTerm}" not found. Please check the spelling and try again.`);
        setTimeout(() => {
          setError(null);
        }, 3000);
      }
    } catch (error) {
      console.error("Error searching for school programs:", error);
      setError("Failed to search for school programs. Please try again later.");
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsSearchingSchool(false);
    }
  };

  // Add handler for search input keydown
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSchoolSearch();
    }
  };

  if (showComparison) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full px-6 py-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">School Comparison</h1>
            <button
              onClick={() => setShowComparison(false)}
              className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-3 rounded-full shadow-md transition-all hover:shadow-lg border border-gray-200 dark:border-gray-600"
              aria-label="Close comparison view"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Display selected schools */}
            {selectedSchools.map((school) => (
              <div 
                key={school.schoolId} 
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 border border-gray-200 dark:border-gray-700"
              >
                {/* School content unchanged */}
                {/* Background Header Image */}
                <div className="h-40 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                  {getSchoolBackground(school.name) ? (
                    <img 
                      src={getSchoolBackground(school.name)} 
                      alt={`${school.name} campus`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={`https://source.unsplash.com/800x450/?university,school,campus,college&${school.schoolId}`} 
                      alt={`${school.name} campus`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button 
                    onClick={() => handleSchoolSelect(school)}
                    className="absolute right-3 top-3 bg-[#FFB71B] text-white hover:bg-[#FFB71B]/80 p-1.5 rounded-full backdrop-blur-sm z-10 shadow-md"
                    aria-label="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* Logo positioned at bottom of header */}
                  <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
                    {schoolLogos[school.schoolId] ? (
                      <div className="rounded-full bg-white border-4 border-white dark:border-gray-800 shadow-lg p-1 w-24 h-24 flex items-center justify-center">
                        <img 
                          src={schoolLogos[school.schoolId]} 
                          alt={`${school.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 flex items-center justify-center bg-white dark:bg-gray-700 rounded-full shadow-lg border-4 border-white dark:border-gray-800">
                        <School className="w-12 h-12 text-[#2B3E4E]" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* School Content */}
                <div className="pt-14 px-6 pb-6">
                  <h3 className="text-center font-bold text-gray-900 dark:text-white text-lg mb-6">{school.name}</h3>
                  
                  {/* About School Section - Now at the top with better styling */}
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg mb-5 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-2">
                      <Info className="w-5 h-5 text-[#FFB71B] mr-2" />
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">About School</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-7">
                      {school.description || 'Description not available'}
                    </p>
                  </div>
                   
                  {/* School Info Grid - Location and Type side by side */}
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Location */}
                      <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                            <MapPin className="w-4 h-4 text-[#FFB71B]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Location</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm break-words">{school.location || "Location not available"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* School Type */}
                      <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start">
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                            <Building className="w-4 h-4 text-[#FFB71B]" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">School Type</h4>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{school.type || "Type not specified"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Programs Count - Below location and type */}
                    <div className="p-3.5 bg-white dark:bg-gray-800 rounded-lg mt-3 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mr-3 flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-[#FFB71B]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Programs Offered</h4>
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-[#2B3E4E] dark:text-[#FFB71B] mr-2">
                              {schoolProgramCounts[school.schoolId] || "0"}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">Academic Programs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add "Browse More Schools" cards for each missing slot */}
            {[...Array(3 - selectedSchools.length)].map((_, index) => (
              <div 
                key={`add-more-${index}`} 
                className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center p-8 h-full"
              >
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full inline-block mb-4 shadow-inner">
                    <School className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg mb-4">Add {index === 0 && selectedSchools.length === 2 ? "one more" : "more"} school{index > 0 || selectedSchools.length < 2 ? "s" : ""}</p>
                  <button
                    onClick={() => setShowComparison(false)}
                    className="mt-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition shadow-sm hover:shadow-md font-medium"
                  >
                    Browse Schools
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="h-screen w-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: fadeAnimationStyle }} />
      
      {showWelcomeModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 dark:bg-gray-900/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full relative border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-10">
              <div className="flex items-center mb-4 pr-10">
                <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-4 flex-shrink-0">
                  <School className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#2B3E4E] dark:text-white">Welcome to Academic Explorer</h2>
              </div>
              <p className="text-base text-gray-700 dark:text-gray-300 mb-8 pl-16 text-left">
                Discover the perfect educational path for your future. Explore programs, compare schools, and find your ideal academic fit.
              </p>
              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-4 flex-shrink-0">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#2B3E4E] dark:text-white mb-1">Explore Programs</h3>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      Browse through various academic programs offered by top schools.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-4 flex-shrink-0">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#2B3E4E] dark:text-white mb-1">Compare Schools</h3>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      Select up to 3 schools to compare facilities, programs, and more.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-4 flex-shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#2B3E4E] dark:text-white mb-1">Virtual Tours</h3>
                    <p className="text-base text-gray-700 dark:text-gray-300">
                      Experience campuses virtually before making your decision.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full py-4 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] font-bold rounded-md transition-colors flex items-center justify-center shadow-md"
              >
                <span className="text-lg mr-2">Start Exploring</span>
                <div className="w-7 h-7 rounded-full bg-[#2B3E4E] flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        id="toast" 
        className="hidden fixed top-6 right-6 bg-red-100 dark:bg-red-900/80 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-xl z-50 animate-slide-in-right backdrop-blur-sm"
      >
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="font-medium">You can compare up to 3 schools at a time</p>
        </div>
      </div>
      
      {showSchoolsFoundToast && filteredAndSearchedSchools.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-4 rounded-lg shadow-xl z-50 animate-fade-in-up backdrop-blur-sm">
          <div className="flex items-center">
            <School className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400" />
            <p className="font-medium">{filteredAndSearchedSchools.length} {filteredAndSearchedSchools.length === 1 ? 'school' : 'schools'} found</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-100 dark:bg-red-900/80 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-xl z-50 animate-fade-in-up backdrop-blur-sm">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 w-full backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
        <div className="w-full px-6 py-5">
          <div className="flex items-center gap-16">
            <div className="relative z-50 w-96">
              {/* Programs dropdown code unchanged */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProgramsPanel(!showProgramsPanel);
                    // Close the side panel when opening the programs dropdown
                    if (!showProgramsPanel) {
                      setShowProgramSidePanel(false);
                    }
                  }}
                  className="flex items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow w-96 justify-between min-h-[56px]"
                >
                  <div className="flex items-start max-w-[calc(100%-24px)]">
                    <BookOpen className="w-5 h-5 mr-2 text-indigo-500 flex-shrink-0 mt-1" />
                    <span className="line-clamp-2 font-medium">
                      {selectedProgram 
                        ? programs.find(p => p.programId === selectedProgram)?.programName || "Programs"
                        : "Programs"}
                  </span>
            </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${showProgramsPanel ? 'rotate-90' : ''}`} />
                </button>
                {showProgramsPanel && (
                  <div className="absolute mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 border border-gray-100 dark:border-gray-700 w-96 overflow-hidden animate-slide-down">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-indigo-500" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearchTerm}
                    onChange={(e) => setProgramSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm text-left"
                  />
                </div>
                  </div>
                    <div className="max-h-[50vh] overflow-y-auto p-2">
                      {programs
                        .filter(program =>
                          program.programName.toLowerCase().includes(programSearchTerm.toLowerCase())
                        )
                        .sort((a, b) => a.programName.localeCompare(b.programName))
                        .map((program) => (
                          <button
                            key={program.programId}
                            onClick={() => handleProgramChange(program.programId)}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 mb-1 transition-colors ${
                              selectedProgram === program.programId
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-indigo-500'
                                : ''
                            }`}
                          >
                            <BookOpen
                              className={`w-5 h-5 mr-3 flex-shrink-0 ${
                                selectedProgram === program.programId
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            />
                            <span
                              className={`${
                                selectedProgram === program.programId
                                  ? 'font-medium text-indigo-700 dark:text-indigo-300'
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}
                            >
                                    {program.programName}
                            </span>
                          </button>
                        ))}
                        </div>
                      </div>
                    )}
              </div>
            </div>

            <div className="flex items-center max-w-5xl mx-auto flex-1">
              <div className="flex w-full">
                <div className="relative flex-1 w-[600px]">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="pl-10 pr-4 py-3 w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm hover:shadow h-[56px]"
                />
              </div>
                <div className="flex ml-2">
                  <button
                    onClick={handleSchoolSearch}
                    disabled={isSearchingSchool || !searchTerm.trim()}
                    className={`bg-[#FFB71B] text-gray-900 px-6 py-3 rounded-lg hover:bg-[#FFB71B]/90 transition border border-[#FFB71B] shadow-sm hover:shadow flex items-center h-[56px] ${(isSearchingSchool || !searchTerm.trim()) ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSearchingSchool ? (
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Search className="w-5 h-5 text-gray-900 mr-2" />
                    )}
                    <span>Search</span>
                  </button>

                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow flex items-center h-[56px] ml-3"
                >
                  <Filter className="w-5 h-5 text-indigo-500" />
                  <span className="ml-2">Filters</span>
                </button>
                </div>
                
                {showFilterMenu && (
                  <div className="absolute right-0 top-[calc(100%+8px)] bg-white dark:bg-gray-700 rounded-lg shadow-xl p-5 z-40 border border-gray-100 dark:border-gray-600 w-72">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">FILTER BY</h3>
                    
                    {/* School Type Filter */}
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">School Type</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
                          <input
                            type="radio"
                            name="schoolType"
                            checked={filterOptions.schoolType === 'all'}
                            onChange={() => {
                              setFilterOptions({
                                ...filterOptions,
                                schoolType: 'all'
                              });
                              setShowFilterMenu(false);
                            }}
                            className="text-[#FFB71B] focus:ring-[#FFB71B] w-5 h-5"
                          />
                          <span className="font-medium">All</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
                          <input
                            type="radio"
                            name="schoolType"
                            checked={filterOptions.schoolType === 'public'}
                            onChange={() => {
                              setFilterOptions({
                                ...filterOptions,
                                schoolType: 'public'
                              });
                              setShowFilterMenu(false);
                            }}
                            className="text-[#FFB71B] focus:ring-[#FFB71B] w-5 h-5"
                          />
                          <span className="font-medium">Public</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
                          <input
                            type="radio"
                            name="schoolType"
                            checked={filterOptions.schoolType === 'private'}
                            onChange={() => {
                              setFilterOptions({
                                ...filterOptions,
                                schoolType: 'private'
                              });
                              setShowFilterMenu(false);
                            }}
                            className="text-[#FFB71B] focus:ring-[#FFB71B] w-5 h-5"
                          />
                          <span className="font-medium">Private</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Location</h4>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500" />
                        <input
                          type="text"
                          placeholder="Search location (e.g. N. Bacalso)"
                          value={filterOptions.locationSearch}
                          onChange={(e) => setFilterOptions({
                            ...filterOptions,
                            locationSearch: e.target.value
                          })}
                          className="pl-9 pr-3 py-2.5 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm text-left"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-96 flex justify-end pr-6">
              {selectedSchools.length > 0 && (
                <button
                  onClick={handleCompareClick}
                  className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition shadow-sm hover:shadow flex items-center font-medium whitespace-nowrap min-h-[56px]"
                >
                  <span>Compare</span>
                  <span className="ml-2 bg-white text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {selectedSchools.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 w-full overflow-hidden flex">
        {/* Program Side Panel */}
        {showProgramSidePanel && (
          <div className="h-full w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-md animate-slide-in"> {/* Changed from w-80 to w-96 */}
            <div className="p-4 flex flex-col h-full"> {/* Increased padding from p-3 to p-4 */}
              <div className="flex items-center justify-between mb-2"> {/* Increased margin bottom */}
                <h3 className="text-lg font-bold text-[#2B3E4E] dark:text-white">Program Details</h3>
                <button
                  onClick={() => setShowProgramSidePanel(false)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                  aria-label="Close program panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {loadingProgramDetails ? (
                <div className="animate-pulse space-y-3 flex-grow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4"></div>
                  <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ) : selectedProgramDetails ? (
                <div className="flex flex-col h-full">
                  {/* Program Header - More compact */}
                  <div className="mb-6 text-center border-b border-gray-200 dark:border-gray-700 pb-5"> {/* Increased margin bottom and padding bottom */}
                    <div className="w-20 h-20 rounded-full bg-[#2B3E4E] flex items-center justify-center mx-auto mb-3"> {/* Further increased size and margin */}
                      <BookOpen className="w-10 h-10 text-[#FFB71B]" /> {/* Further increased icon size */}
                    </div>
                    <div className="text-sm uppercase tracking-wider text-[#2B3E4E] dark:text-[#FFB71B] font-semibold"> {/* Increased text size */}
                      Academic Program
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-2"> {/* Further increased text size */}
                      {selectedProgramDetails?.programName || 
                        programs.find(p => p.programId === selectedProgram)?.programName || 
                        "Loading..."}
                    </h2>
                  </div>
                  
                  {/* Program Content - Using less vertical space */}
                  <div className="space-y-2 flex-grow"> {/* Further increased spacing between sections */}
                    {/* Program Description Section - More compact */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 shadow-sm"> {/* Increased padding */}
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-0 flex items-center"> {/* Increased margin bottom */}
                        <Info className="w-4 h-4 mr-1.5 text-[#FFB71B]" />
                        Program Description
                      </h4>
                      <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed h-17 overflow-y-auto pr-2 text-left"> 
                            {selectedProgramDetails?.description || selectedProgramDetails?.programDescription || 
                              "This program prepares students for careers in this field."}
                          </p>
                      </div>
                    </div>
                    
                    {/* Career Opportunities Section - More compact */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 shadow-sm"> {/* Increased padding */}
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-1 flex items-center"> {/* Increased margin bottom */}
                        <Compass className="w-4 h-4 mr-1.5 text-[#FFB71B]" />
                        Career Opportunities
                      </h4>
                      <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed h-17 overflow-y-auto pr-2 text-left"> 
                            {selectedProgramDetails?.careerOpportunities || 
                              "Graduates of this program can pursue various career paths in related fields."}
                          </p>
                      </div>
                    </div>
                    
                    {/* Available Schools Section - Positioned at bottom */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700 shadow-md mt-auto h-25"> {/* Changed from h-32 to h-36 for more height */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-full bg-[#FFB71B]/10 dark:bg-[#FFB71B]/20 flex items-center justify-center mr-3"> {/* Further increased size */}
                            <School className="w-8 h-8 text-[#FFB71B]" /> {/* Further increased icon size */}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Available Schools</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">offering this program</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-3xl font-bold text-[#FFB71B] block">{filteredAndSearchedSchools.length}</span> {/* Increased text size */}
                          <span className="text-xs text-gray-500 dark:text-gray-400">schools</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 flex-grow flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto flex items-center justify-center mb-3">
                    <BookOpen className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No program selected</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className={`h-full overflow-hidden transition-all duration-300 ease-in-out px-6 py-6 ${
          showProgramsPanel ? 'animate-content-slide' : 'animate-content-slide-back'
        } ${showProgramSidePanel ? 'ml-96 w-[calc(100%-24rem)]' : 'w-full'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 h-[calc(100vh-140px)] overflow-auto">
            {/* School Search Results View - Only show if no program is selected or explicitly searching schools */}
            {showSchoolSearchResults && searchedSchool && !selectedProgram ? (
              <div className="flex flex-col h-full animate-fade-in-up">
                {/* School Header with Background */}
                <div className="relative w-full h-48 bg-[#2B3E4E] rounded-lg mb-8 overflow-hidden">
                  {getSchoolBackground(searchedSchool.name) ? (
                    <img 
                      src={getSchoolBackground(searchedSchool.name)} 
                      alt={`${searchedSchool.name} campus`}
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#2B3E4E] opacity-90"></div>
                  )}
                  
                  {/* School Info Overlay */}
                  <div className="absolute inset-0 flex items-center px-8">
                    <div className="flex items-center">
                      {/* School Logo */}
                      <div className="mr-6">
                        {schoolLogos[searchedSchool.schoolId] ? (
                          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white overflow-hidden p-1">
                            <img 
                              src={schoolLogos[searchedSchool.schoolId]} 
                              alt={`${searchedSchool.name} logo`}
                              className="object-contain"
                              style={{ width: "95%", height: "95%" }}
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                            <School className="w-20 h-20 text-[#2B3E4E]" />
                          </div>
                        )}
                      </div>
                      
                      {/* School Details */}
                      <div className="text-white">
                        <h2 className="text-3xl font-bold mb-2">{searchedSchool.name}</h2>
                        <div className="flex items-center text-white/90">
                          <MapPin className="w-5 h-5 mr-2" />
                          <span>{searchedSchool.location || "Location not specified"}</span>
                          
                          {searchedSchool.type && (
                            <div className="flex items-center ml-6">
                              <School className="w-5 h-5 mr-2" />
                              <span>{searchedSchool.type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Close button */}
                    <div className="ml-auto">
                      <button
                        onClick={() => setShowSchoolSearchResults(false)}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                        aria-label="Close search results"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* School Description */}
                <div className="bg-gray-50 dark:bg-gray-700/40 p-6 rounded-xl mb-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-[#2B3E4E] dark:text-[#FFB71B] mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    About {searchedSchool.name}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {searchedSchool.description || 'No description available for this school.'}
                  </p>
                </div>
                
                {/* Programs Header */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-[#2B3E4E] dark:text-white flex items-center">
                    <BookOpen className="w-6 h-6 mr-2 text-[#FFB71B]" />
                    Programs Offered ({schoolPrograms.length})
                  </h3>
                  
                  {/* Add to comparison button */}
                  <button
                    onClick={() => handleSchoolSelect(searchedSchool)}
                    className={`flex items-center py-2 px-4 rounded-lg text-sm font-medium transition ${
                      selectedSchools.find(s => s.schoolId === searchedSchool.schoolId) 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30 border border-red-200 dark:border-red-900/30' 
                        : 'bg-[#2B3E4E] text-[#FFB71B] hover:bg-[#2B3E4E]/90'
                    }`}
                  >
                    {selectedSchools.find(s => s.schoolId === searchedSchool.schoolId) ? (
                      <>
                        <StarOff className="w-4 h-4 mr-2" />
                        Remove from Comparison
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Add to Comparison
                      </>
                    )}
                  </button>
                </div>
                
                {/* Programs Grid */}
                {schoolPrograms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-4">
                    {schoolPrograms.map((program) => (
                      <div 
                        key={program.programId}
                        className="bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 overflow-hidden transition-shadow cursor-pointer animate-fade-in-up"
                        onClick={() => {
                          setSelectedProgram(program.programId);
                          setPendingProgramSelection(program.programId);
                          setShowProgramSidePanel(true);
                        }}
                      >
                        <div className="p-5">
                          <div className="flex items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-[#2B3E4E] flex items-center justify-center mr-3 flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-[#FFB71B]" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{program.programName}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Academic Program</p>
                            </div>
                          </div>
                          
                          {program.description && (
                            <div className="mt-3 pl-3 border-l-2 border-gray-200 dark:border-gray-600">
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                {program.description}
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button className="text-[#2B3E4E] dark:text-[#FFB71B] text-sm font-medium flex items-center">
                              View Details
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">No programs available for this school</p>
                  </div>
                )}
              </div>
            ) : !selectedProgram && filteredSchools.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No Program Selected yet. Browse
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md">
                  through the programs or search
                  in the searchbar
                </p>
              </div>
            ) : loading && selectedProgram ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : filteredAndSearchedSchools.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-100 dark:bg-gray-700 p-5 rounded-full inline-block mb-5">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">No schools found</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  {searchTerm ? 'Try adjusting your search term or filters'
                        : filterOptions.locationSearch 
                          ? `No schools found matching location "${filterOptions.locationSearch}"`
                          : 'Select a program to view available schools'}
                    </p>
                  </div>
                ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-max transition-all duration-300 ${
                showProgramSidePanel ? 'grid-with-panel' : 'lg:grid-cols-3'
              }`}>
                    {filteredAndSearchedSchools.map((school, index) => {
                      const isSelected = selectedSchools.find((s) => s.schoolId === school.schoolId);
                      const schoolLogo = schoolLogos[school.schoolId];
                      const schoolBackground = getSchoolBackground(school.name);

                      return (
                        <div
                          key={school.schoolId}
                          className={`relative bg-white dark:bg-gray-700 border rounded-xl transition-all duration-300 overflow-hidden ${getAnimationClass(index)} ${
                            isSelected ? 'border-[#FFB71B] shadow-lg ring-2 ring-[#FFB71B]/20 dark:ring-[#FFB71B]/30' : 'border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg hover:-translate-y-1'
                          }`}
                          style={{}}
                          onMouseEnter={(e) => handleMouseEnter(school, e)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleSchoolSelect(school)}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#2B3E4E] text-[#FFB71B] p-1.5 rounded-full z-10 shadow-md">
                              <Star className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex flex-col h-full">
                            {/* Top half with image and logo */}
                            <div className="relative w-full h-44 bg-blue-100 overflow-hidden">
                              {/* Banner image - using a gradient overlay to ensure text readability */}
                              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-blue-500/10"></div>
                              
                              {/* School background image */}
                              {getSchoolBackground(school.name) ? (
                                <img 
                                  src={getSchoolBackground(school.name)} 
                                  alt={`${school.name} campus`}
                                  className="w-full h-full object-cover object-center"
                                />
                              ) : (
                                <img 
                                  src={`https://source.unsplash.com/800x450/?university,school,campus,college&${school.schoolId}`} 
                                  alt={`${school.name} campus`}
                                  className="w-full h-full object-cover object-center"
                                />
                              )}

                              {/* Logo positioned in the middle with no white background */}
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              {schoolLogo ? (
                                <img 
                                  src={schoolLogo} 
                                  alt={`${school.name} logo`}
                                    className="w-32 h-32 object-cover rounded-full shadow-lg"
                                />
                              ) : (
                                  <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow-lg">
                                    <School className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                                </div>
                              )}
                              </div>
                            </div>

                            {/* Bottom half with school information */}
                            <div className="p-5 flex flex-col flex-1">
                              {/* School name centered */}
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center mb-4">{school.name}</h3>
                              
                              {/* All information in one container with shadow */}
                              <div className="space-y-3 bg-white dark:bg-gray-700/60 p-5 rounded-lg mb-4 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <MapPin className="w-5 h-5 mr-3 text-[#FFB71B] flex-shrink-0" />
                                <span className="truncate">{school.location}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <Globe className="w-5 h-5 mr-3 text-[#FFB71B] flex-shrink-0" />
                                <span>{school.type}</span>
                              </div>
                                
                                {/* Programs Offered - divider line */}
                                <div className="h-px bg-gray-200 dark:bg-gray-600 my-3"></div>
                                
                                {/* Programs Offered inside the same container - left aligned */}
                                <div>
                                  <div className="flex items-center">
                                    <BookOpen className="w-5 h-5 mr-3 text-[#FFB71B] flex-shrink-0" />
                                    <h4 className="font-medium text-gray-800 dark:text-gray-200">Programs Offered</h4>
                                  </div>
                                  <div className="mt-2 ml-8">
                                    <div className="flex flex-col items-start">
                                      <span className="text-[#FFB71B] text-3xl font-bold">{schoolProgramCounts[school.schoolId] || "0"}</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">Academic Programs Available</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* View More button */}
                              <div className="mt-3">
                                <button
                                  className="flex items-center justify-center w-full bg-[#2B3E4E]/10 dark:bg-[#2B3E4E]/30 text-[#2B3E4E] dark:text-[#FFB71B] hover:bg-[#2B3E4E]/20 dark:hover:bg-[#2B3E4E]/40 py-2.5 px-3 rounded-md transition-colors text-sm font-medium"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSchoolDetails(school);
                                    setShowSchoolDetailsModal(true);
                                  }}
                                >
                                  <ChevronRight className="w-4 h-4 mr-2" />
                                  View More
                                </button>
                                </div>
                            </div>
                          </div>

                          {tooltipVisible && hoveredSchool?.schoolId === school.schoolId && (
                            <div 
                              className="fixed z-50 w-[400px] rounded-xl shadow-2xl p-6 transform transition-all duration-200 ease-in-out backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border border-gray-200 dark:border-gray-700"
                              style={{
                                top: tooltipPosition.y + 'px',
                                left: tooltipPosition.x + 'px'
                              }}
                            >
                              <div className="flex items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                {schoolLogo ? (
                                  <img 
                                    src={schoolLogo} 
                                    alt={`${school.name} logo`}
                                    className="w-32 h-32 object-cover rounded-full shadow-lg"
                                  />
                                ) : (
                                  <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full shadow-lg">
                                    <School className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                )}
                                <div className="ml-4">
                                  <h4 className="font-bold text-xl text-gray-900 dark:text-white">{school.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{school.location}</p>
                                </div>
                              </div>
                              <div className="space-y-5">
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                  <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">About</h5>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {school.description || 'No description available'}
                                  </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    <div className="flex items-center mb-2">
                                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mr-2" />
                                      <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Requirements</h5>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                      {school.admissionRequirements || 'Not specified'}
                                    </p>
                                  </div>
                                  {school.tuitionFee && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                      <div className="flex items-center mb-2">
                                        <div className="w-4 h-4 mr-2 text-yellow-500">💰</div>
                                        <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Tuition</h5>
                                      </div>
                                      <p className="text-gray-600 dark:text-gray-400 text-sm">{school.tuitionFee}</p>
                                    </div>
                                  )}
                                </div>
                                <button
                                  className="flex items-center justify-center w-full bg-[#2B3E4E]/10 dark:bg-[#2B3E4E]/30 text-[#2B3E4E] dark:text-[#FFB71B] hover:bg-[#2B3E4E]/20 dark:hover:bg-[#2B3E4E]/40 py-3 px-4 rounded-lg transition-colors font-medium"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSchoolDetails(school);
                                    setShowSchoolDetailsModal(true);
                                  }}
                                >
                                  <ChevronRight className="w-5 h-5 mr-2" />
                                  View More Details
                                </button>
                              </div>
                              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                  className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center font-medium ${
                                    selectedSchools.find(s => s.schoolId === school.schoolId) ? 
                                    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30 border border-red-200 dark:border-red-900/30' 
                                    : 'bg-[#2B3E4E] text-[#FFB71B] hover:bg-[#2B3E4E]/90'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSchoolSelect(school);
                                  }}
                                >
                                  {selectedSchools.find(s => s.schoolId === school.schoolId) ? (
                                    <>
                                      <StarOff className="w-5 h-5 mr-2" />
                                      Remove from Comparison
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-5 h-5 mr-2" />
                                      Add to Comparison
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
      </main>
      {showProgramConfirmation && pendingProgramSelection && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 dark:bg-gray-900/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full relative border border-gray-200 dark:border-gray-700 animate-fade-in-up overflow-hidden">
            {/* Decorative gradient header */}
            <div className="h-24 bg-[#2B3E4E]"></div>
            
            {/* Content area with negative margin to overlap with header */}
            <div className="px-8 pb-8 -mt-12">
              {/* Program icon and title in a card that overlaps the header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-[#2B3E4E] flex items-center justify-center flex-shrink-0 shadow-lg border-4 border-white dark:border-gray-800">
                  {/* Show different icons based on program name */}
                  {selectedProgramDetails?.programName?.toLowerCase().includes('science') ? (
                    <div className="text-[#FFB71B] w-10 h-10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
          </div>
                  ) : selectedProgramDetails?.programName?.toLowerCase().includes('engineering') ? (
                    <div className="text-[#FFB71B] w-10 h-10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 13h10"></path><path d="M15 13h7"></path><path d="M10 19l3-3 3 3"></path><path d="M10 7l3 3 3-3"></path><rect x="7" y="3" width="10" height="2" rx="1"></rect><rect x="7" y="19" width="10" height="2" rx="1"></rect></svg>
        </div>
                  ) : selectedProgramDetails?.programName?.toLowerCase().includes('nursing') || selectedProgramDetails?.programName?.toLowerCase().includes('health') ? (
                    <div className="text-[#FFB71B] w-10 h-10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"></path><path d="M8 19L3 12h10l-5 7z"></path><path d="M20.25 14.5A.75.75 0 1 0 19.5 13l-4.5 1.8-4.5-2.3-2 3.5 3 2 4-1.5 4.5 1.5z"></path></svg>
                    </div>
                  ) : selectedProgramDetails?.programName?.toLowerCase().includes('business') || selectedProgramDetails?.programName?.toLowerCase().includes('management') ? (
                    <div className="text-[#FFB71B] w-10 h-10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22V2"></path><path d="M7 22V2"></path><path d="M5 12h14"></path></svg>
                    </div>
                  ) : selectedProgramDetails?.programName?.toLowerCase().includes('computer') || selectedProgramDetails?.programName?.toLowerCase().includes('technology') ? (
                    <div className="text-[#FFB71B] w-10 h-10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="6"></rect><rect x="16" y="16" width="6" height="6"></rect><rect x="2" y="16" width="6" height="6"></rect><path d="M5 16V9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7"></path><path d="M12 12v7"></path></svg>
                    </div>
                  ) : selectedProgramDetails?.programName?.toLowerCase().includes('psychology') || selectedProgramDetails?.programName?.toLowerCase().includes('social') ? (
                    <div className="text-[#FFB71B] w-10 h-10">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v-4a4 4 0 1 0-8 0v4"></path><path d="M12 18a4 4 0 0 0 4-4h-8a4 4 0 0 0 4 4Z"></path><path d="M19 9a7 7 0 1 0-14 0"></path><path d="M12 2v2"></path><path d="M4.93 5.93 6.34 7.34"></path><path d="M2 12h2"></path><path d="M19.07 5.93 17.66 7.34"></path><path d="M22 12h-2"></path></svg>
                    </div>
                  ) : (
                    <BookOpen className="w-10 h-10 text-[#FFB71B]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm uppercase tracking-wider text-[#2B3E4E] dark:text-[#FFB71B] font-semibold mb-1">Academic Program</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedProgramDetails?.programName || 
                    programs.find(p => p.programId === pendingProgramSelection)?.programName}
                  </h2>
                </div>
              </div>
              
              {/* Program description */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-[#FFB71B]" />
                  Program Description
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700/40 p-5 rounded-xl">
                  {loadingProgramDetails ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedProgramDetails?.description || selectedProgramDetails?.programDescription || 
                       "This program prepares students for careers in this field. Would you like to see schools that offer this program?"}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Career prospects */}
              <div className="mb-8">
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <Compass className="w-4 h-4 mr-2 text-[#FFB71B]" />
                  Explore Your Future
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#2B3E4E]/10 dark:bg-[#2B3E4E]/20 p-4 rounded-lg border border-[#2B3E4E]/20 dark:border-[#2B3E4E]/30">
                    <div className="font-medium text-[#2B3E4E] dark:text-[#FFB71B] mb-1">Find Available Schools</div>
                    <p className="text-sm text-[#2B3E4E]/80 dark:text-gray-300/80">Discover institutions offering this program</p>
                  </div>
                  <div className="bg-[#FFB71B]/10 dark:bg-[#FFB71B]/20 p-4 rounded-lg border border-[#FFB71B]/20 dark:border-[#FFB71B]/30">
                    <div className="font-medium text-[#2B3E4E] dark:text-[#FFB71B] mb-1">Compare Options</div>
                    <p className="text-sm text-[#2B3E4E]/80 dark:text-gray-300/80">Select up to 3 schools to compare details</p>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={() => {
                    setSelectedProgram(pendingProgramSelection);
                    setShowProgramConfirmation(false);
                    setShowProgramSidePanel(true);
                    setSearchTerm('');
                    setShowSchoolSearchResults(false);
                    setSearchedSchool(null);
                  }}
                  className="py-3 px-6 bg-[#FFB71B] hover:bg-[#FFB71B]/90 text-[#2B3E4E] rounded-lg transition shadow-md hover:shadow-lg flex-1 font-medium flex items-center justify-center"
                >
                  <School className="w-5 h-5 mr-2" />
                  Show Available Schools
                </button>
                <button
                  onClick={() => {
                    setShowProgramConfirmation(false);
                    setPendingProgramSelection(null);
                  }}
                  className="py-3 px-6 bg-white dark:bg-gray-700 text-[#2B3E4E] dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600 flex-1 flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* School Details Modal */}
      {showSchoolDetailsModal && selectedSchoolDetails && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/40 dark:bg-gray-900/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full relative border border-gray-200 dark:border-gray-700 animate-fade-in-up overflow-hidden">
            {/* Close button at the top-right corner */}
            <button
              onClick={() => setShowSchoolDetailsModal(false)}
              className="absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 z-10 shadow-md"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* School Banner Background */}
            <div className="h-52 bg-[#2B3E4E] relative overflow-hidden w-full">
              {getSchoolBackground(selectedSchoolDetails.name) ? (
                <img 
                  src={getSchoolBackground(selectedSchoolDetails.name)} 
                  alt={`${selectedSchoolDetails.name} campus`}
                  className="w-full h-full object-cover object-center opacity-40"
                />
              ) : (
                <div className="absolute inset-0 bg-[#2B3E4E] opacity-90"></div>
              )}
              
              {/* School Name Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-6 py-3 text-center">
                  <h2 className="text-white text-3xl font-bold text-shadow-lg" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.4)' }}>
                    {selectedSchoolDetails.name}
                  </h2>
                </div>
              </div>
            </div>
            
            {/* Content area with negative margin to overlap with header */}
            <div className="px-8 pb-8 relative">
              {/* School logo that overlaps with the header */}
              <div className="absolute -top-20 right-8 w-40 h-40">
                <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden p-1">
                  {schoolLogos[selectedSchoolDetails.schoolId] ? (
                    <img 
                      src={schoolLogos[selectedSchoolDetails.schoolId]} 
                      alt={`${selectedSchoolDetails.name} logo`}
                      className="object-contain"
                      style={{ width: "95%", height: "95%" }}
                    />
                  ) : (
                    <School className="w-28 h-28 text-[#2B3E4E]" />
                  )}
                </div>
              </div>
              
              {/* School location info */}
              <div className="pt-12 pb-4 flex items-center">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin className="w-5 h-5 mr-2 text-[#FFB71B]" />
                  {selectedSchoolDetails.location}
                </div>
                {selectedSchoolDetails.type && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300 ml-6">
                    <School className="w-5 h-5 mr-2 text-[#FFB71B]" />
                    {selectedSchoolDetails.type}
                  </div>
                )}
              </div>
              
              {/* About the School - Full width */}
              <div className="bg-gray-50 dark:bg-gray-700/40 p-6 rounded-xl mb-6">
                <h3 className="text-lg font-semibold text-[#2B3E4E] dark:text-[#FFB71B] mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  About the School
                </h3>
                <div className="max-h-[200px] overflow-y-auto pr-2">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-left">
                    {selectedSchoolDetails.description || 'No description available for this school.'}
                  </p>
                </div>
              </div>
              
              {/* Programs Offered - Below description */}
              <div className="bg-[#2B3E4E]/5 dark:bg-[#2B3E4E]/20 p-6 rounded-xl border border-[#2B3E4E]/10 dark:border-[#2B3E4E]/30 mb-8">
                <h3 className="text-lg font-semibold text-[#2B3E4E] dark:text-[#FFB71B] mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Programs Offered
                </h3>
                <p className="text-gray-700 dark:text-gray-300 flex items-center font-medium text-left">
                  <span className="text-2xl mr-2 text-[#FFB71B]">{schoolProgramCounts[selectedSchoolDetails.schoolId] || "0"}</span> 
                  Academic Programs Available
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 text-left">
                  Select a program from the dropdown menu to see which schools offer it.
                </p>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-4 flex-col sm:flex-row">
                {/* Virtual tour button removed */}
                <button
                  onClick={() => {
                    handleSchoolSelect(selectedSchoolDetails);
                    if (!selectedSchools.find(s => s.schoolId === selectedSchoolDetails.schoolId)) {
                      setShowSchoolDetailsModal(false);
                    }
                  }}
                  className={`py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg flex-1 flex items-center justify-center font-medium
                    ${selectedSchools.find(s => s.schoolId === selectedSchoolDetails.schoolId) 
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30 border border-red-200 dark:border-red-900/30' 
                      : 'bg-[#2B3E4E] text-[#FFB71B] hover:bg-[#2B3E4E]/90'}`}
                >
                  {selectedSchools.find(s => s.schoolId === selectedSchoolDetails.schoolId) ? (
                    <>
                      <StarOff className="w-5 h-5 mr-2" />
                      Remove from Comparison
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5 mr-2" />
                      Add to Comparison
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowSchoolDetailsModal(false)}
                  className="py-3 px-6 bg-white dark:bg-gray-700 text-[#2B3E4E] dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600 flex-1 flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keep all other existing modals and code */}
      {/* ... */}
    </div>
  );
};

export default AcademicExplorer;