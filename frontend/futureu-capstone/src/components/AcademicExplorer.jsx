import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Info, School, BookOpen, MapPin, Globe, X, Search, ChevronRight, Star, StarOff, Filter, AlertCircle, Compass, Building } from 'lucide-react';

// Import all logos
import logo1 from '../assets/logos/1_logo.png';
import logo2 from '../assets/logos/2_logo.png';
import logo3 from '../assets/logos/3_logo.png';
import logo4 from '../assets/logos/4_logo.png';
import logo5 from '../assets/logos/5_logo.png';
import logo6 from '../assets/logos/6_logo.png';
import logo7 from '../assets/logos/7_logo.png';
import logo8 from '../assets/logos/8_logo.png';
import logo9 from '../assets/logos/9_logo.png';
import logo10 from '../assets/logos/10_logo.png';
import logo11 from '../assets/logos/11_logo.png';

// Import school backgrounds
import citBackground from '../assets/backgrounds/CIT_BACKGROUND.jpg';
import cebuDoctorsBackground from '../assets/backgrounds/cebu_doctors.jpg';
import cebuNormalBackground from '../assets/backgrounds/cebu_normal.jpg';
import cebuTechnologicalBackground from '../assets/backgrounds/cebu_technological.jpg';
import southwesternPhinmaBackground from '../assets/backgrounds/southwestern_phinma.jpg';
import universityOfSanCarlosBackground from '../assets/backgrounds/university_of_san_carlos.jpg';
import universityOfSanJoseBackground from '../assets/backgrounds/university_of_san_jose.jpg';
import universityOfThePhilippinesBackground from '../assets/backgrounds/university_of_the_philippines.jpg';
import uvBackground from '../assets/backgrounds/uv.jpg';

// Create a mapping of school IDs to logos
const schoolLogos = {
  1: logo1,
  2: logo2,
  3: logo3,
  4: logo4,
  5: logo5,
  6: logo6,
  7: logo7,
  8: logo8,
  9: logo9,
  10: logo10,
  11: logo11,
};

// Create a mapping for school name detection to their background images
const schoolBackgroundMap = {
  "Cebu Institute of Technology": citBackground,
  "Cebu Doctors": cebuDoctorsBackground,
  "Cebu Normal": cebuNormalBackground,
  "Cebu Technological": cebuTechnologicalBackground,
  "Southwestern": southwesternPhinmaBackground,
  "PHINMA": southwesternPhinmaBackground,
  "San Carlos": universityOfSanCarlosBackground,
  "San Jose": universityOfSanJoseBackground,
  "Recoletos": universityOfSanJoseBackground,
  "Philippines": universityOfThePhilippinesBackground,
  "University of Cebu": citBackground,
  "University of Visayas": uvBackground,
  "UV": uvBackground,
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
      margin-left: 400px;
      width: calc(100% - 400px);
    }
  }
  
  .animate-content-slide {
    animation: contentSlide 0.4s ease-out forwards;
  }
  
  @keyframes contentSlideBack {
    from {
      margin-left: 400px;
      width: calc(100% - 400px);
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
    hasVirtualTour: false,
    locationSearch: '',
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [programSearchTerm, setProgramSearchTerm] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [showSchoolsFoundToast, setShowSchoolsFoundToast] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [showProgramsPanel, setShowProgramsPanel] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [programsResponse, schoolsResponse] = await Promise.all([
          axios.get('/api/program/getAllPrograms'),
          axios.get('/api/school/getAllSchools')
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
        } else {
          setError('Failed to load schools. Please try again later.');
        }
      } catch (error) {
        setError('Failed to load data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      const fetchSchoolPrograms = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `/api/schoolprogram/getSchoolProgramsByProgram/${selectedProgram}`
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
  }, [selectedProgram, schools, filterOptions.locationSearch]);

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
      const matchesVirtualTour = !filterOptions.hasVirtualTour || (school.virtualTourUrl && school.virtualTourUrl.trim() !== '');
      const matchesLocation = filterOptions.locationSearch === '' || (school.location && school.location.toLowerCase().includes(filterOptions.locationSearch.toLowerCase()));
      return matchesSearch && matchesVirtualTour && matchesLocation;
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

  if (showComparison) {
    return (
      <div className="min-h-screen h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
        <div className="w-full px-6 py-6 h-full">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {selectedSchools.map((school) => {
              const schoolLogo = schoolLogos[school.schoolId];
              return (
                <div 
                  key={school.schoolId} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                      {schoolLogo ? (
                        <div className="rounded-full border-4 border-indigo-100 dark:border-indigo-900 p-1">
                        <img 
                          src={schoolLogo} 
                          alt={`${school.name} logo`}
                            className="w-20 h-20 object-cover rounded-full"
                        />
                        </div>
                      ) : (
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full mr-3">
                          <School className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white ml-4">{school.name}</h2>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSchoolSelect(school);
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Remove from comparison"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-5 mt-6">
                    <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-indigo-500 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">{school.location}</p>
                    </div>
                    <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-indigo-500 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">{school.admissionRequirements || 'Admission requirements not available'}</p>
                    </div>
                    <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <Info className="w-5 h-5 text-indigo-500 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300">{school.description || 'Description not available'}</p>
                    </div>
                    {school.virtualTourUrl && (
                      <div className="mt-3">
                        <a
                          href={school.virtualTourUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-full bg-[#2B3E4E] hover:bg-[#2B3E4E]/90 text-white py-2 px-3 rounded-md transition-colors text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View More
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            {selectedSchools.length < 3 && (
              <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center p-8 min-h-[400px]">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full inline-block mb-4 shadow-inner">
                    <School className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-lg mb-4">Add up to {3 - selectedSchools.length} more {selectedSchools.length === 2 ? 'school' : 'schools'} to compare</p>
                  <button
                    onClick={() => setShowComparison(false)}
                    className="mt-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition shadow-sm hover:shadow-md font-medium"
                  >
                    Browse Schools
                  </button>
                </div>
              </div>
            )}
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
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30 w-full backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
        <div className="w-full px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="relative z-50">
              <div className="relative">
                <button
                  onClick={() => setShowProgramsPanel(!showProgramsPanel)}
                  className="flex items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow w-72 justify-between"
                >
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-indigo-500" />
                    <span>Programs</span>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showProgramsPanel ? 'rotate-90' : ''}`} />
                </button>
                <div
                  className={`absolute left-0 top-[calc(100%+8px)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg w-96 shadow-xl transition-all duration-300 ease-in-out origin-top ${
                    showProgramsPanel ? 'animate-slide-down' : 'animate-slide-up max-h-0 opacity-0'
                  }`}
                  style={{ 
                    zIndex: 100,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div className="p-5">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 h-5 w-5 text-indigo-500" />
                      <input
                        type="text"
                        placeholder="Search programs..."
                        value={programSearchTerm}
                        onChange={(e) => setProgramSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-3 w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-md text-base"
                      />
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800">
                      {loading && !selectedProgram ? (
                        <div className="space-y-3">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                          ))}
                        </div>
                      ) : error ? (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start">
                          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                          <p>{error}</p>
                        </div>
                      ) : (
                        <div className="space-y-1 pr-1">
                          {programs.length > 0 ?
                            programs.filter((program) =>
                              program.programName.toLowerCase().includes(programSearchTerm.toLowerCase())
                            ).map((program) => (
                              <button
                                key={program.programId}
                                className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${
                                  selectedProgram === program.programId
                                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 font-medium shadow-sm border border-indigo-100 dark:from-indigo-900/20 dark:to-blue-900/20 dark:border-indigo-800/30 dark:text-indigo-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                                onClick={() => {
                                  setSelectedProgram(program.programId);
                                  setShowProgramsPanel(false);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-base pr-3 w-full whitespace-normal break-words leading-snug">
                                    {program.programName}
                                  </div>
                                  {selectedProgram === program.programId && (
                                    <ChevronRight className="w-5 h-5 text-indigo-500 ml-2 flex-shrink-0" />
                                  )}
                                </div>
                              </button>
                            ))
                          : (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 dark:text-gray-400">No programs found</p>
                            </div>
                          )}
                          {programs.length > 0 &&
                            programs.filter(program =>
                              program.programName.toLowerCase().includes(programSearchTerm.toLowerCase())
                            ).length === 0 && (
                              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                <Search className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600 dark:text-gray-400">No matching programs found</p>
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center flex-1 max-w-3xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm hover:shadow"
                />
              </div>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-r-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition border border-l-0 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow flex items-center"
              >
                <Filter className="w-5 h-5 text-indigo-500" />
                <span className="ml-2">Filters</span>
              </button>
            </div>
            {selectedSchools.length > 0 && (
                <button
                onClick={handleCompareClick}
                className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition shadow-sm hover:shadow flex items-center font-medium whitespace-nowrap"
              >
                <span>Compare</span>
                <span className="ml-2 bg-white text-indigo-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  {selectedSchools.length}
                </span>
                </button>
            )}
          </div>
        </div>
      </header>
                {showFilterMenu && (
        <div className="absolute right-6 top-[73px] w-72 bg-white dark:bg-gray-700 rounded-lg shadow-xl p-5 z-40 border border-gray-100 dark:border-gray-600">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">FILTER BY</h3>
                    <div className="mb-5">
                      <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
                        <input
                          type="checkbox"
                          checked={filterOptions.hasVirtualTour}
                          onChange={() => setFilterOptions({
                            ...filterOptions,
                            hasVirtualTour: !filterOptions.hasVirtualTour
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5"
                        />
                        <span className="font-medium">Virtual Tour Available</span>
                      </label>
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
                          className="pl-9 pr-3 py-2.5 w-full text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
      <main className="flex-1 w-full overflow-hidden">
        <div className={`h-full overflow-auto transition-all duration-300 ease-in-out px-6 py-6 ${
          showProgramsPanel ? 'animate-content-slide' : 'animate-content-slide-back'
        }`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 overflow-y-auto border border-gray-100 dark:border-gray-700 h-[calc(100vh-140px)]">
            {!selectedProgram && filteredSchools.length === 0 ? (
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
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-max transition-all duration-300 ${showProgramsPanel ? 'grid-with-panel' : 'lg:grid-cols-3'}`}>
                    {filteredAndSearchedSchools.map((school, index) => {
                      const isSelected = selectedSchools.find((s) => s.schoolId === school.schoolId);
                      const schoolLogo = schoolLogos[school.schoolId];
                      const schoolBackground = getSchoolBackground(school.name);
                      
                      return (
                        <div
                          key={school.schoolId}
                          className={`relative bg-white dark:bg-gray-700 border rounded-xl transition-all duration-300 overflow-hidden ${getAnimationClass(index)} ${
                            isSelected ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200 dark:ring-indigo-800' : 'border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg hover:-translate-y-1'
                          }`}
                          style={{}}
                          onMouseEnter={(e) => handleMouseEnter(school, e)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleSchoolSelect(school)}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-1.5 rounded-full z-10 shadow-md">
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

                              {/* Logo positioned in the middle with white circle background */}
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <div className="rounded-full bg-white p-2 shadow-md">
                                  {schoolLogo ? (
                                    <img 
                                      src={schoolLogo} 
                                      alt={`${school.name} logo`}
                                      className="w-16 h-16 object-cover rounded-full"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full">
                                      <School className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Bottom half with school information */}
                            <div className="p-5 flex flex-col flex-1">
                              {/* School name centered */}
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center mb-4">{school.name}</h3>
                              
                              {/* School information */}
                              <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <MapPin className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                                  <span className="truncate">{school.location}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <Globe className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                                  <span>{school.type}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <BookOpen className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                                  <span>{school.programCount || "10"} Programs Offered</span>
                                </div>
                              </div>

                              {/* Virtual tour button */}
                              {school.virtualTourUrl && (
                                <a
                                  href={school.virtualTourUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 py-2.5 px-3 rounded-md transition-colors text-sm font-medium mt-auto"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Globe className="w-4 h-4 mr-2" />
                                  Take Virtual Tour
                                </a>
                              )}
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
                                  <div className="rounded-full border-4 border-indigo-100 dark:border-indigo-900 p-1">
                                    <img 
                                      src={schoolLogo} 
                                      alt={`${school.name} logo`}
                                      className="w-20 h-20 object-cover rounded-full"
                                    />
                                  </div>
                                ) : (
                                  <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full">
                                    <School className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
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
                                {school.virtualTourUrl && (
                                  <a
                                    href={school.virtualTourUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 py-3 px-4 rounded-lg transition-colors font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Globe className="w-5 h-5 mr-2" />
                                    Take Virtual Tour
                                  </a>
                                )}
                              </div>
                              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                  className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center font-medium ${
                                    selectedSchools.find(s => s.schoolId === school.schoolId) ? 
                                    'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30' : 
                                    'bg-gradient-to-r from-indigo-600 to-blue-500 text-white hover:opacity-90'
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSchoolSelect(school);
                                  }}
                                >
                                  {selectedSchools.find(s => s.schoolId === school.schoolId) ? (
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
    </div>
  );
};

export default AcademicExplorer;