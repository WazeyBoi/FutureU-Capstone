import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Info, School, BookOpen, MapPin, Globe, X, Search, ChevronRight, Star, StarOff, Filter, AlertCircle } from 'lucide-react';

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
          if (filtered.length === 0) {
              setFilteredSchools(schools);
              console.log("No specific schools found for this program, showing all schools");
            } else {
              setFilteredSchools(filtered);
            }
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
      const matchesSearch = searchTerm === '' || 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.description && school.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesVirtualTour = !filterOptions.hasVirtualTour || 
        (school.virtualTourUrl && school.virtualTourUrl.trim() !== '');
      
      const matchesLocation = filterOptions.locationSearch === '' ||
        (school.location && school.location.toLowerCase().includes(filterOptions.locationSearch.toLowerCase()));
      
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
                      <a
                        href={school.virtualTourUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 py-3 px-4 rounded-lg transition-colors font-medium"
                      >
                        <Globe className="w-5 h-5 mr-2" />
                        Take Virtual Tour
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            
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
      </div>
    );
  }

  return (
  <div className="h-screen w-full flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div 
        id="toast" 
        className="hidden fixed top-6 right-6 bg-red-100 dark:bg-red-900/80 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-xl z-50 animate-slide-in-right backdrop-blur-sm"
      >
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-3" />
          <p className="font-medium">You can compare up to 3 schools at a time</p>
        </div>
      </div>
      
      {/* Schools found toast notification */}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-gray-800 dark:text-white font-bold">
              <span className="text-2xl text-gray-900 dark:text-white">Academic Explorer</span>
            </div>
            
            <div className="flex flex-1 md:max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-5 w-5 text-indigo-500" />
                <input
                  type="text"
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm hover:shadow"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow"
                >
                  <Filter className="w-5 h-5 mr-2 text-indigo-500" />
                  Filters
                </button>
                
                {showFilterMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-700 rounded-lg shadow-xl p-5 z-40 border border-gray-100 dark:border-gray-600">
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
              </div>
              
              {selectedSchools.length > 0 && (
                <button
                  onClick={handleCompareClick}
                  className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition shadow-sm hover:shadow flex items-center font-medium"
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

      <main className="flex-1 w-full overflow-y-auto">
        <div className="w-full px-4 py-6 h-full">
        <div className="flex flex-col md:flex-row gap-8 h-full">
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sticky top-24 border border-gray-100 dark:border-gray-700">
                <h2 className="text-gray-900 dark:text-white font-bold text-lg mb-5 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Programs
                </h2>

                <div className="relative mb-5">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-indigo-500" />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearchTerm}
                    onChange={(e) => setProgramSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-sm"
                  />
                </div>

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
                  <div
                    className="space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800"
                    style={{ maxHeight: '400px' }}
                  >
                    {programs.length > 0 ?
                      programs
                        .filter((program) =>
                          program.programName.toLowerCase().includes(programSearchTerm.toLowerCase())
                        )
                        .map((program) => (
                          <button
                            key={program.programId}
                            className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${
                              selectedProgram === program.programId
                                ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 font-medium shadow-sm border border-indigo-100 dark:from-indigo-900/20 dark:to-blue-900/20 dark:border-indigo-800/30 dark:text-indigo-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                            onClick={() => {
                              setSelectedProgram(program.programId);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span>{program.programName}</span>
                              {selectedProgram === program.programId && (
                                <ChevronRight className="w-5 h-5 text-indigo-500" />
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

          <div className="flex-1 overflow-hidden flex flex-col">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedProgram
                    ? `Schools Offering ${
                        programs.find((p) => p.programId === selectedProgram)?.programName
                      }`
                    : filterOptions.locationSearch
                      ? `Schools in "${filterOptions.locationSearch}"`
                    : 'Select a Program to View Schools'}
                </h1>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex-1 overflow-y-auto border border-gray-100 dark:border-gray-700">
                {loading && selectedProgram ? (
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
                      {searchTerm 
                        ? 'Try adjusting your search term or filters' 
                        : filterOptions.locationSearch 
                          ? `No schools found matching location "${filterOptions.locationSearch}"`
                          : 'Select a program to view available schools'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSearchedSchools.map((school, index) => {
                      const isSelected = selectedSchools.find((s) => s.schoolId === school.schoolId);
                      const schoolLogo = schoolLogos[school.schoolId];

                      return (
                        <div
                          key={school.schoolId}
                          className={`relative bg-white dark:bg-gray-700 border rounded-xl transition-all duration-300 overflow-hidden ${getAnimationClass(index)} ${
                            isSelected
                              ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200 dark:ring-indigo-800'
                              : 'border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-lg hover:-translate-y-1'
                          }`}
                          onMouseEnter={(e) => handleMouseEnter(school, e)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleSchoolSelect(school)}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-1.5 rounded-full z-10 shadow-md">
                              <Star className="w-4 h-4" />
                            </div>
                          )}

                          <div className="p-6">
                            <div className="flex flex-col items-center mb-5">
                              {schoolLogo ? (
                                <div className="rounded-full border-4 border-indigo-100 dark:border-indigo-900 p-1 shadow-md mb-4">
                                <img 
                                  src={schoolLogo} 
                                  alt={`${school.name} logo`}
                                    className="w-24 h-24 object-cover rounded-full"
                                />
                                </div>
                              ) : (
                                <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-full mb-4 shadow-inner">
                                  <School className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                                </div>
                              )}
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white text-center">{school.name}</h3>
                            </div>

                            <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
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
                                <span>{school.programCount} Programs</span>
                              </div>
                              
                              {school.virtualTourUrl && (
                                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                  <a
                                    href={school.virtualTourUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 py-2 px-3 rounded-md transition-colors text-sm font-medium"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Virtual Tour Available
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {tooltipVisible && hoveredSchool?.schoolId === school.schoolId && (
                            <div 
                              className="fixed z-50 w-[400px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-6 transform transition-all duration-200 ease-in-out backdrop-blur-sm bg-white/95 dark:bg-gray-800/95"
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcademicExplorer;